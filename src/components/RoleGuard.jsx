import React from "react";
import { Navigate } from "react-router-dom";

// Component để kiểm tra quyền truy cập dựa trên role
export default function RoleGuard({ children, allowedRoles }) {
  // Lấy thông tin user từ localStorage
  const getUserInfo = () => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  const user = getUserInfo();
  const userRole = user?.role;
  const userRoles = Array.isArray(user?.role) ? user.role : [user?.role];

  // Kiểm tra token
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra user data
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra roles (multi-role support)
  if (allowedRoles && !userRoles.some(role => allowedRoles.includes(role))) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// HOC để wrap component với role guard
export function withRoleGuard(Component, allowedRoles) {
  return function ProtectedComponent(props) {
    return (
      <RoleGuard allowedRoles={allowedRoles}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}
