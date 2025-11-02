// MedicineTracker.sol - Simple Smart Contract
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicineTracker {
    struct Medicine {
        string batchNo;
        string name;
        string manufactureDate;
        string expiryDate;
        string formulation;
        uint256 quantity;
        address manufacturer;
        uint256 timestamp;
        bool exists;
    }
    
    mapping(string => Medicine) public medicines;
    string[] public batchNumbers;
    address public owner;
    
    event MedicineRegistered(
        string batchNo,
        string name,
        string manufactureDate,
        string expiryDate,
        string formulation,
        uint256 quantity,
        address manufacturer
    );
    
    constructor() {
        owner = msg.sender;
    }
    
    function registerMedicine(
        string memory _batchNo,
        string memory _name,
        string memory _manufactureDate,
        string memory _expiryDate,
        string memory _formulation,
        uint256 _quantity
    ) public {
        require(!medicines[_batchNo].exists, "Medicine batch already exists");
        
        medicines[_batchNo] = Medicine({
            batchNo: _batchNo,
            name: _name,
            manufactureDate: _manufactureDate,
            expiryDate: _expiryDate,
            formulation: _formulation,
            quantity: _quantity,
            manufacturer: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        batchNumbers.push(_batchNo);
        
        emit MedicineRegistered(
            _batchNo,
            _name,
            _manufactureDate,
            _expiryDate,
            _formulation,
            _quantity,
            msg.sender
        );
    }
    
    function getMedicine(string memory _batchNo) public view returns (
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        uint256,
        address,
        uint256
    ) {
        require(medicines[_batchNo].exists, "Medicine does not exist");
        Medicine memory med = medicines[_batchNo];
        return (
            med.batchNo,
            med.name,
            med.manufactureDate,
            med.expiryDate,
            med.formulation,
            med.quantity,
            med.manufacturer,
            med.timestamp
        );
    }
    
    function verifyMedicine(string memory _batchNo) public view returns (bool) {
        return medicines[_batchNo].exists;
    }
}