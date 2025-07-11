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
  DatePicker,
  Select,
  Modal,
  Image,
  message,
  Popconfirm,
  Descriptions,
} from "antd";
import {
  EyeOutlined,
  LogoutOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import api from "../../api/axios";
import dayjs from "dayjs";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Visits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
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

      const response = await api.get("/api/visits", { params });

      setVisits(response.data.data.visits);
      setPagination((prev) => ({
        ...prev,
        total: response.data.data.pagination.totalCount,
      }));
    } catch (error) {
      console.error("Error fetching visits:", error);
      message.error("Gagal memuat data kunjungan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, filters]);

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
      await api.put(`/api/visits/${visitId}/checkout`);
      message.success("Tamu berhasil check out");
      fetchVisits();
    } catch (error) {
      console.error("Error checking out visit:", error);
      message.error("Gagal check out tamu");
    }
  };

  const handleDelete = async (visitId) => {
    try {
      await api.delete(`/api/visits/${visitId}`);
      message.success("Catatan kunjungan berhasil dihapus");
      fetchVisits();
    } catch (error) {
      console.error("Error deleting visit:", error);
      message.error("Gagal menghapus catatan kunjungan");
    }
  };

  const showVisitDetails = async (visitId) => {
    try {
      const response = await api.get(`/api/visits/${visitId}`);
      setSelectedVisit(response.data.data);
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching visit details:", error);
      message.error("Gagal memuat detail kunjungan");
    }
  };

  const columns = [
    {
      title: "Nama Tamu",
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
      title: "Perusahaan",
      dataIndex: ["Guest", "company"],
      key: "guestCompany",
      render: (company) => company || "-",
    },
    {
      title: "Tujuan",
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
      title: "Waktu Masuk",
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
          {status === "checked_in" ? "Sudah Masuk" : "Sudah Keluar"}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => showVisitDetails(record.id)}
            title="Lihat Detail"
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
            title="Apakah Anda yakin ingin menghapus catatan kunjungan ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Hapus"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <div className="page-header">
          <Title level={2}>Manajemen Kunjungan</Title>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchVisits}
            loading={loading}
          >
            Perbarui
          </Button>
        </div>

        {/* Filters */}
        <Card className="filter-card" style={{ marginBottom: 16 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            Filter Data
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Input.Search
                placeholder="Cari berdasarkan nama, email, atau perusahaan"
                allowClear
                onSearch={handleSearch}
                style={{ width: "100%" }}
                size="large"
              />
            </Col>
            <Col xs={24} sm={6}>
              <Select
                placeholder="Filter berdasarkan status"
                allowClear
                style={{ width: "100%" }}
                onChange={handleStatusFilter}
                size="large"
              >
                <Option value="checked_in">Sudah Masuk</Option>
                <Option value="checked_out">Sudah Keluar</Option>
              </Select>
            </Col>
            <Col xs={24} sm={10}>
              <RangePicker
                style={{ width: "100%" }}
                onChange={handleDateFilter}
                placeholder={["Tanggal Mulai", "Tanggal Akhir"]}
                size="large"
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
              `${range[0]}-${range[1]} dari ${total} kunjungan`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Visit Details Modal */}
      <Modal
        title="Detail Kunjungan"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Tutup
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
              title="Informasi Tamu"
              bordered
              column={2}
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="Nama">
                {selectedVisit.Guest?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedVisit.Guest?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Nomor Telepon">
                {selectedVisit.Guest?.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Perusahaan">
                {selectedVisit.Guest?.company || "Tidak ada"}
              </Descriptions.Item>
              <Descriptions.Item label="Jabatan">
                {selectedVisit.Guest?.role}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions
              title="Informasi Kunjungan"
              bordered
              column={2}
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="Tujuan">
                {selectedVisit.Purpose?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Host">
                {selectedVisit.Host?.name || "Tidak ada"}
              </Descriptions.Item>
              <Descriptions.Item label="Departemen">
                {selectedVisit.Host?.department || "Tidak ada"}
              </Descriptions.Item>
              <Descriptions.Item label="Waktu Masuk">
                {dayjs(selectedVisit.checkInTime).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              {selectedVisit.checkOutTime && (
                <Descriptions.Item label="Waktu Keluar">
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
                    ? "Sudah Masuk"
                    : "Sudah Keluar"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {selectedVisit.customPurpose && (
              <div style={{ marginBottom: 16 }}>
                <Title level={5}>Tujuan Kustom:</Title>
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
                <Title level={5}>Catatan:</Title>
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
              <Title level={5}>Foto Identitas:</Title>
              {selectedVisit.Guest?.idPhotoPath && (
                <Image
                  src={`${
                    import.meta.env.VITE_API_URL || "http://localhost:3001"
                  }${selectedVisit.Guest.idPhotoPath}`}
                  alt="Identitas Tamu"
                  style={{ maxWidth: "100%", maxHeight: 300 }}
                />
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Visits;
