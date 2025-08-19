import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getEmployeeById,
  getEmployeeLeaveBalance,
  getLeaves,
} from "../../services/api";
import { formatDate } from "../../utils/dateHelpers";
import LeaveCard from "../Leave/LeaveCard";

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadEmployeeDetails();
  }, [id]);

  const loadEmployeeDetails = async () => {
    try {
      const [empRes, balanceRes, leavesRes] = await Promise.all([
        getEmployeeById(id),
        getEmployeeLeaveBalance(id),
        getLeaves({ employeeId: id }),
      ]);

      if (empRes.success) setEmployee(empRes.data);
      if (balanceRes.success) setLeaveBalance(balanceRes.data);
      if (leavesRes.success) setLeaves(leavesRes.data);
    } catch (error) {
      console.error("Failed to load employee details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Employee not found.</p>
        <button
          onClick={() => navigate("/employees")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Back to Employee List
        </button>
      </div>
    );
  }

  const getLeaveStatusStats = () => {
    const stats = leaves.reduce((acc, leave) => {
      acc[leave.status] = (acc[leave.status] || 0) + 1;
      return acc;
    }, {});
    return {
      pending: stats.pending || 0,
      approved: stats.approved || 0,
      rejected: stats.rejected || 0,
      total: leaves.length,
    };
  };

  const leaveStats = getLeaveStatusStats();

  return (
    <div className="space-y-6">
      {}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/employees")}
              className="text-gray-400 hover:text-gray-600"
            >
              ← Back to Employees
            </button>
            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-lg font-medium text-gray-700">
                {employee.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {employee.name}
              </h1>
              <p className="text-gray-500">
                {employee.department} • {employee.role}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Employee ID</p>
            <p className="font-mono text-sm">{employee._id.slice(-8)}</p>
          </div>
        </div>

        {}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {[
              { id: "overview", label: "Overview" },
              { id: "leaves", label: "Leave History" },
              { id: "balance", label: "Leave Balance" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {}
      <div className="bg-white rounded-lg shadow-md p-6">
        {}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Employee Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Full Name
                  </label>
                  <p className="mt-1 text-lg text-gray-900">{employee.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Email Address
                  </label>
                  <p className="mt-1 text-lg text-gray-900">{employee.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Department
                  </label>
                  <p className="mt-1 text-lg text-gray-900">
                    {employee.department}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Role
                  </label>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      employee.role === "Admin"
                        ? "bg-purple-100 text-purple-800"
                        : employee.role === "HR"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {employee.role}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Joining Date
                  </label>
                  <p className="mt-1 text-lg text-gray-900">
                    {formatDate(employee.joiningDate)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Current Leave Balance
                  </label>
                  <p className="mt-1 text-2xl font-bold text-green-600">
                    {employee.leaveBalance} days
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Account Status
                  </label>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      employee.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {employee.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Member Since
                  </label>
                  <p className="mt-1 text-lg text-gray-900">
                    {formatDate(employee.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {leaveStats.total}
                </p>
                <p className="text-sm text-blue-800">Total Requests</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {leaveStats.pending}
                </p>
                <p className="text-sm text-yellow-800">Pending</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {leaveStats.approved}
                </p>
                <p className="text-sm text-green-800">Approved</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {leaveStats.rejected}
                </p>
                <p className="text-sm text-red-800">Rejected</p>
              </div>
            </div>
          </div>
        )}

        {}
        {activeTab === "leaves" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Leave History
            </h2>

            {leaves.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No leave requests found.
              </p>
            ) : (
              <div className="space-y-4">
                {leaves.map((leave) => (
                  <LeaveCard key={leave._id} leave={leave} />
                ))}
              </div>
            )}
          </div>
        )}

        {}
        {activeTab === "balance" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Leave Balance Details
            </h2>

            {leaveBalance && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Current Balance
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {leaveBalance.currentBalance} days
                  </p>
                  <p className="text-sm text-green-700 mt-2">
                    Available for use
                  </p>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">
                    Leave Statistics
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Pending:</span>
                      <span className="font-semibold text-blue-900">
                        {leaveBalance.leaveHistory.pending}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Approved:</span>
                      <span className="font-semibold text-blue-900">
                        {leaveBalance.leaveHistory.approved}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Rejected:</span>
                      <span className="font-semibold text-blue-900">
                        {leaveBalance.leaveHistory.rejected}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetails;
