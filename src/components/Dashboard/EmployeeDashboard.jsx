import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getLeaves, getEmployeeLeaveBalance } from "../../services/api";
import ApplyLeave from "../Leave/ApplyLeave";
import LeaveCard from "../Leave/LeaveCard";
import { formatDate } from "../../utils/dateHelpers";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [leavesRes, balanceRes] = await Promise.all([
        getLeaves({ page: 1, limit: 10 }),
        getEmployeeLeaveBalance(user.employeeId),
      ]);

      if (leavesRes.success) setLeaves(leavesRes.data);
      if (balanceRes.success) setLeaveBalance(balanceRes.data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSuccess = () => {
    setShowApplyForm(false);
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
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
        <p className="opacity-90">Department: {user.department}</p>
        <p className="opacity-90">Joined: {formatDate(user.joiningDate)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Leave Balance</h3>
          <p className="text-3xl font-bold text-green-600">
            {leaveBalance?.currentBalance || user.leaveBalance} days
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">
            Pending Requests
          </h3>
          <p className="text-3xl font-bold text-yellow-600">
            {leaveBalance?.leaveHistory?.pending || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">
            Approved Leaves
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {leaveBalance?.leaveHistory?.approved || 0}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        {!showApplyForm ? (
          <div className="p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Quick Actions
              </h2>
              <button
                onClick={() => setShowApplyForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Apply for Leave
              </button>
            </div>
          </div>
        ) : (
          <ApplyLeave
            onSuccess={handleLeaveSuccess}
            onClose={() => setShowApplyForm(false)}
          />
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Leave Requests
          </h2>
        </div>
        <div className="p-6">
          {leaves.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No leave requests found
            </p>
          ) : (
            <div className="space-y-4">
              {leaves.slice(0, 5).map((leave) => (
                <LeaveCard key={leave._id} leave={leave} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
