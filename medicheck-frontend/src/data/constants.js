// Navigation Items
export const navigationItems = [
  { to: "/", label: "Dashboard", icon: "📊", roles: ["admin", "analytics"] },
  { to: "/manufacturer-dashboard", label: "Manufacturer Companies", icon: "🏭", roles: ["admin", "manufacturer"] },
  { to: "/manufacturer", label: "Manufacturer", icon: "🏭", roles: ["admin", "manufacturer"] },
  { to: "/pharmacy-dashboard", label: "Pharmacy Companies", icon: "🏪", roles: ["admin", "pharmacy"] },
  { to: "/pharmacy", label: "Medicine Management", icon: "💊", roles: ["admin", "pharmacy"] },
  { to: "/verify", label: "Customer Verify", icon: "🔍", roles: ["admin", "manufacturer", "pharmacy", "analytics", "viewer", "public"] },
  { to: "/analytics", label: "Analytics", icon: "📈", roles: ["admin", "analytics"] },
  { to: "/admin", label: "Admin", icon: "⚙️", roles: ["admin"] },
  { to: "/support", label: "Support", icon: "💬", roles: ["admin", "pharmacy", "manufacturer", "analytics", "viewer"] }
];

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
export const DEFAULT_BATCHES = [];

// Blockchain Nodes Data
export const BLOCKCHAIN_NODES = [
  { id: 1, name: "Manufacturer Node", type: "manufacturer", x: 100, y: 100, connected: true },
  { id: 2, name: "Pharmacy Node",     type: "pharmacy",     x: 300, y: 100, connected: true },
  { id: 3, name: "Distributor Node",  type: "distributor",  x: 200, y: 200, connected: true },
  { id: 4, name: "Regulatory Node",   type: "regulatory",   x: 400, y: 200, connected: true },
  { id: 5, name: "Customer Node",     type: "customer",     x: 300, y: 300, connected: true },
];