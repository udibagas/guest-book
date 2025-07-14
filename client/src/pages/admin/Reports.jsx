import { useState, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Space,
  Typography,
  Spin,
  Alert,
} from "antd";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import {
  CalendarOutlined,
  TeamOutlined,
  AimOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useFetch } from "../../hooks/useFetch";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const { Title: PageTitle } = Typography;
const { RangePicker } = DatePicker;

const Reports = () => {
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);

  // Create query parameters for the API call
  const queryParams = useMemo(() => {
    return {
      startDate: dateRange[0].format("YYYY-MM-DD"),
      endDate: dateRange[1].format("YYYY-MM-DD"),
    };
  }, [dateRange]);

  // Use the useFetch hook for data fetching
  const {
    data: reportData,
    isLoading: loading,
    error,
  } = useFetch("visits/reports", queryParams);

  // Set default values if data is not yet loaded
  const safeReportData = reportData || {
    totalVisits: 0,
    visitsByDepartment: [],
    visitsByPurpose: [],
    visitsByDay: [],
  };

  const departmentChartData = {
    labels: safeReportData.visitsByDepartment.map((item) => item.name),
    datasets: [
      {
        label: "Jumlah Kunjungan",
        data: safeReportData.visitsByDepartment.map((item) => item.count),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        borderWidth: 1,
      },
    ],
  };

  const purposeChartData = {
    labels: safeReportData.visitsByPurpose.map((item) => item.name),
    datasets: [
      {
        label: "Jumlah Kunjungan",
        data: safeReportData.visitsByPurpose.map((item) => item.count),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#FF6384",
          "#36A2EB",
        ],
      },
    ],
  };

  const dailyVisitsChartData = {
    labels: safeReportData.visitsByDay.map((item) =>
      dayjs(item.date).format("DD/MMM")
    ),
    datasets: [
      {
        label: "Kunjungan Harian",
        data: safeReportData.visitsByDay.map((item) => item.count),
        borderColor: "#36A2EB",
        backgroundColor: "rgba(54, 162, 235, 0.1)",
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
    },
  };

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <PageTitle level={3}>Laporan Kunjungan</PageTitle>
        <Space>
          <span>Periode:</span>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            format="DD-MMM-YYYY"
            allowClear={false}
          />
        </Space>
      </div>

      {error && (
        <Alert
          message="Error Loading Reports"
          description="Failed to load report data. Please try again later."
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" tip="Memuat data laporan..." />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Kunjungan"
                  value={safeReportData.totalVisits}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Departemen Terlibat"
                  value={safeReportData.visitsByDepartment.length}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Jenis Tujuan"
                  value={safeReportData.visitsByPurpose.length}
                  prefix={<AimOutlined />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Rata-rata per Hari"
                  value={
                    safeReportData.visitsByDay.length > 0
                      ? Math.round(
                          safeReportData.totalVisits /
                            safeReportData.visitsByDay.length
                        )
                      : 0
                  }
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Kunjungan per Departemen">
                <div style={{ height: "400px" }}>
                  <Bar data={departmentChartData} options={chartOptions} />
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Kunjungan per Tujuan">
                <div style={{ height: "400px" }}>
                  <Pie data={purposeChartData} options={pieChartOptions} />
                </div>
              </Card>
            </Col>
            <Col xs={24}>
              <Card title="Trend Kunjungan Harian">
                <div style={{ height: "400px" }}>
                  <Line data={dailyVisitsChartData} options={chartOptions} />
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Reports;
