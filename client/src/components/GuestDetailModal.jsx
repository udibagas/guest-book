import {
  Modal,
  Button,
  Tag,
  Image,
  Row,
  Col,
  Avatar,
  Typography,
  Space,
  Divider,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  BankOutlined,
  IdcardOutlined,
  CalendarOutlined,
  NumberOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;

const GuestDetailModal = ({ open, onClose, guest }) => {
  return (
    <Modal
      title="Detail Tamu"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Tutup
        </Button>,
      ]}
      width={800}
    >
      {guest && (
        <Row gutter={24}>
          {/* Left Column - Photo */}
          <Col xs={24} sm={12} md={12}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              {guest.idPhotoPath ? (
                <Image
                  src={`${import.meta.env.VITE_API_URL || ""}${
                    guest.idPhotoPath
                  }`}
                  alt="ID Photo"
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    borderRadius: "8px",
                    border: "2px solid #f0f0f0",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    height: "200px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    border: "2px solid #f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                  }}
                >
                  <Avatar
                    size={64}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#f56a00" }}
                  />
                </div>
              )}
              <Text
                type="secondary"
                style={{ fontSize: "12px", marginTop: 8, display: "block" }}
              >
                Foto Identitas
              </Text>
            </div>
          </Col>

          {/* Right Column - Details */}
          <Col xs={24} sm={12} md={12}>
            <Title level={4} style={{ marginBottom: 16, color: "#1890ff" }}>
              {guest.name}
            </Title>

            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {/* ID Number */}
              {guest.idNumber && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <NumberOutlined
                    style={{
                      marginRight: 8,
                      color: "#722ed1",
                      fontSize: "16px",
                    }}
                  />
                  <div>
                    <Text strong style={{ fontSize: "12px", color: "#666" }}>
                      Nomor Identitas
                    </Text>
                    <div style={{ fontSize: "14px" }}>{guest.idNumber}</div>
                  </div>
                </div>
              )}

              {/* Phone */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <PhoneOutlined
                  style={{ marginRight: 8, color: "#1890ff", fontSize: "16px" }}
                />
                <div>
                  <Text strong style={{ fontSize: "12px", color: "#666" }}>
                    Nomor Telepon
                  </Text>
                  <div style={{ fontSize: "14px" }}>{guest.phoneNumber}</div>
                </div>
              </div>

              {/* Email */}
              {guest.email && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <MailOutlined
                    style={{
                      marginRight: 8,
                      color: "#52c41a",
                      fontSize: "16px",
                    }}
                  />
                  <div>
                    <Text strong style={{ fontSize: "12px", color: "#666" }}>
                      Email
                    </Text>
                    <div style={{ fontSize: "14px" }}>{guest.email}</div>
                  </div>
                </div>
              )}

              {/* Company */}
              {guest.company && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <BankOutlined
                    style={{
                      marginRight: 8,
                      color: "#722ed1",
                      fontSize: "16px",
                    }}
                  />
                  <div>
                    <Text strong style={{ fontSize: "12px", color: "#666" }}>
                      Perusahaan
                    </Text>
                    <div style={{ fontSize: "14px" }}>{guest.company}</div>
                  </div>
                </div>
              )}

              {/* Role */}
              {guest.role && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <IdcardOutlined
                    style={{
                      marginRight: 8,
                      color: "#fa8c16",
                      fontSize: "16px",
                    }}
                  />
                  <div>
                    <Text strong style={{ fontSize: "12px", color: "#666" }}>
                      Jabatan
                    </Text>
                    <div style={{ fontSize: "14px" }}>{guest.role}</div>
                  </div>
                </div>
              )}

              <Divider style={{ margin: "16px 0" }} />

              {/* Registration Date */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <CalendarOutlined
                  style={{ marginRight: 8, color: "#1890ff", fontSize: "16px" }}
                />
                <div>
                  <Text strong style={{ fontSize: "12px", color: "#666" }}>
                    Tanggal Terdaftar
                  </Text>
                  <div style={{ fontSize: "14px" }}>
                    {guest.createdAt
                      ? dayjs(guest.createdAt).format("DD MMMM YYYY, HH:mm")
                      : "-"}
                  </div>
                </div>
              </div>

              {/* Total Visits */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <UserOutlined
                  style={{ marginRight: 8, color: "#52c41a", fontSize: "16px" }}
                />
                <div>
                  <Text strong style={{ fontSize: "12px", color: "#666" }}>
                    Total Kunjungan
                  </Text>
                  <div style={{ fontSize: "14px" }}>
                    <Tag color="blue" style={{ marginTop: 4 }}>
                      {guest.totalVisits || 0} kunjungan
                    </Tag>
                  </div>
                </div>
              </div>
            </Space>
          </Col>
        </Row>
      )}
    </Modal>
  );
};

export default GuestDetailModal;
