import SupportTicket from "../models/SupportTicket.js";
import User from "../models/User.js";

// Creates new support ticket
export const createSupportTicket = async (req, res) => {
  try {
    const { subject, message, category, priority } = req.body;
    const userId = req.user.id;

    console.log("Creating support ticket:", { subject, category, userId });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const supportTicket = new SupportTicket({
      user: userId,
      username: user.username,
      email: user.email || `${user.username}@medicheck.com`,
      role: user.role,
      subject: subject.trim(),
      message: message.trim(),
      category: category || "general",
      priority: priority || "medium"
    });

    await supportTicket.save();

    console.log("Support ticket created:", supportTicket._id);

    res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      data: supportTicket
    });

  } catch (error) {
    console.error("Error creating support ticket:", error);
    res.status(500).json({
      success: false,
      message: "Error creating support ticket",
      error: error.message
    });
  }
};

// Get user's support tickets (or all tickets for admin)
export const getUserTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status, page = 1, limit = 10 } = req.query;

    console.log("Fetching support tickets for user:", userId, "Role:", userRole);

    // If user is admin, show all tickets. Otherwise, show only user's tickets
    const query = userRole === 'admin' ? {} : { user: userId };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'username name role') // Populate user info for admin view
      .populate('assignedTo', 'username name')
      .select('-responses');

    const total = await SupportTicket.countDocuments(query);

    res.json({
      success: true,
      data: tickets,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTickets: total
      },
      userRole: userRole // Returns role for frontend to adjust UI
    });

  } catch (error) {
    console.error("Error fetching user tickets:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching support tickets",
      error: error.message
    });
  }
};

// Get single ticket with responses (admin can access any ticket)
export const getTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log("Fetching ticket:", id, "User role:", userRole);

    // Admin can access any ticket, regular users only their own
    const query = userRole === 'admin' ? { _id: id } : { _id: id, user: userId };

    const ticket = await SupportTicket.findOne(query)
      .populate('user', 'username name role email')
      .populate('assignedTo', 'username name')
      .populate('responses.responder', 'username name role');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found or access denied"
      });
    }

    res.json({
      success: true,
      data: ticket,
      isAdmin: userRole === 'admin' // Let frontend know if user is admin
    });

  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching ticket",
      error: error.message
    });
  }
};

// Add response to ticket (user or admin)
export const addTicketResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log("Adding response to ticket:", id, "User role:", userRole);

    // Admin can respond to any ticket, users only to their own
    const query = userRole === 'admin' ? { _id: id } : { _id: id, user: userId };

    const ticket = await SupportTicket.findOne(query);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found or access denied"
      });
    }

    ticket.responses.push({
      responder: userId,
      message: message.trim(),
      isAdminResponse: userRole === 'admin' // Mark admin responses
    });

    // Update status logic
    if (userRole === 'admin') {
      if (ticket.status === 'open') {
        ticket.status = 'in_progress';
        ticket.assignedTo = userId;
      }
    } else {
      // User responding to their own ticket
      if (ticket.status === 'in_progress') {
        ticket.status = 'open'; // Re-open if user responds
      }
    }

    await ticket.save();

    const updatedTicket = await SupportTicket.findById(id)
      .populate('user', 'username name role')
      .populate('assignedTo', 'username name')
      .populate('responses.responder', 'username name role');

    res.json({
      success: true,
      message: "Response added successfully",
      data: updatedTicket
    });

  } catch (error) {
    console.error("Error adding response:", error);
    res.status(500).json({
      success: false,
      message: "Error adding response",
      error: error.message
    });
  }
};

