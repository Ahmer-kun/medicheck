import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { api } from '../utils/api';

function ExcelImportModal({ 
  isOpen, 
  onClose, 
  manufacturerName, 
  companyId, 
  onImportSuccess 
}) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Importing
  const [mapping, setMapping] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);

  const defaultMappings = {
    'Medicine Name': 'medicineName',
    'Batch Number': 'batchNo',
    'Formulation': 'formulation',
    'Manufacture Date': 'manufactureDate',
    'Expiry Date': 'expiryDate',
    'Quantity': 'quantity',
    'Pack Size': 'packSize'
  };

  const requiredFields = ['medicineName', 'batchNo', 'quantity', 'expiryDate'];

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    parseExcelFile(uploadedFile);
  };

  // Helper function to detect empty rows
  const isRowEmpty = (row) => {
    return !Object.keys(row).some(key => {
      if (key === '_rowNumber') return false;
      const value = row[key];
      if (value === null || value === undefined) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      return true;
    });
  };

  const parseExcelFile = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      console.log('Raw Excel data length:', jsonData.length);
      
      // Extract headers (first row)
      const headers = jsonData[0] || [];
      console.log('Headers found:', headers);
      
      // Extract data (subsequent rows)
      const rows = jsonData.slice(1).map((row, index) => {
        const rowObj = {};
        headers.forEach((header, colIndex) => {
          if (header && header.trim() !== '') {
            rowObj[header] = row[colIndex] !== undefined ? row[colIndex] : '';
          }
        });
        return { ...rowObj, _rowNumber: index + 2 }; // +2 for Excel row numbers
      });

      console.log('All rows before filtering:', rows.length);
      
      // Filter out completely empty rows
      const nonEmptyRows = rows.filter(row => !isRowEmpty(row));
      
      console.log('Non-empty rows after filtering:', nonEmptyRows.length);
      console.log('Sample non-empty row:', nonEmptyRows[0]);

      if (nonEmptyRows.length === 0) {
        alert('No valid data found in the Excel file. Please check that the file has data starting from row 2.');
        resetForm();
        return;
      }

      setPreviewData(nonEmptyRows);
      
      // Auto-map headers based on common patterns
      const autoMapping = {};
      headers.forEach(header => {
        if (header && header.trim() !== '') {
          const headerLower = header.toLowerCase().trim();
          Object.entries(defaultMappings).forEach(([displayName, fieldName]) => {
            const displayLower = displayName.toLowerCase().replace(/\s+/g, '');
            if (headerLower.includes(displayLower) || displayLower.includes(headerLower)) {
              autoMapping[header] = fieldName;
            }
          });
        }
      });

      console.log('Auto-mapping:', autoMapping);
      setMapping(autoMapping);
      setStep(2); // Move to preview step
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      alert('Error reading Excel file. Please try again.');
    };

    reader.readAsBinaryString(file);
  };

  const validateData = (data) => {
    const errors = [];
    
    // First filter out completely empty rows
    const validData = data.filter(row => !isRowEmpty(row));
    
    console.log('Valid data for validation:', validData.length, 'rows');
    
    validData.forEach((row, index) => {
      const rowNumber = row._rowNumber;
      
      // Check required fields
      requiredFields.forEach(field => {
        const mappedHeader = Object.keys(mapping).find(key => mapping[key] === field);
        if (!mappedHeader || !row[mappedHeader]) {
          errors.push({
            row: rowNumber,
            field: field,
            message: `${field} is required (column: ${mappedHeader || 'Not mapped'})`
          });
        }
      });

      // Validate batch number format
      const batchNoHeader = Object.keys(mapping).find(key => mapping[key] === 'batchNo');
      if (batchNoHeader && row[batchNoHeader]) {
        const batchNo = String(row[batchNoHeader]).trim();
        if (batchNo.length < 3) {
          errors.push({
            row: rowNumber,
            field: 'batchNo',
            message: 'Batch number must be at least 3 characters'
          });
        }
      }

      // Validate quantity
      const quantityHeader = Object.keys(mapping).find(key => mapping[key] === 'quantity');
      if (quantityHeader && row[quantityHeader]) {
        const quantity = parseInt(row[quantityHeader]);
        if (isNaN(quantity) || quantity <= 0) {
          errors.push({
            row: rowNumber,
            field: 'quantity',
            message: 'Quantity must be a positive number'
          });
        }
      }

      // Validate dates
      const mfgDateHeader = Object.keys(mapping).find(key => mapping[key] === 'manufactureDate');
      const expiryDateHeader = Object.keys(mapping).find(key => mapping[key] === 'expiryDate');
      
      if (mfgDateHeader && row[mfgDateHeader]) {
        const mfgDate = parseExcelDate(row[mfgDateHeader]);
        if (!mfgDate || isNaN(mfgDate.getTime())) {
          errors.push({
            row: rowNumber,
            field: 'manufactureDate',
            message: 'Invalid manufacture date format'
          });
        }
      }
      
      if (expiryDateHeader && row[expiryDateHeader]) {
        const expiryDate = parseExcelDate(row[expiryDateHeader]);
        if (!expiryDate || isNaN(expiryDate.getTime())) {
          errors.push({
            row: rowNumber,
            field: 'expiryDate',
            message: 'Invalid expiry date format'
          });
        }
      }
      
      // Check date order if both dates exist
      if (mfgDateHeader && expiryDateHeader && row[mfgDateHeader] && row[expiryDateHeader]) {
        const mfgDate = parseExcelDate(row[mfgDateHeader]);
        const expiryDate = parseExcelDate(row[expiryDateHeader]);
        
        if (mfgDate && expiryDate && !isNaN(mfgDate.getTime()) && !isNaN(expiryDate.getTime())) {
          if (expiryDate <= mfgDate) {
            errors.push({
              row: rowNumber,
              field: 'expiryDate',
              message: 'Expiry date must be after manufacture date'
            });
          }
        }
      }
    });

    console.log('Validation errors:', errors.length);
    return errors;
  };

  const handleImport = async () => {
    // Filter out empty rows first
    const validData = previewData.filter(row => !isRowEmpty(row));
    
    if (validData.length === 0) {
      alert('No valid data to import. All rows appear to be empty.');
      return;
    }
    
    console.log('Importing valid data:', validData.length, 'rows');
    
    const errors = validateData(validData);
    setValidationErrors(errors);
    
    if (errors.length > 0) {
      alert(`Found ${errors.length} validation error(s). Please fix them before importing.`);
      return;
    }

    setLoading(true);
    setStep(3);

    try {
      const formattedData = validData.map(row => {
        const formattedRow = {
          manufacturer: manufacturerName,
          companyId: companyId
        };

        // Map data according to mapping
        Object.keys(mapping).forEach(header => {
          const fieldName = mapping[header];
          let value = row[header];
          
          if (value === undefined || value === null || value === '') return;
          
          // Special handling for dates
          if (fieldName === 'manufactureDate' || fieldName === 'expiryDate') {
            const parsedDate = parseExcelDate(value);
            if (parsedDate && !isNaN(parsedDate.getTime())) {
              value = parsedDate.toISOString().split('T')[0];
            } else {
              // If parsing fails, keep original but log warning
              console.warn(`Could not parse date: ${value}`);
              value = String(value).trim();
            }
          }
          
          // Convert quantity to number
          if (fieldName === 'quantity') {
            const numValue = Number(value);
            value = isNaN(numValue) ? 0 : Math.max(0, numValue);
          }
          
          // Trim strings
          if (typeof value === 'string') {
            value = value.trim();
          }
          
          formattedRow[fieldName] = value;
        });

        return formattedRow;
      }).filter(row => row.batchNo && row.medicineName); // Filter out rows without essential data

      console.log('Sending import data:', {
        count: formattedData.length,
        manufacturerCompanyId: companyId,
        sampleData: formattedData.slice(0, 2)
      });

      // Send to backend
      const response = await api.post('/batches/import-excel', {
        batches: formattedData,
        manufacturerCompanyId: companyId
      });

      console.log('Import response:', response);

      if (response.success) {
        onImportSuccess(response);
        onClose();
        alert(`✅ Successfully imported ${response.importedCount || formattedData.length} batch(es)!`);
      } else {
        throw new Error(response.message || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert(`❌ Import failed: ${error.message || 'Unknown error'}`);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const parseExcelDate = (dateValue) => {
    if (!dateValue) return null;
    
    // If it's already a Date object
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    // If it's a number (Excel serial date)
    if (typeof dateValue === 'number') {
      // Excel dates start from December 30, 1899
      const excelEpoch = new Date(1899, 11, 30);
      return new Date(excelEpoch.getTime() + dateValue * 86400000);
    }
    
    // If it's a string
    if (typeof dateValue === 'string') {
      // Try different date formats
      
      // Format: MM/DD/YYYY (6/30/2025)
      const mmddyyyy = dateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (mmddyyyy) {
        const month = parseInt(mmddyyyy[1]) - 1;
        const day = parseInt(mmddyyyy[2]);
        const year = parseInt(mmddyyyy[3]);
        return new Date(year, month, day);
      }
      
      // Format: DD/MM/YYYY
      const ddmmyyyy = dateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (ddmmyyyy) {
        const day = parseInt(ddmmyyyy[1]);
        const month = parseInt(ddmmyyyy[2]) - 1;
        const year = parseInt(ddmmyyyy[3]);
        return new Date(year, month, day);
      }
      
      // Format: YYYY-MM-DD (already ISO)
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return new Date(dateValue);
      }
      
      // Try Date.parse as fallback
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    
    return null;
  };

  const handleMappingChange = (header, field) => {
    setMapping(prev => ({
      ...prev,
      [header]: field
    }));
  };

  const resetForm = () => {
    setFile(null);
    setPreviewData([]);
    setStep(1);
    setValidationErrors([]);
    setMapping({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const uploadedFile = files[0];
      if (uploadedFile.type.includes('excel') || uploadedFile.type.includes('spreadsheet') || 
          uploadedFile.name.match(/\.(xlsx|xls)$/i)) {
        setFile(uploadedFile);
        parseExcelFile(uploadedFile);
      } else {
        alert('Please upload an Excel file (.xlsx or .xls)');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {step === 1 && 'Import from Excel'}
            {step === 2 && 'Preview & Map Fields'}
            {step === 3 && 'Importing...'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {/* Step 1: Upload File */}
        {step === 1 && (
          <div className="text-center p-8">
            <div className="text-6xl mb-4">📊</div>
            <h4 className="text-xl font-semibold text-gray-800 mb-4">
              Import Medicine Batches from Excel
            </h4>
            <p className="text-gray-600 mb-6">
              Upload an Excel file (.xlsx or .xls) with your medicine batch data.
              <br />
              File will be imported for: <strong>{manufacturerName}</strong>
            </p>

            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 mb-6 hover:border-blue-500 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="text-4xl mb-4">📁</div>
              <p className="text-gray-700 mb-4">Drag & drop your Excel file here</p>
              <p className="text-gray-500 text-sm mb-4">OR</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="excel-file-input"
              />
              <label
                htmlFor="excel-file-input"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors inline-block"
              >
                Browse Files
              </label>
              
              {file && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="font-medium">{file.name}</span>
                    <span className="text-gray-500 text-sm">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-left bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-2">File Format Requirements:</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• First row should contain column headers</li>
                <li>• Required columns: Medicine Name, Batch Number, Quantity, Expiry Date</li>
                <li>• Supported date formats: YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY</li>
                <li>• Empty rows will be automatically filtered out</li>
                <li>• Download <a 
                  href="/templates/medicine-batch-template.xlsx" 
                  className="text-blue-600 underline font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    // Create and download template
                    const templateData = [
                      ['Medicine Name', 'Batch Number', 'Formulation', 'Manufacture Date', 'Expiry Date', 'Quantity', 'Pack Size']
                    ];
                    const ws = XLSX.utils.aoa_to_sheet(templateData);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Template');
                    XLSX.writeFile(wb, 'medicine-batch-template.xlsx');
                  }}
                >template file</a></li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 2: Preview & Mapping */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                Map Excel Columns to Database Fields
              </h4>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {previewData[0] && Object.keys(previewData[0]).filter(k => k !== '_rowNumber').map(header => (
                  <div key={header} className="bg-gray-50 p-3 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      "{header}"
                    </label>
                    <select
                      value={mapping[header] || ''}
                      onChange={(e) => handleMappingChange(header, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Select field...</option>
                      <option value="medicineName">Medicine Name</option>
                      <option value="batchNo">Batch Number</option>
                      <option value="formulation">Formulation</option>
                      <option value="manufactureDate">Manufacture Date</option>
                      <option value="expiryDate">Expiry Date</option>
                      <option value="quantity">Quantity</option>
                      <option value="packSize">Pack Size</option>
                    </select>
                    {mapping[header] && requiredFields.includes(mapping[header]) && (
                      <span className="text-xs text-red-500 mt-1">Required</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Data Preview */}
              <div className="mb-6">
                <h5 className="font-semibold text-gray-800 mb-2">
                  Data Preview ({previewData.length} rows)
                </h5>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Row</th>
                        {previewData[0] && Object.keys(previewData[0]).filter(k => k !== '_rowNumber').map(header => (
                          <th key={header} className="px-4 py-2 text-left">
                            <div className="font-medium">{header}</div>
                            <div className="text-xs text-blue-600">
                              {mapping[header] ? `→ ${mapping[header]}` : 'Not mapped'}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.slice(0, 10).map((row, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 font-mono text-gray-500">#{row._rowNumber}</td>
                          {Object.keys(row).filter(k => k !== '_rowNumber').map(header => (
                            <td key={header} className="px-4 py-2">
                              <div className={`${mapping[header] && requiredFields.includes(mapping[header]) && !row[header] ? 'text-red-500' : ''}`}>
                                {row[header] === '' ? <span className="text-gray-400">(empty)</span> : String(row[header])}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                      {previewData.length > 10 && (
                        <tr>
                          <td colSpan={Object.keys(previewData[0]).filter(k => k !== '_rowNumber').length + 1} className="px-4 py-2 text-center text-gray-500 text-sm">
                            ... and {previewData.length - 10} more rows
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h5 className="font-semibold text-red-800 mb-2">
                    ❌ Validation Errors ({validationErrors.length})
                  </h5>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {validationErrors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700">
                        Row {error.row}: {error.field} - {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleImport}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span>📥</span>
                  Import {previewData.length} Batch(es)
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Upload Different File
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Importing */}
        {step === 3 && (
          <div className="text-center p-8">
            <div className="text-6xl mb-4 animate-pulse">⏳</div>
            <h4 className="text-xl font-semibold text-gray-800 mb-4">
              Importing {previewData.length} Batches
            </h4>
            <p className="text-gray-600 mb-6">
              Please wait while we process your data...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: loading ? '75%' : '100%' }}
              ></div>
            </div>
            <p className="text-gray-500 text-sm">
              Registering batches on blockchain and updating database
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExcelImportModal;