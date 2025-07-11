import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  DatePicker,
  Button,
  Space,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  ApartmentOutlined,
  ReloadOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import api from "../../api/axios";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange) {
        params.startDate = dateRange[0].format("YYYY-MM-DD");
        params.endDate = dateRange[1].format("YYYY-MM-DD");
      }

      const response = await api.get("/api/visits/stats", { params });
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <Title level={2}>Dashboard</Title>
        <Space>
          <RangePicker
            onChange={setDateRange}
            placeholder={["Tanggal Mulai", "Tanggal Akhir"]}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchStats}
            loading={loading}
          >
            Perbarui
          </Button>
        </Space>
      </div>

      {/* Main Statistics */}
      <Row gutter={[24, 24]} className="stats-section">
        <Col xs={24} sm={12} lg={8}>
          <Card className="stats-card">
            <Statistic
              title="Total Kunjungan"
              value={stats.totalVisits || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1e3a8a", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stats-card">
            <Statistic
              title="Pengunjung Hari Ini"
              value={stats.todayVisits || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#3f8600", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stats-card">
            <Statistic
              title="Sedang Check In"
              value={stats.checkedInVisits || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Statistics */}
      <Row gutter={[24, 24]} className="stats-section">
        <Col xs={24} sm={12} lg={8}>
          <Card className="stats-card">
            <Statistic
              title="Total Tamu"
              value={stats.totalGuests || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#722ed1", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stats-card">
            <Statistic
              title="Total Host"
              value={stats.totalHosts || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#eb2f96", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stats-card">
            <Statistic
              title="Total Departemen"
              value={stats.totalDepartments || 0}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: "#fa8c16", fontWeight: "bold" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Info Cards */}
      <Row gutter={[24, 24]} className="info-section">
        <Col xs={24} lg={12}>
          <Card
            title="Aktivitas Terbaru"
            className="activity-card"
            extra={<a href="/admin/visits">Lihat Semua</a>}
          >
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p>Klik "Lihat Semua" untuk melihat daftar kunjungan terbaru</p>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Statistik Bulanan" className="monthly-stats-card">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Bulan Ini"
                  value={stats.monthlyVisits || 0}
                  valueStyle={{ fontSize: "16px" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Bulan Lalu"
                  value={stats.lastMonthVisits || 0}
                  valueStyle={{ fontSize: "16px" }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
