import express from "express";
import { 
  login, 
  initializeUsers, 
  registerViewer,  
  refreshToken     
} from "../controllers/authController.js";
import { 
  authValidation, 
  viewerRegistrationValidation,  
  validate 
} from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.post("/login", validate(authValidation.login), login);
// router.post("/refresh-token", validate(authValidation.refreshToken), refreshToken);
router.post("/register-viewer", validate(viewerRegistrationValidation), registerViewer);

// Development route to initialize users
router.post("/initialize-users", async (req, res) => {
  try {
    await initializeUsers();
    res.json({ 
      success: true, 
      message: "Default users initialized successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error initializing users", 
      error: error.message 
    });
  }
});

// Logout route if needed
router.post("/logout", (req, res) => {
  res.json({ 
    success: true, 
    message: "Logout successful" 
  });
});

export default router;