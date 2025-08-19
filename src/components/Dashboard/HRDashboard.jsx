import React, { useState, useEffect } from "react";
import {
  getLeaves,
  getAllEmployees,
  updateLeaveStatus,
} from "../../services/api";
import LeaveCard from "../Leave/LeaveCard";
import AddEmployee from "../Employee/AddEmployee";

const HRDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingRequests: 0,
    approvedToday: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [leavesRes, employeesRes, pendingRes] = await Promise.all([
        getLeaves({ page: 1, limit: 10 }),
        getAllEmployees(),
        getLeaves({ status: "pending" }),
      ]);

      if (leavesRes.success) setLeaves(leavesRes.data);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">HR Dashboard</h1>
        <p className="opacity-90">Manage employees and leave requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">
            Total Employees
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats.totalEmployees}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">
            Pending Requests
          </h3>
          <p className="text-3xl font-bold text-yellow-600">
            {stats.pendingRequests}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">
            Recent Employees
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {
              employees.filter((emp) => {
                const joinDate = new Date(emp.joiningDate);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return joinDate >= thirtyDaysAgo;
              }).length
            }
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        {!showAddEmployee ? (
          <div className="p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Quick Actions
              </h2>
              <button
                onClick={() => setShowAddEmployee(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Add New Employee
              </button>
            </div>
          </div>
        ) : (
          <AddEmployee
            onSuccess={handleEmployeeAdded}
            onClose={() => setShowAddEmployee(false)}
          />
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Pending Leave Requests ({pendingLeaves.length})
          </h2>
        </div>
        <div className="p-6">
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
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Activities
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {leaves.slice(0, 5).map((leave) => (
              <LeaveCard key={leave._id} leave={leave} compact />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
