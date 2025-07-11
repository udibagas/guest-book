import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { Layout } from "antd";
import Home from "./pages/Home";
import GuestForm from "./pages/GuestForm";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

const { Content } = Layout;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        <Content>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/guest-form" element={<GuestForm />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
