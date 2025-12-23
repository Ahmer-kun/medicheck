// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MedicineTracker {
    struct Medicine {
        string batchNo;
        string name;
        string medicineName;
        string manufactureDate;
        string expiryDate;
        string formulation;
        uint256 quantity;
        string manufacturer;
        string pharmacy;
        string packaging;
        string status;
        address currentOwner;
        uint256 timestamp;
        bool exists;
        bool verified;
        address verifiedBy;
        uint256 verifiedAt;
    }
    
    struct Transfer {
        address from;
        address to;
        uint256 timestamp;
        string transactionType;
        string metadata;
    }
    
    mapping(string => Medicine) public medicines;
    mapping(string => Transfer[]) public medicineTransfers;
    string[] public batchNumbers;
    address public owner;
    
    event MedicineRegistered(
        string batchNo,
        string name,
        string medicineName,
        string manufactureDate,
        string expiryDate,
        string formulation,
        uint256 quantity,
        string manufacturer,
        string pharmacy,
        string packaging,
        string status
    );
    
    event MedicineUpdated(
        string batchNo,
        string status,
        string pharmacy,
        uint256 quantity
    );
    
    event MedicineTransferred(
        string batchNo,
        address from,
        address to,
        string transactionType,
        string metadata
    );
    
    event MedicineVerified(
        string batchNo,
        address verifiedBy,
        uint256 timestamp
    );
    
    constructor() {
        owner = msg.sender;
    }
    
    // Enhanced registration with all 11 parameters
    function registerMedicine(
        string memory _batchNo,
        string memory _name,
        string memory _medicineName,
        string memory _manufactureDate,
        string memory _expiryDate,
        string memory _formulation,
        uint256 _quantity,
        string memory _manufacturer,
        string memory _pharmacy,
        string memory _packaging,
        string memory _status
    ) public {
        require(!medicines[_batchNo].exists, "Medicine batch already exists");
        
        medicines[_batchNo] = Medicine({
            batchNo: _batchNo,
            name: _name,
            medicineName: _medicineName,
            manufactureDate: _manufactureDate,
            expiryDate: _expiryDate,
            formulation: _formulation,
            quantity: _quantity,
            manufacturer: _manufacturer,
            pharmacy: _pharmacy,
            packaging: _packaging,
            status: _status,
            currentOwner: msg.sender,
            timestamp: block.timestamp,
            exists: true,
            verified: false,
            verifiedBy: address(0),
            verifiedAt: 0
        });
        
        batchNumbers.push(_batchNo);
        
        // Record initial transfer
        medicineTransfers[_batchNo].push(Transfer({
            from: address(0),
            to: msg.sender,
            timestamp: block.timestamp,
            transactionType: "Manufactured",
            metadata: ""
        }));
        
        emit MedicineRegistered(
            _batchNo,
            _name,
            _medicineName,
            _manufactureDate,
            _expiryDate,
            _formulation,
            _quantity,
            _manufacturer,
            _pharmacy,
            _packaging,
            _status
        );
    }
    
    // Update medicine details
    function updateMedicine(
        string memory _batchNo,
        string memory _status,
        string memory _pharmacy,
        uint256 _quantity
    ) public {
        require(medicines[_batchNo].exists, "Medicine does not exist");
        require(medicines[_batchNo].currentOwner == msg.sender, "Not the current owner");
        
        medicines[_batchNo].status = _status;
        medicines[_batchNo].pharmacy = _pharmacy;
        medicines[_batchNo].quantity = _quantity;
        
        emit MedicineUpdated(_batchNo, _status, _pharmacy, _quantity);
    }
    
    function transferMedicine(
        string memory _batchNo,
        address _to,
        string memory _transactionType,
        string memory _metadata
    ) public {
        require(medicines[_batchNo].exists, "Medicine does not exist");
        require(medicines[_batchNo].currentOwner == msg.sender, "Not the current owner");
        
        medicines[_batchNo].currentOwner = _to;
        
        medicineTransfers[_batchNo].push(Transfer({
            from: msg.sender,
            to: _to,
            timestamp: block.timestamp,
            transactionType: _transactionType,
            metadata: _metadata
        }));
        
        emit MedicineTransferred(_batchNo, msg.sender, _to, _transactionType, _metadata);
    }
    
    function verifyMedicine(string memory _batchNo) public {
        require(medicines[_batchNo].exists, "Medicine does not exist");
        require(!medicines[_batchNo].verified, "Medicine already verified");
        
        medicines[_batchNo].verified = true;
        medicines[_batchNo].verifiedBy = msg.sender;
        medicines[_batchNo].verifiedAt = block.timestamp;
        
        emit MedicineVerified(_batchNo, msg.sender, block.timestamp);
    }
    
    // Get complete medicine data - Returns all 16 fields
    function getMedicine(string memory _batchNo) public view returns (
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        uint256,
        string memory,
        string memory,
        string memory,
        string memory,
        address,
        uint256,
        bool,
        address,
        uint256
    ) {
        require(medicines[_batchNo].exists, "Medicine does not exist");
        Medicine memory med = medicines[_batchNo];
        return (
            med.batchNo,
            med.name,
            med.medicineName,
            med.manufactureDate,
            med.expiryDate,
            med.formulation,
            med.quantity,
            med.manufacturer,
            med.pharmacy,
            med.packaging,
            med.status,
            med.currentOwner,
            med.timestamp,
            med.verified,
            med.verifiedBy,
            med.verifiedAt
        );
    }
    
    function getMedicineHistory(string memory _batchNo) public view returns (Transfer[] memory) {
        require(medicines[_batchNo].exists, "Medicine does not exist");
        return medicineTransfers[_batchNo];
    }
    
    function verifyMedicineExistence(string memory _batchNo) public view returns (bool) {
        return medicines[_batchNo].exists;
    }
    
    function getMedicineVerificationStatus(string memory _batchNo) public view returns (bool, address, uint256) {
        require(medicines[_batchNo].exists, "Medicine does not exist");
        Medicine memory med = medicines[_batchNo];
        return (med.verified, med.verifiedBy, med.verifiedAt);
    }
    
    // Get all batch numbers (for synchronization)
    function getAllBatchNumbers() public view returns (string[] memory) {
        return batchNumbers;
    }
}