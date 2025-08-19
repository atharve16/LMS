import React, { useState, useEffect } from "react";
import { getLeaves, updateLeaveStatus } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import LeaveCard from "./LeaveCard";
import ApplyLeave from "./ApplyLeave";

const LeaveList = () => {
  const { user, isHR, isAdmin, isEmployee } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    department: "",
    dateFrom: "",
    dateTo: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    loadLeaves();
  }, [filters, pagination.current, sortBy, sortOrder]);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.limit,
        status: filters.status,
        sortBy,
        sortOrder,
        ...filters,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await getLeaves(params);
      if (response.success) {
        setLeaves(response.data);
        setPagination(response.pagination || pagination);
      }
    } catch (error) {
      console.error("Failed to load leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleLeaveAction = async (leaveId, status, comments = "") => {
    try {
      const response = await updateLeaveStatus(leaveId, status, comments);
      if (response.success) {
        loadLeaves();
      }
    } catch (error) {
      console.error("Failed to update leave status:", error);
    }
  };

  const handleLeaveSuccess = () => {
    setShowApplyForm(false);
    loadLeaves();
  };

  const getFilteredStats = () => {
    return {
      total: leaves.length,
      pending: leaves.filter((l) => l.status === "pending").length,
      approved: leaves.filter((l) => l.status === "approved").length,
      rejected: leaves.filter((l) => l.status === "rejected").length,
    };
  };

  const stats = getFilteredStats();
  const uniqueDepartments = [
    ...new Set(leaves.map((l) => l.employeeId?.department).filter(Boolean)),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEmployee ? "My Leave Requests" : "Leave Requests"}
          </h2>
          <p className="text-gray-500">
            {isEmployee
              ? "View and manage your leave requests"
              : "Manage employee leave requests"}
          </p>
        </div>

        {isEmployee && (
          <button
            onClick={() => setShowApplyForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Apply for Leave
          </button>
        )}
      </div>

      {showApplyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
            <ApplyLeave
              onSuccess={handleLeaveSuccess}
              onClose={() => setShowApplyForm(false)}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-700">Total</h3>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-700">Pending</h3>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-700">Approved</h3>
          <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-700">Rejected</h3>
          <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {(isHR || isAdmin) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) =>
                  handleFilterChange("department", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by employee name or reason..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt-desc">Latest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="startDate-desc">Start Date (Latest)</option>
              <option value="startDate-asc">Start Date (Earliest)</option>
              <option value="daysRequested-desc">Most Days First</option>
              <option value="daysRequested-asc">Least Days First</option>
            </select>

            <button
              onClick={() => {
                setFilters({
                  status: "",
                  department: "",
                  dateFrom: "",
                  dateTo: "",
                  search: "",
                });
                setSortBy("createdAt");
                setSortOrder("desc");
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-500">Loading leaves...</span>
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No leave requests found
              </h3>
              <p className="text-gray-500 mb-4">
                {isEmployee
                  ? "You haven't applied for any leaves yet."
                  : "No leave requests match your current filters."}
              </p>
              {isEmployee && (
                <button
                  onClick={() => setShowApplyForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Apply for Your First Leave
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {leaves.map((leave) => (
                <LeaveCard
                  key={leave._id}
                  leave={leave}
                  showActions={isHR || isAdmin}
                  onApprove={(id, comments) =>
                    handleLeaveAction(id, "approved", comments)
                  }
                  onReject={(id, comments) =>
                    handleLeaveAction(id, "rejected", comments)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(pagination.current - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.current * pagination.limit,
                  pagination.total
                )}{" "}
                of {pagination.total} results
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      current: prev.current - 1,
                    }))
                  }
                  disabled={pagination.current === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                <div className="flex space-x-1">
                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            current: pageNum,
                          }))
                        }
                        className={`px-3 py-1 text-sm border rounded-md ${
                          pagination.current === pageNum
                            ? "bg-blue-500 text-white border-blue-500"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {pagination.pages > 5 && (
                    <>
                      {pagination.pages > 6 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            current: pagination.pages,
                          }))
                        }
                        className={`px-3 py-1 text-sm border rounded-md ${
                          pagination.current === pagination.pages
                            ? "bg-blue-500 text-white border-blue-500"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pagination.pages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      current: prev.current + 1,
                    }))
                  }
                  disabled={pagination.current === pagination.pages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveList;
