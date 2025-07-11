import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { Layout } from "antd";
import Home from "./pages/Home";
import GuestForm from "./pages/GuestForm";
import Login from "./pages/Login";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Visits from "./pages/admin/Visits";
import Guests from "./pages/admin/Guests";
import Hosts from "./pages/admin/Hosts";
import Departments from "./pages/admin/Departments";
import Roles from "./pages/admin/Roles";
import Purposes from "./pages/admin/Purposes";

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
