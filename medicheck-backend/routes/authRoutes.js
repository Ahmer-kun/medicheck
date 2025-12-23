// import express from "express";
// import { login, initializeUsers } from "../controllers/authController.js";
// import { authValidation, validate } from "../middleware/validation.js";

// const router = express.Router();

// router.post("/login", validate(authValidation.login), login);

// router.post("/initialize-users", async (req, res) => {
//   try {
//     await initializeUsers();
//     res.json({ message: "Default users initialized successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error initializing users", error: error.message });
//   }
// });

// export default router;

import express from "express";
import { 
  login, 
  initializeUsers, 
  registerViewer,  // Add this import
  refreshToken     // Add this if you need it
} from "../controllers/authController.js";
import { 
  authValidation, 
  viewerRegistrationValidation,  // Add this import
  validate 
} from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.post("/login", validate(authValidation.login), login);
// In authRoutes.js
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

// Add logout route if needed
router.post("/logout", (req, res) => {
  res.json({ 
    success: true, 
    message: "Logout successful" 
  });
});

export default router;