import { useState } from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import api from "../api/axios";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", values);

      const { token, user } = data;

      // Store token in localStorage
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(user));

      message.success("Login berhasil!");
      navigate("/admin");
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Login gagal. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/")}
            className="back-button"
          />
          <div className="login-title-section">
            <Title level={2} className="login-title">
              Login Admin
            </Title>
            <Text className="login-subtitle">
              Masuk untuk mengakses dashboard admin
            </Text>
          </div>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          className="login-form"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[
              {
                required: true,
                message: "Silakan masukkan username!",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Masukkan username"
              className="login-input"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                message: "Silakan masukkan password!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Masukkan password"
              className="login-input"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="login-button"
              block
            >
              {loading ? "Sedang Login..." : "Login"}
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
          <Text type="secondary" className="login-footer-text">
            Hanya admin yang dapat mengakses halaman ini
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
