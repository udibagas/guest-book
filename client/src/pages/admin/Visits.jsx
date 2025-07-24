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
  message,
  Dropdown,
} from "antd";
import {
  EyeOutlined,
  LogoutOutlined,
  ReloadOutlined,
  WhatsAppOutlined,
  MoreOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import api from "../../lib/api";
import dayjs from "dayjs";
import { useCrud } from "../../hooks/useCrud";
import { useMemo } from "react";
import VisitDetail from "../../components/VisitDetail";
import { useFetch } from "../../hooks/useFetch";

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
    PurposeId: null,
    HostId: null,
  });

  const [selectedVisit, setSelectedVisit] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { useFetch: useFetchCrud, refreshData } = useCrud("/visits");

  // Fetch filter options
  const { data: purposes = [] } = useFetch("/purposes");
  const { data: hosts = [] } = useFetch("/hosts");

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
    // Clean up null/empty values
    Object.keys(params).forEach((key) => {
      if (params[key] === null || params[key] === "") {
        delete params[key];
      }
    });
    return params;
  }, [pagination, filters]);

  const { data, isPending } = useFetchCrud(params);

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
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
      refreshData();
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

  const sendNotification = async (visitId) => {
    try {
      await api.post("/notifications/guest-registered", { visitId });
      message.success("Notifikasi WhatsApp berhasil dikirim ke PIC!");
    } catch (error) {
      console.error("Error sending notification:", error);
      message.error(
        error.response?.data?.message || "Gagal mengirim notifikasi WhatsApp"
      );
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
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Select
            placeholder="Pilih tujuan"
            value={selectedKeys[0]}
            onChange={(value) => {
              setSelectedKeys(value ? [value] : []);
              setFilters((prev) => ({ ...prev, PurposeId: value || null }));
              setPagination((prev) => ({ ...prev, current: 1 }));
              confirm();
            }}
            allowClear
            style={{ width: 200, marginBottom: 8, display: "block" }}
            onClear={() => {
              clearFilters();
              setFilters((prev) => ({ ...prev, PurposeId: null }));
              setPagination((prev) => ({ ...prev, current: 1 }));
              confirm();
            }}
          >
            {purposes.map((purpose) => (
              <Option key={purpose.id} value={purpose.id}>
                {purpose.name}
              </Option>
            ))}
          </Select>
        </div>
      ),
      filterIcon: (filtered) => (
        <FilterOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      filteredValue: filters.PurposeId ? [filters.PurposeId] : null,
    },
    {
      title: "PIC",
      dataIndex: ["Host", "name"],
      key: "hostName",
      render: (hostName) => hostName || "-",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Select
            placeholder="Pilih PIC"
            value={selectedKeys[0]}
            onChange={(value) => {
              setSelectedKeys(value ? [value] : []);
              setFilters((prev) => ({ ...prev, HostId: value || null }));
              setPagination((prev) => ({ ...prev, current: 1 }));
              confirm();
            }}
            allowClear
            style={{ width: 200, marginBottom: 8, display: "block" }}
            onClear={() => {
              clearFilters();
              setFilters((prev) => ({ ...prev, HostId: null }));
              setPagination((prev) => ({ ...prev, current: 1 }));
              confirm();
            }}
          >
            {hosts.map((host) => (
              <Option key={host.id} value={host.id}>
                {host.name}
              </Option>
            ))}
          </Select>
        </div>
      ),
      filterIcon: (filtered) => (
        <FilterOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      filteredValue: filters.HostId ? [filters.HostId] : null,
    },
    {
      title: "Waktu Masuk",
      dataIndex: "checkInTime",
      key: "checkInTime",
      render: (time) => dayjs(time).format("DD-MMM-YYYY HH:mm"),
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
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Select
            placeholder="Pilih status"
            value={selectedKeys[0]}
            onChange={(value) => {
              setSelectedKeys(value ? [value] : []);
              setFilters((prev) => ({ ...prev, status: value || "" }));
              setPagination((prev) => ({ ...prev, current: 1 }));
              confirm();
            }}
            allowClear
            style={{ width: 150, marginBottom: 8, display: "block" }}
            onClear={() => {
              clearFilters();
              setFilters((prev) => ({ ...prev, status: "" }));
              setPagination((prev) => ({ ...prev, current: 1 }));
              confirm();
            }}
          >
            <Option value="checked_in">Sudah Masuk</Option>
            <Option value="checked_out">Sudah Keluar</Option>
          </Select>
        </div>
      ),
      filterIcon: (filtered) => (
        <FilterOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      filteredValue: filters.status ? [filters.status] : null,
    },
    {
      title: "Aksi",
      key: "actions",
      width: 80,
      render: (_, record) => {
        const items = [
          {
            key: "view",
            label: "Lihat Detail",
            icon: <EyeOutlined />,
            onClick: () => showVisitDetails(record.id),
          },
        ];

        // Add WhatsApp notification option if host has phone number
        if (record.Host?.phoneNumber) {
          items.push({
            key: "whatsapp",
            label: "Kirim Notifikasi WhatsApp",
            icon: <WhatsAppOutlined style={{ color: "#25D366" }} />,
            onClick: () => sendNotification(record.id),
          });
        }

        // Add checkout option if still checked in
        if (record.status === "checked_in") {
          items.push({
            key: "checkout",
            label: "Check Out",
            icon: <LogoutOutlined />,
            onClick: () => handleCheckOut(record.id),
          });
        }

        return (
          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      <Card style={{ minHeight: "calc(100vh - 100px)" }}>
        <div className="page-header">
          <Title level={3}>Kelola Kunjungan</Title>
          <div style={{ display: "flex", gap: 10 }}>
            <Input.Search
              placeholder="Cari berdasarkan nama tamu atau perusahaan"
              allowClear
              onSearch={handleSearch}
              style={{ width: 400 }}
            />
            <RangePicker
              onChange={handleDateFilter}
              placeholder={["Tanggal Mulai", "Tanggal Akhir"]}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={refreshData}
              loading={isPending}
            >
              Perbarui
            </Button>
          </div>
        </div>

        {/* Filters */}
        {/* <div style={{ marginBottom: 20, backgroundColor: "#fafcffff" }}>
          <Space>
            <strong>Filter:</strong>
          </Space>
        </div> */}

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
            total: data?.data?.count || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} kunjungan`,
          }}
          onChange={(paginationInfo) => {
            setPagination(paginationInfo);
          }}
        />
      </Card>

      {/* Visit Details Modal */}
      <VisitDetail
        visit={selectedVisit}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        handleCheckOut={handleCheckOut}
      />
    </>
  );
};

export default Visits;
