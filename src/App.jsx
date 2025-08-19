import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import EmployeeDashboard from "./components/Dashboard/EmployeeDashboard";
import HRDashboard from "./components/Dashboard/HRDashboard";
import EmployeeList from "./components/Employee/EmployeeList";
import LeaveList from "./components/Leave/LeaveList";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import EmployeeDetails from "./components/Employee/EmployeeDetails";
import LeaveBalance from './components/Leave/LeaveBalance';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={
            user?.role === "Admin" ? (
              <AdminDashboard />
            ) : user?.role === "HR" ? (
              <HRDashboard />
            ) : (
              <EmployeeDashboard />
            )
          }
        />
        <Route
          path="employees"
          element={
            <ProtectedRoute requiredRole="HR">
              <EmployeeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="employees/:id"
          element={
            <ProtectedRoute requiredRole="HR">
              <EmployeeDetails />
            </ProtectedRoute>
          }
        />
        <Route path="leaves" element={<LeaveList />} />
        <Route path="leave-balance" element={<LeaveBalance />} />
        <Route path="" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
