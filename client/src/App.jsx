import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { Layout } from "antd";
import AdminLayout from "./components/AdminLayout";

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
            <Route path="/" element={() => import("./pages/Home")} />
            <Route
              path="/guest-form"
              element={() => import("./pages/GuestForm")}
            />
            <Route path="/login" element={() => import("./pages/Login")} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={() => import("./pages/admin/Dashboard")} />
              <Route
                path="visits"
                element={() => import("./pages/admin/Visits")}
              />
              <Route
                path="guests"
                element={() => import("./pages/admin/Guests")}
              />
              <Route
                path="hosts"
                element={() => import("./pages/admin/Hosts")}
              />
              <Route
                path="departments"
                element={() => import("./pages/admin/Departments")}
              />
              <Route
                path="roles"
                element={() => import("./pages/admin/Roles")}
              />
              <Route
                path="purposes"
                element={() => import("./pages/admin/Purposes")}
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
