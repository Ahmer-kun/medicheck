// Navigation Items

// Update the navigation items to include the new manufacturer dashboard
export const navigationItems = [
  { to: "/", label: "Dashboard", icon: "📊", roles: ["admin", "analytics"] },
  { to: "/manufacturer-dashboard", label: "Manufacturer Companies", icon: "🏭", roles: ["admin", "manufacturer"] },
  { to: "/manufacturer", label: "Manufacturer", icon: "🏭", roles: ["admin", "manufacturer"] },
  { to: "/pharmacy-dashboard", label: "Pharmacy Companies", icon: "🏪", roles: ["admin", "pharmacy"] },
  { to: "/pharmacy", label: "Medicine Management", icon: "💊", roles: ["admin", "pharmacy"] },
  { to: "/verify", label: "Customer Verify", icon: "🔍", roles: ["admin", "manufacturer", "pharmacy", "analytics", "viewer", "public"] },
  { to: "/analytics", label: "Analytics", icon: "📈", roles: ["admin", "analytics"] },
  { to: "/admin", label: "Admin", icon: "⚙️", roles: ["admin"] },
  // ... existing items ...
  { to: "/support", label: "Support", icon: "💬", roles: ["admin", "pharmacy", "manufacturer", "analytics", "viewer"] }
  
];

// HELLA IMPORTANT

// export const navigationItems = [
//   { to: "/", label: "Dashboard", icon: "📊", roles: ["admin", "manufacturer", "pharmacy", "analytics", "viewer"] },
//   { to: "/manufacturer-dashboard", label: "Manufacturer Companies", icon: "🏭", roles: ["admin", "manufacturer"] },
//   { to: "/manufacturer", label: "Manufacturer", icon: "🏭", roles: ["admin", "manufacturer"] },
//   { to: "/pharmacy-dashboard", label: "Pharmacy Companies", icon: "🏪", roles: ["admin", "pharmacy"] },
//   { to: "/pharmacy", label: "Medicine Management", icon: "💊", roles: ["admin", "pharmacy"] },
//   { to: "/verify", label: "Customer Verify", icon: "🔍", roles: ["admin", "manufacturer", "pharmacy", "analytics", "viewer", "public"] },
//   { to: "/analytics", label: "Analytics", icon: "📈", roles: ["admin", "analytics"] },
//   { to: "/admin", label: "Admin", icon: "⚙️", roles: ["admin"] },
// ];


// export const navigationItems = [
//   { to: "/", label: "Dashboard", icon: "📊", roles: ["admin", "manufacturer", "pharmacy", "analytics", "viewer"] },
//   { to: "/manufacturer-dashboard", label: "Manufacturer Companies", icon: "🏭", roles: ["admin", "manufacturer"] },
//   { to: "/manufacturer", label: "Batch Registration", icon: "📦", roles: ["admin", "manufacturer"] },
//   { to: "/pharmacy-dashboard", label: "Pharmacy Companies", icon: "🏪", roles: ["admin", "pharmacy"] },
//   { to: "/pharmacy", label: "Medicine Management", icon: "💊", roles: ["admin", "pharmacy"] },
//   { to: "/verify", label: "Customer Verify", icon: "🔍", roles: ["admin", "manufacturer", "pharmacy", "analytics", "viewer", "public"] },
//   { to: "/analytics", label: "Analytics", icon: "📈", roles: ["admin", "analytics"] },
//   { to: "/admin", label: "Admin", icon: "⚙️", roles: ["admin"] },
// ];





// Users Data
export const USERS = {
  admin: { username: "admin", password: "admin123", role: "admin", name: "System Administrator", theme: "blue" },
  pharmacist: { username: "pharmacist", password: "pharma123", role: "pharmacy", name: "Pharmacy Manager", theme: "blue" },
  manufacturer: { username: "manufacturer", password: "manu123", role: "manufacturer", name: "Manufacturing Head", theme: "blue" },
  viewer: { username: "viewer", password: "view123", role: "viewer", name: "Quality Viewer", theme: "blue" },
  analytics: { username: "analytics", password: "analytics123", role: "analytics", name: "Data Analyst", theme: "blue" }
};

