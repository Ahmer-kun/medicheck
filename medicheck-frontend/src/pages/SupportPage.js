import React, { useState, useEffect } from "react";
import BackgroundFix from "../components/BackgroundFix";
import ProtectedRoute from "../components/ProtectedRoute";
import { api } from "../utils/api";

function SupportPage({ user, theme }) {
  const [activeTab, setActiveTab] = useState("new");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({});
  
  // New ticket form
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    category: "general",
    priority: "medium"
  });

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Fetch user's tickets (or all tickets for admin)
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get("/support/tickets");
      if (response.success) {
        setTickets(response.data);
        setStats(response.stats || {});
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      fetchTickets();
    }
  }, [activeTab]);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await api.post("/support/tickets", formData);
      if (response.success) {
        alert("✅ Support ticket created successfully!");
        setFormData({
          subject: "",
          message: "",
          category: "general",
          priority: "medium"
        });
        setActiveTab("history");
      }
    } catch (error) {
      alert("❌ Error creating support ticket: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Admin: Update ticket status
  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      const response = await api.put(`/support/admin/tickets/${ticketId}`, {
        status: newStatus
      });
      if (response.success) {
        alert("✅ Ticket status updated!");
        fetchTickets();
      }
    } catch (error) {
      alert("❌ Error updating ticket: " + error.message);
    }
  };

  return (
    <ProtectedRoute user={user}>
      <BackgroundFix theme={theme}>
        <div className="p-6 min-h-screen">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Customer Support {isAdmin && "- Admin Panel"}
              </h1>
              <p className="text-gray-600">
                {isAdmin 
                  ? "Manage all support tickets across the system" 
                  : "Get help with your Medicheck account and services"
                }
              </p>
              {isAdmin && stats.byStatus && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.byStatus.open || 0}</div>
                    <div className="text-sm text-blue-700">Open</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.byStatus.in_progress || 0}</div>
                    <div className="text-sm text-yellow-700">In Progress</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.byStatus.resolved || 0}</div>
                    <div className="text-sm text-green-700">Resolved</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-600">{stats.byStatus.closed || 0}</div>
                    <div className="text-sm text-gray-700">Closed</div>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("new")}
                className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                  activeTab === "new" 
                    ? "bg-white border-t border-l border-r border-gray-200 text-blue-600" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                New Ticket
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                  activeTab === "history" 
                    ? "bg-white border-t border-l border-r border-gray-200 text-blue-600" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {isAdmin ? "All Tickets" : "My Tickets"}
              </button>
            </div>

            {/* New Ticket Form */}
            {activeTab === "new" && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  Create Support Ticket
                </h3>
                
                <form onSubmit={handleSubmitTicket} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="technical">Technical Issue</option>
                        <option value="bug_report">Bug Report</option>
                        <option value="feature_request">Feature Request</option>
                        <option value="account">Account Help</option>
                        <option value="billing">Billing Issue</option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detailed Message
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      rows="6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Please describe your issue in detail..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Ticket"}
                  </button>
                </form>
              </div>
            )}

            {/* Ticket History */}
            {activeTab === "history" && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">
                      {isAdmin ? "All Support Tickets" : "Your Support Tickets"}
                    </h3>
                    <button
                      onClick={fetchTickets}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
                
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="loading-spinner mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading tickets...</p>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-4xl mb-4">📭</div>
                    <p>No support tickets yet.</p>
                    <p className="text-sm">Create your first ticket to get help.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {tickets.map((ticket) => (
                      <div key={ticket._id} className="p-6 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">
                              {ticket.subject}
                            </h4>
                            {isAdmin && (
                              <p className="text-sm text-gray-600">
                                From: {ticket.username} ({ticket.role})
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              ticket.status === 'open' ? 'bg-green-100 text-green-800' :
                              ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              ticket.status === 'resolved' ? 'bg-gray-100 text-gray-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                            {isAdmin && (
                              <select
                                value={ticket.status}
                                onChange={(e) => handleUpdateTicketStatus(ticket._id, e.target.value)}
                                className="text-xs border rounded px-2 py-1"
                              >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                              </select>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {ticket.message}
                        </p>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>Category: {ticket.category}</span>
                          <span>Priority: {ticket.priority}</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                        {ticket.responses && ticket.responses.length > 0 && (
                          <div className="mt-2 text-sm text-blue-600">
                            {ticket.responses.length} response{ticket.responses.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </BackgroundFix>
    </ProtectedRoute>
  );
}

export default SupportPage;