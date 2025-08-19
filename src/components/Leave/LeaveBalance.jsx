import React, { useState, useEffect } from "react";
import { getEmployeeLeaveBalance, getLeaves } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/dateHelpers";

const LeaveBalance = ({ employeeId, showTitle = true }) => {
  const { user } = useAuth();
  const [balanceData, setBalanceData] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const targetEmployeeId = employeeId || user?.employeeId || user?._id;

  useEffect(() => {
    if (targetEmployeeId) {
      loadBalanceData();
    } else {
      setError("Employee ID not found");
      setLoading(false);
    }
  }, [targetEmployeeId]);

  const loadBalanceData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Loading balance for employee:", targetEmployeeId);

      const [balanceRes, leavesRes] = await Promise.all([
        getEmployeeLeaveBalance(targetEmployeeId),
        getLeaves({ limit: 10 }),
      ]);

      if (balanceRes.success) {
        setBalanceData(balanceRes.data);
        console.log("Balance data loaded:", balanceRes.data);
      } else {
        setError(
          "Failed to load balance data: " +
            (balanceRes.message || "Unknown error")
        );
      }

      if (leavesRes.success) {
        const userLeaves = leavesRes.data.filter((leave) => {
          const leaveEmployeeId = leave.employeeId?._id || leave.employeeId;
          return leaveEmployeeId === targetEmployeeId;
        });
        setRecentLeaves(userLeaves);
        console.log("Leaves loaded:", userLeaves);
      }
    } catch (err) {
      console.error("Balance loading error:", err);
      setError(err.message || "Failed to load leave balance");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const calculateUsedLeaves = () => {
    if (!recentLeaves.length) return 0;
    return recentLeaves
      .filter((leave) => leave.status === "approved")
      .reduce((total, leave) => total + leave.daysRequested, 0);
  };

  const calculatePendingLeaves = () => {
    if (!recentLeaves.length) return 0;
    return recentLeaves
      .filter((leave) => leave.status === "pending")
      .reduce((total, leave) => total + leave.daysRequested, 0);
  };

  const calculateRejectedLeaves = () => {
    if (!recentLeaves.length) return 0;
    return recentLeaves
      .filter((leave) => leave.status === "rejected")
      .reduce((total, leave) => total + leave.daysRequested, 0);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to Load Leave Balance
          </h3>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={loadBalanceData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!balanceData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No Balance Data
          </h3>
          <p className="text-sm text-gray-500">
            Leave balance information is not available
          </p>
        </div>
      </div>
    );
  }

  const usedLeaves = calculateUsedLeaves();
  const pendingLeaves = calculatePendingLeaves();
  const rejectedLeaves = calculateRejectedLeaves();
  const totalAllocation = 25;
  const remainingBalance = balanceData.currentBalance;

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Leave Balance</h2>
          <button
            onClick={loadBalanceData}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center transition-colors"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium opacity-90">
              Available Leave Balance
            </h3>
            <p className="text-4xl font-bold mt-2">{remainingBalance}</p>
            <p className="text-sm opacity-75 mt-1">days remaining</p>
          </div>
          <div className="text-right opacity-75">
            <p className="text-sm">Employee: {balanceData.name}</p>
            <p className="text-xs mt-1">As of {formatDate(new Date())}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {usedLeaves}
              </h4>
              <p className="text-sm text-gray-500">Used Leaves</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {pendingLeaves}
              </h4>
              <p className="text-sm text-gray-500">Pending Approval</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {rejectedLeaves}
              </h4>
              <p className="text-sm text-gray-500">Rejected</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {totalAllocation}
              </h4>
              <p className="text-sm text-gray-500">Annual Allocation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Leave Usage Progress
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Used: {usedLeaves} days</span>
            <span>Remaining: {remainingBalance} days</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  (usedLeaves / totalAllocation) * 100,
                  100
                )}%`,
              }}
            ></div>
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>0 days</span>
            <span>{totalAllocation} days</span>
          </div>
        </div>

        {pendingLeaves > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">
                  Pending Leave Requests
                </h4>
                <p className="text-sm text-yellow-700">
                  You have {pendingLeaves} days pending approval. Your available
                  balance will be{" "}
                  {Math.max(0, remainingBalance - pendingLeaves)} days if
                  approved.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Leave Requests
        </h3>

        {recentLeaves.length > 0 ? (
          <div className="space-y-3">
            {recentLeaves.slice(0, 5).map((leave) => (
              <div
                key={leave._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(leave.startDate)} -{" "}
                      {formatDate(leave.endDate)}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                        leave.status
                      )}`}
                    >
                      {leave.status.charAt(0).toUpperCase() +
                        leave.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate max-w-md">
                    {leave.reason}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {leave.daysRequested} day
                    {leave.daysRequested !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-gray-500">
                    Applied: {formatDate(leave.createdAt)}
                  </p>
                  {leave.reviewedAt && (
                    <p className="text-xs text-gray-500">
                      Reviewed: {formatDate(leave.reviewedAt)}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {recentLeaves.length > 5 && (
              <p className="text-sm text-gray-500 text-center pt-3">
                ... and {recentLeaves.length - 5} more leave requests
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h4 className="mt-2 text-sm font-medium text-gray-900">
              No leave requests yet
            </h4>
            <p className="text-sm text-gray-500">
              Your leave history will appear here once you apply for leaves.
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Leave Policy Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">
              Annual Allocation
            </h4>
            <ul className="space-y-1 text-blue-700">
              <li>• {totalAllocation} days per calendar year</li>
              <li>• Accrued monthly basis</li>
              <li>• Maximum 5 days carry forward</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">
              Application Rules
            </h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Apply at least 7 days in advance</li>
              <li>• Maximum 15 consecutive days</li>
              <li>• Subject to manager approval</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalance;
