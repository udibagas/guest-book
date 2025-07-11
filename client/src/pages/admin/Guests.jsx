import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Input,
  Button,
  Space,
  Typography,
  Image,
  message,
  Popconfirm,
} from "antd";
import { EyeOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import api from "../../api/axios";

const { Title } = Typography;

const Guests = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...(searchText && { search: searchText }),
      };

      const response = await api.get("/api/guests", { params });
      setGuests(response.data.data.guests || response.data.data);

      if (response.data.data.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: response.data.data.pagination.totalCount,
        }));
      }
    } catch (error) {
      console.error("Error fetching guests:", error);
      message.error("Gagal memuat data tamu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, searchText]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleDelete = async (guestId) => {
    try {
      await api.delete(`/api/guests/${guestId}`);
      message.success("Data tamu berhasil dihapus");
      fetchGuests();
    } catch (error) {
      console.error("Error deleting guest:", error);
      message.error("Gagal menghapus data tamu");
    }
  };

  const columns = [
    {
      title: "Foto",
      dataIndex: "idPhotoPath",
      key: "photo",
      width: 80,
      render: (photoPath) =>
        photoPath ? (
          <Image
            src={`${
              import.meta.env.VITE_API_URL || "http://localhost:3001"
            }${photoPath}`}
            alt="ID Photo"
            width={50}
            height={50}
            style={{ objectFit: "cover", borderRadius: 4 }}
          />
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              backgroundColor: "#f0f0f0",
              borderRadius: 4,
            }}
          />
        ),
    },
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Nomor Telepon",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Perusahaan",
      dataIndex: "company",
      key: "company",
      render: (company) => company || "-",
    },
    {
      title: "Jabatan",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Aksi",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Apakah Anda yakin ingin menghapus data tamu ini?"
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
    <div className="guests-container">
      <Card>
        <div className="page-header">
          <Title level={2}>Manajemen Tamu</Title>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchGuests}
            loading={loading}
          >
            Perbarui
          </Button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Cari berdasarkan nama, email, atau perusahaan"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            size="large"
          />
        </div>

        {/* Guests Table */}
        <Table
          columns={columns}
          dataSource={guests}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} tamu`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default Guests;
