import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Username and password are required" 
      });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Return user data (without password)
    const userResponse = {
      id: user._id,
      username: user.username,
      role: user.role,
      name: user.name || user.username
    };

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userResponse
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during login" 
    });
  }
};

export const initializeUsers = async () => {
  try {
    const existing = await User.countDocuments();
    if (existing > 0) {
      console.log("ℹ️ Users already exist — skipping initialization");
      return;
    }

    const defaultUsers = [
      { username: "admin", password: await bcrypt.hash("admin123", 10), role: "admin", name: "System Administrator" },
      { username: "pharmacist", password: await bcrypt.hash("pharma123", 10), role: "pharmacy", name: "Pharmacy Manager" },
      { username: "manufacturer", password: await bcrypt.hash("manu123", 10), role: "manufacturer", name: "Manufacturing Head" },
      { username: "viewer", password: await bcrypt.hash("view123", 10), role: "viewer", name: "Quality Viewer" },
      { username: "analytics", password: await bcrypt.hash("analytics123", 10), role: "analytics", name: "Data Analyst" },
    ];

    await User.insertMany(defaultUsers);
    console.log("✅ Default users initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing default users:", error.message);
  }
};

// import User from "../models/User.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// /* --------------------------------------------
//    🧍 Register
// -------------------------------------------- */
// export const registerUser = async (req, res) => {
//   const { username, password, role } = req.body;
//   const hashed = await bcrypt.hash(password, 10);
//   const user = new User({ username, password: hashed, role });
//   await user.save();
//   res.json({ message: "User registered successfully" });
// };

// /* --------------------------------------------
//    🔐 Login
// -------------------------------------------- */
// export const login = async (req, res) => {
//   const { username, password } = req.body;
//   const user = await User.findOne({ username });
//   if (!user) return res.status(400).json({ error: "User not found" });

//   const valid = await bcrypt.compare(password, user.password);
//   if (!valid) return res.status(400).json({ error: "Invalid password" });

//   const token = jwt.sign(
//     { id: user._id, role: user.role },
//     process.env.JWT_SECRET || "secret",
//     { expiresIn: "1d" }
//   );

//   res.json({ token, user });
// };

// /* --------------------------------------------
//    🧩 Initialize Default Users (DEV TOOL)
// -------------------------------------------- */
// export const initializeUsers = async () => {
//   try {
//     const existing = await User.countDocuments();
//     if (existing > 0) {
//       console.log("ℹ️ Users already exist — skipping initialization");
//       return;
//     }

//     const defaultUsers = [
//       { username: "admin", password: await bcrypt.hash("admin123", 10), role: "admin" },
//       { username: "pharmacist", password: await bcrypt.hash("pharma123", 10), role: "pharmacist" },
//       { username: "manufacturer", password: await bcrypt.hash("manu123", 10), role: "manufacturer" },
//       { username: "viewer", password: await bcrypt.hash("view123", 10), role: "viewer" },
//       { username: "analytics", password: await bcrypt.hash("data123", 10), role: "analytics" },
//     ];

//     await User.insertMany(defaultUsers);
//     console.log("✅ Default users initialized successfully");
//   } catch (error) {
//     console.error("❌ Error initializing default users:", error.message);
//   }
// };
