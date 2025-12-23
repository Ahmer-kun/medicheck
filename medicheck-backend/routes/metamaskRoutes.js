import express from "express";
import MetaMaskController from "../controllers/metamaskController.js";
import { auth, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get sign message for a company
router.get("/sign-message/:companyType/:companyId", 
  authorize('manufacturer', 'pharmacy', 'admin'), 
  MetaMaskController.getSignMessage
);

// Verify signature and link MetaMask
router.post("/verify-link", 
  authorize('manufacturer', 'pharmacy', 'admin'), 
  MetaMaskController.verifyAndLinkMetaMask
);

// Disconnect MetaMask
router.post("/disconnect", 
  authorize('manufacturer', 'pharmacy', 'admin'), 
  MetaMaskController.disconnectMetaMask
);

export default router;