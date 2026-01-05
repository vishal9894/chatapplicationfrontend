import React from "react";
import { Navigate } from "react-router-dom";

const ProtectRoutes = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token");

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectRoutes;
