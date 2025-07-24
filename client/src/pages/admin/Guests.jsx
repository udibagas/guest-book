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
  Row,
  Col,
  Avatar,
  Segmented,
} from "antd";
import {
  ReloadOutlined,
  EyeOutlined,
  TableOutlined,
  AppstoreOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  BankOutlined,
  IdcardOutlined,
  SettingOutlined,
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
  const [viewMode, setViewMode] = useState("table");

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

  const renderCardView = () => {
    const guests = data?.data?.rows || [];

    return (
      <>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {guests.map((guest) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={guest.id}>
              <Card
                hoverable
                size="small"
                onClick={() => showDetail(guest)}
                style={{
                  height: "100%",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  border: "1px solid #f0f0f0",
                }}
                styles={{ body: { padding: "12px" } }}
              >
                <Card.Meta
                  avatar={
                    guest.idPhotoPath ? (
                      <Avatar
                        size={48}
                        src={`${import.meta.env.VITE_API_URL || ""}${
                          guest.idPhotoPath
                        }`}
                        style={{ border: "2px solid #f0f0f0" }}
                      />
                    ) : (
                      <Avatar
                        size={48}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: "#f56a00" }}
                      />
                    )
                  }
                  title={guest.name}
                  description={
                    <div style={{ color: "#666" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <PhoneOutlined
                          style={{
                            marginRight: 6,
                            color: "#1890ff",
                          }}
                        />
                        <span>{guest.phoneNumber}</span>
                      </div>
                      {guest.email && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <MailOutlined
                            style={{
                              marginRight: 6,
                              color: "#52c41a",
                            }}
                          />
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {guest.email}
                          </span>
                        </div>
                      )}
                      {guest.company && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <BankOutlined
                            style={{
                              marginRight: 6,
                              color: "#722ed1",
                            }}
                          />
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {guest.company}
                          </span>
                        </div>
                      )}
                      {guest.role && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <IdcardOutlined
                            style={{
                              marginRight: 6,
                              color: "#fa8c16",
                            }}
                          />
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {guest.role}
                          </span>
                        </div>
                      )}
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Card View Pagination */}
        {guests.length === 0 && !isPending && (
          <div style={{ textAlign: "center", padding: "50px", color: "#999" }}>
            <UserOutlined style={{ fontSize: "48px", marginBottom: "16px" }} />
            <div>Tidak ada data tamu yang ditemukan</div>
          </div>
        )}
      </>
    );
  };

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
      title: <SettingOutlined />,
      key: "actions",
      width: 120,
      align: "center",
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
            <Segmented
              options={[
                {
                  label: "Tabel",
                  value: "table",
                  icon: <TableOutlined />,
                },
                {
                  label: "Kartu",
                  value: "card",
                  icon: <AppstoreOutlined />,
                },
              ]}
              value={viewMode}
              onChange={setViewMode}
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

        {/* Guests Display */}
        {viewMode === "table" ? (
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
        ) : (
          <div>
            {isPending ? (
              <div style={{ textAlign: "center", padding: "50px" }}>
                <Button loading>Loading...</Button>
              </div>
            ) : (
              renderCardView()
            )}
          </div>
        )}
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
