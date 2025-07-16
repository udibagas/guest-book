import {
  Table,
  Card,
  Input,
  Button,
  Typography,
  Space,
  Image,
  Modal,
  Descriptions,
  Tag,
} from "antd";
import {
  EditOutlined,
  ReloadOutlined,
  SettingOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useCrud } from "../../hooks/useCrud";
import { useState } from "react";
import dayjs from "dayjs";

const { Title } = Typography;

const Guests = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [searchText, setSearchText] = useState("");
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const showDetail = (guest) => {
    setSelectedGuest(guest);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedGuest(null);
  };

  const { useFetch: useFetchCrud, refreshData } = useCrud("/guests");
  const { data, isPending } = useFetchCrud({ search: searchText });

  const columns = [
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Nomor Identitas",
      dataIndex: "idNumber",
      key: "idNumber",
      render: (idNumber) => idNumber || "-",
    },
    {
      title: "Nomor Telepon",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
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
      title: "Total Kunjungan",
      dataIndex: "totalVisits",
      key: "totalVisits",
      width: 120,
      align: "center",
      render: (totalVisits) => <Tag color="blue">{totalVisits || 0}</Tag>,
    },
    {
      title: "",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => showDetail(record)}
          >
            Detail
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card style={{ minHeight: "calc(100vh - 100px)" }}>
        <div className="page-header">
          <Title level={3}>Kelola Tamu</Title>
          <Space>
            <Input.Search
              placeholder="Cari berdasarkan nama, email, perusahaan, atau nomor identitas"
              allowClear
              onSearch={handleSearch}
              style={{ width: 500 }}
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
          onRow={(record) => ({
            onClick: () => showDetail(record),
          })}
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

      {/* Guest Detail Modal */}
      <Modal
        title="Detail Tamu"
        open={detailModalOpen}
        onCancel={closeDetailModal}
        footer={[
          <Button key="close" onClick={closeDetailModal}>
            Tutup
          </Button>,
        ]}
        width={600}
      >
        {selectedGuest && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Nama">
              {selectedGuest.name}
            </Descriptions.Item>
            <Descriptions.Item label="Nomor Identitas">
              {selectedGuest.idNumber || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Nomor Telepon">
              {selectedGuest.phoneNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedGuest.email || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Perusahaan">
              {selectedGuest.company || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Jabatan">
              {selectedGuest.role || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Foto ID">
              {selectedGuest.idPhotoPath ? (
                <Image
                  src={`${import.meta.env.VITE_API_URL || ""}${
                    selectedGuest.idPhotoPath
                  }`}
                  alt="ID Photo"
                  style={{ maxWidth: "200px", maxHeight: "150px" }}
                />
              ) : (
                "-"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Tanggal Terdaftar">
              {selectedGuest.createdAt
                ? dayjs(selectedGuest.createdAt).format("DD MMMM YYYY, HH:mm")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Total Kunjungan">
              <Tag color="blue">{selectedGuest.totalVisits || 0} kunjungan</Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default Guests;
