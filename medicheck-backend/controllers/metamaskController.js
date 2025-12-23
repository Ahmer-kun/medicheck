import ManufacturerCompany from "../models/ManufacturerCompany.js";
import PharmacyCompany from "../models/PharmacyCompany.js";
import { ethers } from "ethers";

class MetaMaskController {
  /**
   * Verify MetaMask signature and link to company
   */
  async verifyAndLinkMetaMask(req, res) {
    try {
      const { 
        companyId, 
        companyType, // 'manufacturer' or 'pharmacy'
        address, 
        signature, 
        message 
      } = req.body;

      // Validate inputs
      if (!companyId || !companyType || !address || !signature) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields"
        });
      }

      // Validate Ethereum address
      if (!ethers.isAddress(address)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Ethereum address"
        });
      }

      // Find the company
      let company;
      if (companyType === 'manufacturer') {
        company = await ManufacturerCompany.findById(companyId);
      } else if (companyType === 'pharmacy') {
        company = await PharmacyCompany.findById(companyId);
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid company type"
        });
      }

      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found"
        });
      }

      // Verify signature
      const isSignatureValid = await this.verifySignature(
        message || `Link ${companyType} company: ${company.companyName || company.name}`,
        signature,
        address
      );

      if (!isSignatureValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid signature"
        });
      }

      // Update company with MetaMask data
      company.blockchainAddress = address.toLowerCase();
      company.metamaskConnected = true;
      company.metamaskConnectionData = {
        connectedAt: new Date(),
        lastVerified: new Date(),
        connectionMethod: 'metamask',
        verified: true,
        signature: signature
      };

      await company.save();

      res.json({
        success: true,
        message: "MetaMask wallet linked successfully",
        data: {
          companyId: company._id,
          companyName: company.companyName || company.name,
          blockchainAddress: company.blockchainAddress,
          connectedAt: company.metamaskConnectionData.connectedAt
        }
      });

    } catch (error) {
      console.error("MetaMask linking error:", error);
      res.status(500).json({
        success: false,
        message: "Error linking MetaMask wallet",
        error: error.message
      });
    }
  }

  /**
   * Verify Ethereum signature
   */
  async verifySignature(message, signature, address) {
    try {
      // Recover the address from the signature
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      // Compare with the provided address (case-insensitive)
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error("Signature verification error:", error);
      return false;
    }
  }

  /**
   * Generate a unique message for signing
   */
  generateSignMessage(companyName, companyId, timestamp) {
    return `
I hereby verify and link my MetaMask wallet to ${companyName}.

Company ID: ${companyId}
Timestamp: ${timestamp}
Nonce: ${Math.random().toString(36).substring(2, 15)}

This signature will link my wallet to the company for blockchain operations.
    `.trim();
  }

  /**
   * Get message for signing (frontend calls this)
   */
  async getSignMessage(req, res) {
    try {
      const { companyId, companyType } = req.params;

      let company;
      if (companyType === 'manufacturer') {
        company = await ManufacturerCompany.findById(companyId);
      } else if (companyType === 'pharmacy') {
        company = await PharmacyCompany.findById(companyId);
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid company type"
        });
      }

      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found"
        });
      }

      const timestamp = new Date().toISOString();
      const message = this.generateSignMessage(
        company.companyName || company.name,
        companyId,
        timestamp
      );

      res.json({
        success: true,
        message: message,
        timestamp: timestamp,
        companyName: company.companyName || company.name
      });

    } catch (error) {
      console.error("Error generating sign message:", error);
      res.status(500).json({
        success: false,
        message: "Error generating sign message",
        error: error.message
      });
    }
  }

  /**
   * Disconnect MetaMask from company
   */
  async disconnectMetaMask(req, res) {
    try {
      const { companyId, companyType } = req.body;

      let company;
      if (companyType === 'manufacturer') {
        company = await ManufacturerCompany.findById(companyId);
      } else if (companyType === 'pharmacy') {
        company = await PharmacyCompany.findById(companyId);
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid company type"
        });
      }

      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found"
        });
      }

      // Clear MetaMask connection
      company.blockchainAddress = "";
      company.metamaskConnected = false;
      company.metamaskConnectionData = {
        disconnectedAt: new Date()
      };

      await company.save();

      res.json({
        success: true,
        message: "MetaMask disconnected successfully",
        data: {
          companyId: company._id,
          companyName: company.companyName || company.name,
          disconnectedAt: new Date()
        }
      });

    } catch (error) {
      console.error("MetaMask disconnect error:", error);
      res.status(500).json({
        success: false,
        message: "Error disconnecting MetaMask",
        error: error.message
      });
    }
  }
}

export default new MetaMaskController();