import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { Layout } from "antd";
import Home from "./pages/Home";
import GuestForm from "./pages/GuestForm";
import Admin from "./pages/Admin";

const { Content } = Layout;

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        <Content>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/guest-form" element={<GuestForm />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
