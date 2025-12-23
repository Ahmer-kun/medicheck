import express from "express";
import {
  createSupportTicket,
  getUserTickets,
  getTicket,
  addTicketResponse,
  getAllTickets,
  updateTicketStatus,
  bulkUpdateTickets
} from "../controllers/supportController.js";
import { auth, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// User routes (accessible to all authenticated users)
router.post("/tickets", createSupportTicket);
router.get("/tickets", getUserTickets); // Now returns all tickets for admin
router.get("/tickets/:id", getTicket); // Now accessible for admin to any ticket
router.post("/tickets/:id/response", addTicketResponse); // Admin can respond to any ticket

// Admin-only routes
router.get("/admin/tickets", authorize('admin'), getAllTickets);
router.put("/admin/tickets/:id", authorize('admin'), updateTicketStatus);
router.put("/admin/tickets/bulk-update", authorize('admin'), bulkUpdateTickets);

export default router;