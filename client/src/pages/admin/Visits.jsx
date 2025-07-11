import { useState } from "react";
import {
  Table,
  Card,
  Input,
  Button,
  Space,
  Tag,
  Typography,
  DatePicker,
  Select,
  Modal,
  Image,
  message,
  Descriptions,
} from "antd";
import { EyeOutlined, LogoutOutlined, ReloadOutlined } from "@ant-design/icons";
import api from "../../lib/api";
import dayjs from "dayjs";
import { useCrud } from "../../hooks/useCrud";
import { useMemo } from "react";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Visits = () => {
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

  const {
    useFetch: useFetchCrud,
    refreshData,
    queryClient,
  } = useCrud("/visits");

  const params = useMemo(() => {
    const params = {
      page: pagination.current,
      limit: pagination.pageSize,
      ...filters,
    };
    if (filters.dateRange) {
      params.startDate = filters.dateRange[0].format("YYYY-MM-DD");
      params.endDate = filters.dateRange[1].format("YYYY-MM-DD");
    }
    return params;
  }, [pagination, filters]);

  const { data, isPending } = useFetchCrud(params);

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
      await api.put(`/visits/${visitId}/checkout`);
      message.success("Tamu berhasil check out");
      queryClient.invalidateQueries({ queryKey: "/visits" });
    } catch (error) {
      console.error("Error checking out visit:", error);
      message.error("Gagal check out tamu");
    }
  };

  const showVisitDetails = async (visitId) => {
    try {
      const response = await api.get(`/visits/${visitId}`);
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
      title: "PIC",
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
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card style={{ minHeight: "calc(100vh - 100px)" }}>
        <div className="page-header">
          <Title level={3}>Kelola Kunjungan</Title>
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshData}
            loading={isPending}
          >
            Perbarui
          </Button>
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: 20, backgroundColor: "#f0f2f5" }}>
          <Space>
            <strong>Filter:</strong>
            <Input.Search
              placeholder="Cari berdasarkan nama, email, atau perusahaan"
              allowClear
              onSearch={handleSearch}
              style={{ width: 400 }}
            />
            <Select
              placeholder="Filter berdasarkan status"
              allowClear
              style={{ width: 220 }}
              onChange={handleStatusFilter}
            >
              <Option value="checked_in">Sudah Masuk</Option>
              <Option value="checked_out">Sudah Keluar</Option>
            </Select>
            <RangePicker
              style={{ width: "100%" }}
              onChange={handleDateFilter}
              placeholder={["Tanggal Mulai", "Tanggal Akhir"]}
            />
          </Space>
        </Card>

        {/* Visit Table */}
        <Table
          size="middle"
          columns={columns}
          dataSource={data?.data?.rows || []}
          rowKey="id"
          loading={isPending}
          onRow={(record) => ({
            onDoubleClick: () => showVisitDetails(record.id),
            style: { cursor: "pointer" },
          })}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} kunjungan`,
          }}
          onChange={(pagination) => setPagination(pagination)}
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
              size="small"
              title="Informasi Tamu"
              bordered
              column={1}
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
              size="small"
              title="Informasi Kunjungan"
              bordered
              column={1}
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="Tujuan">
                {selectedVisit.Purpose?.name}
              </Descriptions.Item>
              <Descriptions.Item label="PIC">
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
