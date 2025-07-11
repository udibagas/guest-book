import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Input,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Modal,
  Image,
  message,
  Popconfirm,
  Descriptions,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  LogoutOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import axios from "axios";
import dayjs from "dayjs";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Admin = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    dateRange: null,
  });
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchVisits();
    fetchStats();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.dateRange && {
          startDate: filters.dateRange[0].format("YYYY-MM-DD"),
          endDate: filters.dateRange[1].format("YYYY-MM-DD"),
        }),
      };

      const response = await axios.get("/api/visits", { params });

      setVisits(response.data.data.visits);
      setPagination((prev) => ({
        ...prev,
        total: response.data.data.pagination.totalCount,
      }));
    } catch (error) {
      console.error("Error fetching visits:", error);
      message.error("Failed to fetch visit data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/visits/stats");
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleStatusFilter = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleDateFilter = (dates) => {
    setFilters((prev) => ({ ...prev, dateRange: dates }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleCheckOut = async (visitId) => {
    try {
      await axios.put(`/api/visits/${visitId}/checkout`);
      message.success("Guest checked out successfully");
      fetchVisits();
      fetchStats();
    } catch (error) {
      console.error("Error checking out visit:", error);
      message.error("Failed to check out guest");
    }
  };

  const handleDelete = async (visitId) => {
    try {
      await axios.delete(`/api/visits/${visitId}`);
      message.success("Visit record deleted successfully");
      fetchVisits();
      fetchStats();
    } catch (error) {
      console.error("Error deleting visit:", error);
      message.error("Failed to delete visit record");
    }
  };

  const showVisitDetails = async (visitId) => {
    try {
      const response = await axios.get(`/api/visits/${visitId}`);
      setSelectedVisit(response.data.data);
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching visit details:", error);
      message.error("Failed to fetch visit details");
    }
  };

  const columns = [
    {
      title: "Guest Name",
      dataIndex: ["Guest", "name"],
      key: "guestName",
      sorter: true,
    },
    {
      title: "Email",
      dataIndex: ["Guest", "email"],
      key: "guestEmail",
    },
    {
      title: "Company",
      dataIndex: ["Guest", "company"],
      key: "guestCompany",
      render: (company) => company || "-",
    },
    {
      title: "Purpose",
      dataIndex: ["Purpose", "name"],
      key: "purposeName",
    },
    {
      title: "Host",
      dataIndex: ["Host", "name"],
      key: "hostName",
      render: (hostName) => hostName || "-",
    },
    {
      title: "Check In",
      dataIndex: "checkInTime",
      key: "checkInTime",
      render: (time) => dayjs(time).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "checked_in" ? "green" : "blue"}>
          {status === "checked_in" ? "Checked In" : "Checked Out"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => showVisitDetails(record.id)}
            title="View Details"
          />
          {record.status === "checked_in" && (
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={() => handleCheckOut(record.id)}
              title="Check Out"
            />
          )}
          <Popconfirm
            title="Are you sure you want to delete this visit record?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Delete"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-container">
      <Card
        title={
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/")}
            />
            <Title level={2} style={{ margin: 0 }}>
              Admin Dashboard
            </Title>
          </Space>
        }
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              fetchVisits();
              fetchStats();
            }}
          >
            Refresh
          </Button>
        }
      >
        {/* Statistics */}
        <Row gutter={16} className="stats-card">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Visits"
                value={stats.totalVisits || 0}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Today's Visitors"
                value={stats.todayVisits || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Currently Checked In"
                value={stats.checkedInVisits || 0}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Input.Search
                placeholder="Search by name, email, or company"
                allowClear
                onSearch={handleSearch}
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Select
                placeholder="Filter by status"
                allowClear
                style={{ width: "100%" }}
                onChange={handleStatusFilter}
              >
                <Option value="checked_in">Checked In</Option>
                <Option value="checked_out">Checked Out</Option>
              </Select>
            </Col>
            <Col xs={24} sm={10}>
              <RangePicker
                style={{ width: "100%" }}
                onChange={handleDateFilter}
                placeholder={["Start Date", "End Date"]}
              />
            </Col>
          </Row>
        </Card>

        {/* Visit Table */}
        <Table
          columns={columns}
          dataSource={visits}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} visits`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Visit Details Modal */}
      <Modal
        title="Visit Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
          selectedVisit?.status === "checked_in" && (
            <Button
              key="checkout"
              type="primary"
              icon={<LogoutOutlined />}
              onClick={() => {
                handleCheckOut(selectedVisit.id);
                setModalVisible(false);
              }}
            >
              Check Out
            </Button>
          ),
        ]}
        width={800}
      >
        {selectedVisit && (
          <div>
            <Descriptions
              title="Guest Information"
              bordered
              column={2}
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="Name">
                {selectedVisit.Guest?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedVisit.Guest?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedVisit.Guest?.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Company">
                {selectedVisit.Guest?.company || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                {selectedVisit.Guest?.role}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions
              title="Visit Information"
              bordered
              column={2}
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="Purpose">
                {selectedVisit.Purpose?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Host">
                {selectedVisit.Host?.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {selectedVisit.Host?.department || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Check In">
                {dayjs(selectedVisit.checkInTime).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              {selectedVisit.checkOutTime && (
                <Descriptions.Item label="Check Out">
                  {dayjs(selectedVisit.checkOutTime).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    selectedVisit.status === "checked_in" ? "green" : "blue"
                  }
                >
                  {selectedVisit.status === "checked_in"
                    ? "Checked In"
                    : "Checked Out"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {selectedVisit.customPurpose && (
              <div style={{ marginBottom: 16 }}>
                <Title level={5}>Custom Purpose:</Title>
                <p
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: 8,
                    borderRadius: 4,
                  }}
                >
                  {selectedVisit.customPurpose}
                </p>
              </div>
            )}

            {selectedVisit.notes && (
              <div style={{ marginBottom: 16 }}>
                <Title level={5}>Notes:</Title>
                <p
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: 8,
                    borderRadius: 4,
                  }}
                >
                  {selectedVisit.notes}
                </p>
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <Title level={5}>ID Photo:</Title>
              {selectedVisit.Guest?.idPhotoPath && (
                <Image
                  src={`${axios.defaults.baseURL || ""}${
                    selectedVisit.Guest.idPhotoPath
                  }`}
                  alt="Guest ID"
                  style={{ maxWidth: "100%", maxHeight: 300 }}
                />
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Admin;
