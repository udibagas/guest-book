import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { Layout } from "antd";
import AdminLayout from "./components/AdminLayout";
import { lazy } from "react";

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
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
