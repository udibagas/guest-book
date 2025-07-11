import { Table, Card, Input, Button, Typography, Space, Image } from "antd";
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

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const { useFetch: useFetchCrud, refreshData } = useCrud("/guests");
  const { data, isPending } = useFetchCrud({ search: searchText });

  const columns = [
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
  ];

  return (
    <>
      <Card style={{ minHeight: "calc(100vh - 100px)" }}>
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
          dataSource={data?.data?.rows || []}
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
