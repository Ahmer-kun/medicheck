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

    // Find user and check if active
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: "Account is deactivated. Please contact administrator." 
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
      name: user.name || user.username,
      isActive: user.isActive
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
      console.log("Users already exist — skipping initialization");
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
    console.log("Default users initialized successfully");
  } catch (error) {
    console.error("Error initializing default users:", error.message);
  }
};


export const refreshToken = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    // Verify the old token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate new token
    const newToken = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      success: true,
      token: newToken,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        name: user.name || user.username,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};


// Registration of new User  ? Viewer
export const registerViewer = async (req, res) => {
  try {
    const { 
      username, 
      password, 
      name, 
      email, 
      cnic, 
      phone, 
      address 
    } = req.body;

    console.log("Creating new viewer account:", { username, name, phone, cnic });

    // Validate required fields
    if (!username || !password || !name || !email || !cnic) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { username: username.trim().toLowerCase() },
        { cnic: cnic?.trim() },
        { email: email.trim().toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this username, CNIC, or email already exists"
      });
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(password, 10);

    // Create new user with viewer role
    const newUser = new User({
      username: username.trim().toLowerCase(),
      password: hashedPassword,
      role: "viewer", // Always viewer for public registration
      name: name?.trim(),
      email: email?.trim().toLowerCase(),
      phone: phone?.trim() || '',
      cnic: cnic?.trim(),
      address: address?.trim() || '',
      isActive: true
    });

    await newUser.save();

    // Return user without password
    const userResponse = {
      id: newUser._id,
      username: newUser.username,
      role: newUser.role,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      cnic: newUser.cnic,
      address: newUser.address,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt
    };

    console.log("Viewer account created successfully:", username);

    // Send welcome email (async - don't wait for response)
    try {
      const EmailService = (await import("../services/emailService.js")).default;
      await EmailService.sendUserRegistrationEmail(userResponse, password);
      console.log("Welcome email sent to:", userResponse.email);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: "Viewer account created successfully",
      data: userResponse,
      emailSent: true
    });

  } catch (error) {
    console.error("Error creating viewer account:", error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      if (error.keyPattern?.cnic) {
        return res.status(400).json({
          success: false,
          message: "User with this CNIC already exists"
        });
      } else if (error.keyPattern?.email) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists"
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: "Error creating viewer account",
      error: error.message
    });
  }
};