// Analytics Data
export const analyticsData = [
  { name: "Week 1", Registered: 8, Verified: 6, Expired: 1 },
  { name: "Week 2", Registered: 7, Verified: 5, Expired: 2 },
  { name: "Week 3", Registered: 9, Verified: 7, Expired: 1 },
  { name: "Week 4", Registered: 10, Verified: 8, Expired: 2 },
  { name: "Week 5", Registered: 8, Verified: 6, Expired: 1 },
  { name: "Week 6", Registered: 11, Verified: 9, Expired: 3 },
  { name: "Week 7", Registered: 9, Verified: 7, Expired: 2 },
  { name: "Week 8", Registered: 12, Verified: 10, Expired: 1 },
];

// Default Batches Data
export const DEFAULT_BATCHES = [
];

// Blockchain Nodes Data
export const BLOCKCHAIN_NODES = [
  { id: 1, name: "Manufacturer Node", type: "manufacturer", x: 100, y: 100, connected: true },
  { id: 2, name: "Pharmacy Node", type: "pharmacy", x: 300, y: 100, connected: true },
  { id: 3, name: "Distributor Node", type: "distributor", x: 200, y: 200, connected: true },
  { id: 4, name: "Regulatory Node", type: "regulatory", x: 400, y: 200, connected: true },
  { id: 5, name: "Customer Node", type: "customer", x: 300, y: 300, connected: true },
];

