import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { Layout, Spin } from "antd";
import AdminLayout from "./components/AdminLayout";
import { lazy, useState, useEffect } from "react";
import api from "./lib/api";

const { Content } = Layout;

const Home = lazy(() => import("./pages/Home"));
const GuestForm = lazy(() => import("./pages/GuestForm"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Visits = lazy(() => import("./pages/admin/Visits"));
const Guests = lazy(() => import("./pages/admin/Guests"));
const Hosts = lazy(() => import("./pages/admin/Hosts"));
const Departments = lazy(() => import("./pages/admin/Departments"));
const Roles = lazy(() => import("./pages/admin/Roles"));
const Purposes = lazy(() => import("./pages/admin/Purposes"));
const Users = lazy(() => import("./pages/admin/Users"));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (!token || !user) {
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }

      try {
        // Validate token by making a request to the backend
        await api.get("/auth/me");
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid or expired, clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        console.log("Token validation failed:", error);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, []);

  // Show loading while validating token
  if (isValidating) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Memvalidasi akses..." />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
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
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="visits" element={<Visits />} />
              <Route path="guests" element={<Guests />} />
              <Route path="hosts" element={<Hosts />} />
              <Route path="departments" element={<Departments />} />
              <Route path="roles" element={<Roles />} />
              <Route path="purposes" element={<Purposes />} />
              <Route path="users" element={<Users />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
