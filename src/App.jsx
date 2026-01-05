import React from "react";
import { Route, Routes } from "react-router-dom";
import HomeLayout from "./layout/HomeLayout";
import Home from "./pages/Home";
import Login from "./auth/Login";
import ProtectRoutes from "./auth/ProtectRoutes";

const App = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectRoutes>
            <HomeLayout />
          </ProtectRoutes>
        }
      >
        <Route index element={<Home />} />
      </Route>
    </Routes>
  );
};

export default App;
