import { Card, Row, Col, Statistic, Typography, Button } from "antd";
import {
  ClockCircleOutlined,
  ReloadOutlined,
  CalendarOutlined,
  UserSwitchOutlined,
  // UserOutlined,
  // TeamOutlined,
  // ApartmentOutlined,
} from "@ant-design/icons";
import { Link } from "react-router";
import { useFetch } from "../../hooks/useFetch";
import { useQueryClient } from "@tanstack/react-query";
import VisitTable from "../../components/VisitTable";

const { Title } = Typography;

const Dashboard = () => {
  const queryClient = useQueryClient();
  const { data: stats = {}, isPending: loading } = useFetch("/visits/stats");

  return (
    <div style={{ minHeight: "calc(100vh - 100px)", padding: 24 }}>
      <div className="dashboard-header">
        <Title level={3}>Dashboard</Title>
        <Button
          icon={<ReloadOutlined />}
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["/visits/stats"] })
          }
          loading={loading}
        >
          Perbarui
        </Button>
      </div>

      {/* Main Statistics */}
      <Row gutter={[24, 24]} className="stats-section">
        <Col xs={24} sm={12} lg={8}>
          <Card className="stats-card">
            <Statistic
              title="Total Kunjungan"
              value={stats.totalVisits || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1e3a8a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stats-card">
            <Statistic
              title="Pengunjung Hari Ini"
              value={stats.todayVisits || 0}
              prefix={<UserSwitchOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stats-card">
            <Statistic
              title="Sedang Check In"
              value={stats.checkedInVisits || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Statistics */}
      {/* <Row gutter={[24, 24]} className="stats-section">
        <Col xs={24} sm={12} lg={8}>
          <Card className="stats-card">
            <Statistic
              title="Total Tamu"
              value={stats.totalGuests || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stats-card">
            <Statistic
              title="Total PIC"
              value={stats.totalHosts || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#eb2f96" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stats-card">
            <Statistic
              title="Total Departemen"
              value={stats.totalDepartments || 0}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row> */}

      <VisitTable />
    </div>
  );
};

export default Dashboard;
