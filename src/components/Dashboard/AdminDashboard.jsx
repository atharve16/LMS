import React, { useState, useEffect } from "react";
import {
  getLeaves,
  getAllEmployees,
  updateLeaveStatus,
} from "../../services/api";
import LeaveCard from "../Leave/LeaveCard";
import AddEmployee from "../Employee/AddEmployee";
import EmployeeList from "../Employee/EmployeeList";

const AdminDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingRequests: 0,
    approvedToday: 0,
    rejectedToday: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [leavesRes, employeesRes, pendingRes] = await Promise.all([
        getLeaves({ page: 1, limit: 20 }),
        getAllEmployees(),
        getLeaves({ status: "pending" }),
      ]);

      if (leavesRes.success) {
        setLeaves(leavesRes.data);

        const today = new Date().toDateString();
        const approvedToday = leavesRes.data.filter(
          (leave) =>
            leave.status === "approved" &&
            new Date(leave.reviewedAt).toDateString() === today
        ).length;

        const rejectedToday = leavesRes.data.filter(
          (leave) =>
            leave.status === "rejected" &&
            new Date(leave.reviewedAt).toDateString() === today
        ).length;

        setStats((prev) => ({
          ...prev,
          approvedToday,
          rejectedToday,
        }));
      }

      if (employeesRes.success) {
        setEmployees(employeesRes.data);
        setStats((prev) => ({ ...prev, totalEmployees: employeesRes.count }));
      }

      if (pendingRes.success) {
        setPendingLeaves(pendingRes.data);
        setStats((prev) => ({
          ...prev,
          pendingRequests: pendingRes.data.length,
        }));
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (leaveId, status, comments = "") => {
    try {
      const response = await updateLeaveStatus(leaveId, status, comments);
      if (response.success) {
        loadDashboardData();
      }
    } catch (error) {
      console.error("Failed to update leave status:", error);
    }
  };

  const handleEmployeeAdded = () => {
    setShowAddEmployee(false);
    loadDashboardData();
  };

  const getDepartmentStats = () => {
    const departmentCounts = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(departmentCounts).map(([dept, count]) => ({
      dept,
      count,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="opacity-90">Complete system overview and management</p>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {[
              { id: "overview", label: "Overview" },
              { id: "employees", label: "Employees" },
              { id: "leaves", label: "Leave Requests" },
              { id: "analytics", label: "Analytics" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                  <h3 className="text-sm font-medium opacity-75">
                    Total Employees
                  </h3>
                  <p className="text-3xl font-bold">{stats.totalEmployees}</p>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg">
                  <h3 className="text-sm font-medium opacity-75">
                    Pending Requests
                  </h3>
                  <p className="text-3xl font-bold">{stats.pendingRequests}</p>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                  <h3 className="text-sm font-medium opacity-75">
                    Approved Today
                  </h3>
                  <p className="text-3xl font-bold">{stats.approvedToday}</p>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg">
                  <h3 className="text-sm font-medium opacity-75">
                    Rejected Today
                  </h3>
                  <p className="text-3xl font-bold">{stats.rejectedToday}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowAddEmployee(true)}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Add New Employee
                    </button>
                    <button
                      onClick={() => setActiveTab("leaves")}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Review Leave Requests
                    </button>
                    <button
                      onClick={() => setActiveTab("employees")}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                    >
                      Manage Employees
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Department Overview
                  </h3>
                  <div className="space-y-2">
                    {getDepartmentStats()
                      .slice(0, 5)
                      .map(({ dept, count }) => (
                        <div
                          key={dept}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm font-medium text-gray-600">
                            {dept}
                          </span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {count}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-lg">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Recent Activities</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {leaves.slice(0, 5).map((leave) => (
                      <LeaveCard key={leave._id} leave={leave} compact />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "employees" && (
            <div>
              {!showAddEmployee ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                      Employee Management
                    </h2>
                    <button
                      onClick={() => setShowAddEmployee(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Add New Employee
                    </button>
                  </div>
                  <EmployeeList />
                </div>
              ) : (
                <AddEmployee
                  onSuccess={handleEmployeeAdded}
                  onClose={() => setShowAddEmployee(false)}
                />
              )}
            </div>
          )}

          {}
          {activeTab === "leaves" && (
            <div>
              <h2 className="text-xl font-semibold mb-6">
                Leave Request Management
              </h2>

              {}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-yellow-700">
                  Pending Requests ({pendingLeaves.length})
                </h3>
                {pendingLeaves.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No pending requests
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pendingLeaves.map((leave) => (
                      <LeaveCard
                        key={leave._id}
                        leave={leave}
                        showActions
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

              {}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  All Leave Requests
                </h3>
                <div className="space-y-4">
                  {leaves.map((leave) => (
                    <LeaveCard key={leave._id} leave={leave} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">System Analytics</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Leave Status Distribution
                  </h3>
                  <div className="space-y-3">
                    {["pending", "approved", "rejected"].map((status) => {
                      const count = leaves.filter(
                        (leave) => leave.status === status
                      ).length;
                      const percentage = leaves.length
                        ? ((count / leaves.length) * 100).toFixed(1)
                        : 0;
                      return (
                        <div
                          key={status}
                          className="flex items-center justify-between"
                        >
                          <span className="capitalize font-medium">
                            {status}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  status === "pending"
                                    ? "bg-yellow-500"
                                    : status === "approved"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Department Distribution
                  </h3>
                  <div className="space-y-3">
                    {getDepartmentStats().map(({ dept, count }) => {
                      const percentage = stats.totalEmployees
                        ? ((count / stats.totalEmployees) * 100).toFixed(1)
                        : 0;
                      return (
                        <div
                          key={dept}
                          className="flex items-center justify-between"
                        >
                          <span className="font-medium text-sm">{dept}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-blue-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs w-10">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
