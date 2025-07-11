import React, { useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Space, Typography } from "antd";
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
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router";

const { Sider, Header, Content } = Layout;
const { Title } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

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
      icon: <UserOutlined />,
      label: "Tamu",
    },
    {
      key: "/admin/hosts",
      icon: <TeamOutlined />,
      label: "Host",
    },
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
  ];

  const dropdownMenu = {
    items: [
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
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="admin-sidebar"
        width={250}
      >
        <div className="admin-logo">
          <Title
            level={collapsed ? 5 : 4}
            style={{ color: "white", margin: 0 }}
          >
            {collapsed ? "MT" : "Mitrateknik"}
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
    </Layout>
  );
};

export default AdminLayout;
