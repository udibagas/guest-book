import { Table, Card, Input, Button, Typography, Space } from "antd";
import {
  EditOutlined,
  ReloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useCrud } from "../../hooks/useCrud";
import { useState } from "react";

const { Title } = Typography;

const Guests = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [searchText, setSearchText] = useState("");

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    // Handle sorting and filtering if needed
    // For example, you can use sorter to sort by a specific column
    // and filters to filter by specific values
  };

  const {
    useFetch: useFetchCrud,
    handleEdit,
    refreshData,
  } = useCrud("/guests");

  const { data, isPending } = useFetchCrud();

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
              import.meta.env.VITE_API_URL || "http://localhost:5001"
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
      title: <SettingOutlined />,
      align: "center",
      width: 60,
      fixed: "right",
      key: "actions",
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          title="Edit"
          onClick={() => handleEdit(record)}
        />
      ),
    },
  ];

  return (
    <>
      <Card>
        <div className="page-header">
          <Title level={3}>Kelola Tamu</Title>
          <Space>
            <Input.Search
              placeholder="Cari berdasarkan nama, email, atau perusahaan"
              allowClear
              onSearch={handleSearch}
              style={{ width: 400 }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={refreshData}
              loading={isPending}
            >
              Perbarui
            </Button>
          </Space>
        </div>

        {/* Guests Table */}
        <Table
          size="middle"
          columns={columns}
          dataSource={data?.rows || []}
          rowKey="id"
          loading={isPending}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} tamu`,
          }}
          onChange={handleTableChange}
        />
      </Card>
    </>
  );
};

export default Guests;