// Admin: Get all tickets with advanced filtering
export const getAllTickets = async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 20, search } = req.query;

    console.log("Admin fetching all tickets");

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (category && category !== 'all') query.category = category;

    // Search functionality
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    const tickets = await SupportTicket.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'username name role email')
      .populate('assignedTo', 'username name');

    const total = await SupportTicket.countDocuments(query);

    // Get comprehensive stats
    const stats = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Priority stats
    const priorityStats = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: tickets,
      stats: {
        byStatus: stats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        byPriority: priorityStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTickets: total
      }
    });

  } catch (error) {
    console.error("Error fetching all tickets:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tickets",
      error: error.message
    });
  }
};

// Admin: Update ticket status and assignment
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, priority } = req.body;

    console.log("Admin updating ticket:", id);

    const updateData = {};
    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (priority) updateData.priority = priority;

    const ticket = await SupportTicket.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    .populate('user', 'username name role email')
    .populate('assignedTo', 'username name');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    res.json({
      success: true,
      message: "Ticket updated successfully",
      data: ticket
    });

  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({
      success: false,
      message: "Error updating ticket",
      error: error.message
    });
  }
};

// Admin: Bulk update tickets
export const bulkUpdateTickets = async (req, res) => {
  try {
    const { ticketIds, status, assignedTo, priority } = req.body;

    console.log("Admin bulk updating tickets:", ticketIds);

    const updateData = {};
    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (priority) updateData.priority = priority;

    const result = await SupportTicket.updateMany(
      { _id: { $in: ticketIds } },
      updateData
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} tickets updated successfully`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("Error bulk updating tickets:", error);
    res.status(500).json({
      success: false,
      message: "Error bulk updating tickets",
      error: error.message
    });
  }
};

export const getSupportAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const analytics = await SupportTicket.aggregate([
      {
        $facet: {
          // Ticket statistics
          stats: [
            {
              $group: {
                _id: null,
                totalTickets: { $sum: 1 },
                openTickets: {
                  $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] }
                },
                avgResponseTime: { $avg: "$firstResponseTime" },
                satisfactionRate: { $avg: "$satisfactionRating" }
              }
            }
          ],
          // Tickets by priority
          byPriority: [
            {
              $group: {
                _id: "$priority",
                count: { $sum: 1 }
              }
            }
          ],
          // Tickets by category
          byCategory: [
            {
              $group: {
                _id: "$category",
                count: { $sum: 1 }
              }
            }
          ],
          // Daily ticket volume (last 30 days)
          dailyVolume: [
            {
              $match: {
                createdAt: { $gte: thirtyDaysAgo }
              }
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          // Response time analysis
          responseTime: [
            {
              $match: {
                firstResponseTime: { $exists: true }
              }
            },
            {
              $group: {
                _id: "$category",
                avgResponseTime: { $avg: "$firstResponseTime" },
                minResponseTime: { $min: "$firstResponseTime" },
                maxResponseTime: { $max: "$firstResponseTime" }
              }
            }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: analytics[0]
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics",
      error: error.message
    });
  }
};

// Auto-assign tickets based on category
export const autoAssignTickets = async (req, res) => {
  try {
    const unassignedTickets = await SupportTicket.find({
      assignedTo: { $exists: false },
      status: "open"
    });

    const adminUsers = await User.find({ role: "admin" }).select('_id');
    
    if (adminUsers.length === 0) {
      return res.json({
        success: false,
        message: "No admin users available for assignment"
      });
    }

    const assignmentResults = [];
    
    for (const ticket of unassignedTickets) {
      // Simple round-robin assignment
      const assignedAdmin = adminUsers[assignmentResults.length % adminUsers.length];
      
      ticket.assignedTo = assignedAdmin._id;
      await ticket.save();
      
      assignmentResults.push({
        ticketId: ticket._id,
        assignedTo: assignedAdmin._id,
        subject: ticket.subject
      });
    }

    res.json({
      success: true,
      message: `Assigned ${assignmentResults.length} tickets`,
      data: assignmentResults
    });
  } catch (error) {
    console.error("Error auto-assigning tickets:", error);
    res.status(500).json({
      success: false,
      message: "Error auto-assigning tickets",
      error: error.message
    });
  }
};