// Pharmacy Companies Data (already exists)
export const PHARMACY_COMPANIES = [
  {
    id: 1,
    name: "Dvago Pharmacy",
    location: "Karachi, Pakistan",
    manager: "Ahmed Khan",
    contact: {
      email: "ahmed@dvagopharmacy.com",
      phone: "+92-300-1234567"
    },
    stats: {
      totalBatches: 45,
      activeBatches: 38,
      expiredBatches: 7,
      verifiedBatches: 42
    },
    rating: 4.5,
    isActive: true,
    batches: [
      {
        batchNo: "PANT-2025-001",
        name: "Pantra 40mg",
        formulation: "Pantoprazole 40mg tablet",
        expiry: "2026-06-30",
        status: "active",
        blockchainVerified: true,
        quantity: 1000
      },
      {
        batchNo: "TLD-2025-010", 
        name: "Telday 40mg",
        formulation: "Telmisartan 40mg tablet",
        expiry: "2025-07-10",
        status: "active",
        blockchainVerified: true,
        quantity: 800
      }
    ]
  },
  {
    id: 2,
    name: "Gets Pharma",
    location: "Lahore, Pakistan", 
    manager: "Fatima Ali",
    contact: {
      email: "fatima@getspharma.com",
      phone: "+92-300-7654321"
    },
    stats: {
      totalBatches: 38,
      activeBatches: 32,
      expiredBatches: 6,
      verifiedBatches: 35
    },
    rating: 4.3,
    isActive: true,
    batches: [
      {
        batchNo: "CFG-2025-003",
        name: "Cefiget 200mg",
        formulation: "Cefixime 200mg capsule", 
        expiry: "2026-05-20",
        status: "active",
        blockchainVerified: true,
        quantity: 1200
      }
    ]
  },
  {
    id: 3,
    name: "Apollo Pharmacy",
    location: "Delhi, India",
    manager: "Rajesh Kumar",
    contact: {
      email: "rajesh@apollopharmacy.com", 
      phone: "+91-9876543210"
    },
    stats: {
      totalBatches: 67,
      activeBatches: 59,
      expiredBatches: 8,
      verifiedBatches: 65
    },
    rating: 4.7,
    isActive: true,
    batches: [
      {
        batchNo: "AMX-2025-004",
        name: "Amoxicillin 500mg",
        formulation: "Amoxicillin trihydrate capsule",
        expiry: "2025-08-15", 
        status: "active",
        blockchainVerified: true,
        quantity: 1500
      }
    ]
  },
  {
    id: 4,
    name: "MediCare Pharmacy",
    location: "Islamabad, Pakistan",
    manager: "Zainab Shah",
    contact: {
      email: "zainab@medicarepharmacy.com",
      phone: "+92-300-1122334"
    },
    stats: {
      totalBatches: 52,
      activeBatches: 45, 
      expiredBatches: 7,
      verifiedBatches: 50
    },
    rating: 4.4,
    isActive: true,
    batches: [
      {
        batchNo: "VITC-2025-009",
        name: "Ascoril C",
        formulation: "Vitamin C chewable tablet",
        expiry: "2026-12-01",
        status: "active",
        blockchainVerified: true,
        quantity: 750
      }
    ]
  },
  {
    id: 5,
    name: "Wellness Forever", 
    location: "Mumbai, India",
    manager: "Priya Singh",
    contact: {
      email: "priya@wellnessforever.com",
      phone: "+91-9876543211"
    },
    stats: {
      totalBatches: 41,
      activeBatches: 36,
      expiredBatches: 5,
      verifiedBatches: 40
    },
    rating: 4.6,
    isActive: true,
    batches: [
      {
        batchNo: "IBU-2025-010",
        name: "Ibugesic Plus", 
        formulation: "Ibuprofen + Paracetamol tablet",
        expiry: "2024-08-05",
        status: "expired",
        blockchainVerified: false,
        quantity: 1100
      }
    ]
  },
  {
    id: 6,
    name: "Guardian Pharmacy",
    location: "Karachi, Pakistan",
    manager: "Bilal Ahmed",
    contact: {
      email: "bilal@guardianpharmacy.com",
      phone: "+92-300-4455667" 
    },
    stats: {
      totalBatches: 58,
      activeBatches: 50,
      expiredBatches: 8,
      verifiedBatches: 55
    },
    rating: 4.2,
    isActive: true,
    batches: [
      {
        batchNo: "MET-2025-007",
        name: "Metformin 500mg",
        formulation: "Metformin hydrochloride tablet",
        expiry: "2024-10-30",
        status: "expired",
        blockchainVerified: false,
        quantity: 2000
      }
    ]
  },
  {
    id: 7,
    name: "HealthPlus Pharmacy",
    location: "Lahore, Pakistan",
    manager: "Sara Khan", 
    contact: {
      email: "sara@healthpluspharmacy.com",
      phone: "+92-300-9988776"
    },
    stats: {
      totalBatches: 34,
      activeBatches: 29,
      expiredBatches: 5,
      verifiedBatches: 32
    },
    rating: 4.5,
    isActive: true,
    batches: [
      {
        batchNo: "AZT-2025-005",
        name: "Azithro 250mg",
        formulation: "Azithromycin 250mg tablet",
        expiry: "2024-11-20",
        status: "expired", 
        blockchainVerified: false,
        quantity: 600
      }
    ]
  },
  {
    id: 8,
    name: "Trust Pharmacy",
    location: "Rawalpindi, Pakistan",
    manager: "Omar Farooq",
    contact: {
      email: "omar@trustpharmacy.com",
      phone: "+92-300-5544332"
    },
    stats: {
      totalBatches: 29,
      activeBatches: 24,
      expiredBatches: 5,
      verifiedBatches: 28
    },
    rating: 4.1,
    isActive: true,
    batches: [
      {
        batchNo: "PARA-2025-008",
        name: "Paracetamol 500mg",
        formulation: "Acetaminophen tablet",
        expiry: "2024-12-01",
        status: "expired",
        blockchainVerified: false,
        quantity: 3000
      }
    ]
  },
  {
    id: 9,
    name: "Prime Medicos",
    location: "Islamabad, Pakistan", 
    manager: "Ayesha Malik",
    contact: {
      email: "ayesha@primemedicos.com",
      phone: "+92-300-6677889"
    },
    stats: {
      totalBatches: 47,
      activeBatches: 41,
      expiredBatches: 6,
      verifiedBatches: 45
    },
    rating: 4.4,
    isActive: true,
    batches: [
      {
        batchNo: "CIP-2025-006",
        name: "Ciproflox 500mg",
        formulation: "Ciprofloxacin 500mg tablet",
        expiry: "2024-09-15",
        status: "expired",
        blockchainVerified: false,
        quantity: 900
      }
    ]
  },
  {
    id: 10,
    name: "City Pharmacy",
    location: "Karachi, Pakistan",
    manager: "Hassan Raza",
    contact: {
      email: "hassan@citypharmacy.com",
      phone: "+92-300-2233445"
    },
    stats: {
      totalBatches: 63,
      activeBatches: 55,
      expiredBatches: 8,
      verifiedBatches: 60
    },
    rating: 4.3,
    isActive: true,
    batches: [
      {
        batchNo: "VITC-2025-011",
        name: "Vitamin D3",
        formulation: "Cholecalciferol 1000IU capsule",
        expiry: "2026-03-15",
        status: "active",
        blockchainVerified: true,
        quantity: 2000
      }
    ]
  }
];