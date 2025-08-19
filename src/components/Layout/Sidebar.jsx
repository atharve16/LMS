import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isHR, isAdmin, isEmployee } = useAuth();
  const location = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "🏠",
      allowedRoles: ["Employee", "HR", "Admin"],
    },
    {
      name: "My Leaves",
      href: "/leaves",
      icon: "📋",
      allowedRoles: ["Employee"],
    },
    {
      name: "Leave Balance",
      href: "/leave-balance",
      icon: "⚖️",
      allowedRoles: ["Employee"],
    },
    {
      name: "Employees",
      href: "/employees",
      icon: "👥",
      allowedRoles: ["HR", "Admin"],
    },
    {
      name: "Leave Requests",
      href: "/leaves",
      icon: "📝",
      allowedRoles: ["HR", "Admin"],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: "📊",
      allowedRoles: ["HR", "Admin"],
    },
    {
      name: "Settings",
      href: "/settings",
      icon: "⚙️",
      allowedRoles: ["Admin"],
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.allowedRoles.includes(user?.role)
  );

  const NavItem = ({ item }) => (
    <NavLink
      key={item.name}
      to={item.href}
      onClick={onClose}
      className={({ isActive }) =>
        `group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${
          isActive
            ? "bg-indigo-100 text-indigo-900"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`
      }
    >
      <span className="mr-4 text-lg">{item.icon}</span>
      {item.name}
    </NavLink>
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 bg-indigo-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🏢</span>
              </div>
              <span className="ml-2 text-white text-lg font-semibold">LMS</span>
            </div>
            <button
              type="button"
              className="p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-600 lg:hidden"
              onClick={onClose}
            >
              <span className="sr-only">Close sidebar</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="px-4 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role} • {user?.department}
                </p>
              </div>
            </div>
          </div>

          {}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>

          {}
          <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-2">Quick Info</div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Leave Balance:</span>
                <span className="font-medium text-green-600">
                  {user?.leaveBalance || 0} days
                </span>
              </div>
              {(isHR || isAdmin) && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Role:</span>
                  <span
                    className={`font-medium ${
                      isAdmin ? "text-purple-600" : "text-blue-600"
                    }`}
                  >
                    {user?.role}
                  </span>
                </div>
              )}
            </div>
          </div>

          {}
          <div className="px-4 py-2 bg-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Leave Management System v1.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
