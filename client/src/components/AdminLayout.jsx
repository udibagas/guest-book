import { useState } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import { useMutation } from "@tanstack/react-query";
import api from "../lib/api";
import {
  DashboardOutlined,
  TeamOutlined,
  ApartmentOutlined,
  IdcardOutlined,
  UserOutlined,
  AimOutlined,
  CalendarOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  UsergroupAddOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router";

const { Sider, Header, Content } = Layout;
const { Title } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put("/users/profile", data);
      return response.data;
    },
    onSuccess: (response) => {
      message.success("Profil berhasil diperbarui");
      // Update local storage with new user data
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setProfileModalOpen(false);
      form.resetFields();
    },
    onError: (error) => {
      message.error(
        error.response?.data?.message || "Gagal memperbarui profil"
      );
    },
  });

  const handleProfileUpdate = (values) => {
    updateProfileMutation.mutate(values);
  };

  const handleProfileClick = () => {
    form.setFieldsValue({
      username: user.username,
      email: user.email,
    });
    setProfileModalOpen(true);
  };

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/admin/visits",
      icon: <CalendarOutlined />,
      label: "Kunjungan",
    },
    {
      key: "/admin/guests",
      icon: <TeamOutlined />,
      label: "Tamu",
    },
    {
      key: "/admin/hosts",
      icon: <UserOutlined />,
      label: "PIC",
    },
    {
      key: "/admin/reports",
      icon: <BarChartOutlined />,
      label: "Laporan",
    },
  ];

  if (user.role === "admin") {
    menuItems.push(
      {
        key: "/admin/departments",
        icon: <ApartmentOutlined />,
        label: "Departemen",
      },
      {
        key: "/admin/roles",
        icon: <IdcardOutlined />,
        label: "Jabatan",
      },
      {
        key: "/admin/purposes",
        icon: <AimOutlined />,
        label: "Tujuan",
      },
      {
        key: "/admin/users",
        icon: <UsergroupAddOutlined />,
        label: "Pengguna",
      }
    );
  }

  const dropdownMenu = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Profil",
        onClick: handleProfileClick,
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Keluar",
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout className="admin-layout">
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="admin-logo">
          <Title
            level={collapsed ? 5 : 4}
            style={{ color: "white", margin: 0 }}
          >
            {collapsed ? "BT" : "Buku Tamu"}
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="admin-menu"
        />
      </Sider>

      <Layout className="admin-main-layout">
        <Header className="admin-header">
          <div className="admin-header-left">
            <MenuFoldOutlined
              className="admin-trigger"
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "18px",
                cursor: "pointer",
                transition: "color 0.3s",
              }}
            />
          </div>

          <div className="admin-header-right">
            <Dropdown menu={dropdownMenu} placement="bottomRight">
              <Space className="admin-user-info" style={{ cursor: "pointer" }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user.username || "Admin"}</span>
              </Space>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            background: "#f0f2f5",
            padding: "20px",
            minHeight: "calc(100vh - 112px)",
          }}
        >
          <Outlet />
        </Content>
      </Layout>

      {/* Profile Update Modal */}
      <Modal
        width={550}
        title="Update Profil"
        open={profileModalOpen}
        cancelText="Batal"
        onCancel={() => {
          setProfileModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Simpan"
        okButtonProps={{
          variant: "solid",
          color: "default",
          loading: updateProfileMutation.isPending,
        }}
      >
        <Form
          form={form}
          layout="horizontal"
          labelAlign="left"
          requiredMark={false}
          labelCol={{ span: 10 }}
          style={{ marginTop: 20 }}
          colon={false}
          variant="filled"
          onFinish={handleProfileUpdate}
          autoComplete="off"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: "Silakan masukkan username" },
              { min: 3, message: "Username minimal 3 karakter" },
            ]}
          >
            <Input placeholder="Masukkan username" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Silakan masukkan email" },
              { type: "email", message: "Silakan masukkan email yang valid" },
            ]}
          >
            <Input placeholder="Masukkan email" />
          </Form.Item>

          <Form.Item
            label="Password Baru (opsional)"
            name="password"
            rules={[{ min: 6, message: "Password minimal 6 karakter" }]}
          >
            <Input.Password placeholder="Kosongkan jika tidak ingin mengubah" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminLayout;
