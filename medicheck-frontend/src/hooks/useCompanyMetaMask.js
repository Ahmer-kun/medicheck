import { useState } from "react";
import { api } from "../utils/api";

export const useCompanyMetaMask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectedCompany, setConnectedCompany] = useState(null);

  /**
   * Link MetaMask to company
   */
  const linkMetaMaskToCompany = async (companyId, companyType, metamaskAccount) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get sign message from backend
      const messageResponse = await api.get(
        `/metamask/sign-message/${companyType}/${companyId}`
      );

      if (!messageResponse.success) {
        throw new Error(messageResponse.message || "Failed to get sign message");
      }

      const { message, timestamp } = messageResponse.data;

      // 2. Sign message with MetaMask
      const provider = window.ethereum;
      if (!provider) {
        throw new Error("MetaMask not installed");
      }

      const signature = await provider.request({
        method: "personal_sign",
        params: [message, metamaskAccount],
      });

      // 3. Send signature to backend for verification and linking
      const linkResponse = await api.post("/metamask/verify-link", {
        companyId,
        companyType,
        address: metamaskAccount,
        signature,
        message,
        timestamp
      });

      if (!linkResponse.success) {
        throw new Error(linkResponse.message || "Linking failed");
      }

      setConnectedCompany(linkResponse.data);
      return linkResponse.data;

    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Disconnect MetaMask from company
   */
  const disconnectMetaMaskFromCompany = async (companyId, companyType) => {
    try {
      setLoading(true);
      
      const response = await api.post("/metamask/disconnect", {
        companyId,
        companyType
      });

      if (response.success) {
        setConnectedCompany(null);
      }

      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if company has MetaMask connected
   */
  const checkCompanyMetaMaskStatus = async (companyId, companyType) => {
    try {
      setLoading(true);
      
      // Call appropriate endpoint based on company type
      const endpoint = companyType === 'manufacturer' 
        ? `/manufacturer-companies/${companyId}/metamask-status`
        : `/pharmacy-companies/${companyId}/metamask-status`;
      
      const response = await api.get(endpoint);
      
      if (response.success) {
        setConnectedCompany(response.data);
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    connectedCompany,
    linkMetaMaskToCompany,
    disconnectMetaMaskFromCompany,
    checkCompanyMetaMaskStatus,
    clearError: () => setError(null)
  };
};