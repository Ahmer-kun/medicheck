/**
 * Validates batch registration form data
 * @param {Object} batch - Batch data to validate
 * @returns {Object} Validation result with isValid boolean and errors object
 */
export const validateBatch = (batch) => {
  const errors = {};
  
  // Required fields validation
  if (!batch.batchNo?.trim()) {
    errors.batchNo = "Batch number is required";
  } else if (batch.batchNo.length < 3) {
    errors.batchNo = "Batch number must be at least 3 characters";
  } else if (!/^[A-Za-z0-9\-_]+$/.test(batch.batchNo)) {
    errors.batchNo = "Batch number can only contain letters, numbers, hyphens, and underscores";
  }
  
  if (!batch.name?.trim()) {
    errors.name = "Medicine name is required";
  } else if (batch.name.length < 2) {
    errors.name = "Medicine name must be at least 2 characters";
  }
  
  if (!batch.manufactureDate) {
    errors.manufactureDate = "Manufacture date is required";
  } else {
    const manufactureDate = new Date(batch.manufactureDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (manufactureDate > today) {
      errors.manufactureDate = "Manufacture date cannot be in the future";
    }
  }
  
  if (!batch.expiry) {
    errors.expiry = "Expiry date is required";
  } else if (batch.manufactureDate) {
    const manufactureDate = new Date(batch.manufactureDate);
    const expiryDate = new Date(batch.expiry);
    
    if (expiryDate <= manufactureDate) {
      errors.expiry = "Expiry date must be after manufacture date";
    } else if (expiryDate <= new Date()) {
      errors.expiry = "Expiry date must be in the future";
    }
  }
  
  if (!batch.formulation?.trim()) {
    errors.formulation = "Formulation is required";
  } else if (batch.formulation.length < 5) {
    errors.formulation = "Formulation must be at least 5 characters";
  }
  
  if (!batch.quantity || batch.quantity <= 0) {
    errors.quantity = "Valid quantity is required";
  } else if (batch.quantity > 1000000) {
    errors.quantity = "Quantity seems too large (max 1,000,000)";
  } else if (!Number.isInteger(Number(batch.quantity))) {
    errors.quantity = "Quantity must be a whole number";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates login credentials
 * @param {Object} credentials - Login credentials
 * @returns {Object} Validation result with isValid boolean and errors object
 */
export const validateLogin = (credentials) => {
  const errors = {};
  
  if (!credentials.username?.trim()) {
    errors.username = "Username is required";
  } else if (credentials.username.length < 3) {
    errors.username = "Username must be at least 3 characters";
  }
  
  if (!credentials.password) {
    errors.password = "Password is required";
  } else if (credentials.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates batch search/verification input
 * @param {string} input - Batch number or search term
 * @returns {Object} Validation result with isValid boolean and errors object
 */
export const validateBatchSearch = (input) => {
  const errors = {};
  
  if (!input?.trim()) {
    errors.search = "Batch number or search term is required";
  } else if (input.length < 2) {
    errors.search = "Please enter at least 2 characters";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};