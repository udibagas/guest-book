import { Card, Avatar, Row, Col, Image } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  BankOutlined,
  IdcardOutlined,
  NumberOutlined,
} from "@ant-design/icons";

const GuestCard = ({ guests, isPending, onGuestClick }) => {
  if (isPending) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (guests.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "50px", color: "#999" }}>
        <UserOutlined style={{ fontSize: "48px", marginBottom: "16px" }} />
        <div>Tidak ada data tamu yang ditemukan</div>
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {guests.map((guest) => (
        <Col xs={24} sm={12} md={8} lg={6} xl={6} key={guest.id}>
          <Card
            hoverable
            size="small"
            onClick={() => onGuestClick(guest)}
            style={{
              height: "100%",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {guest.idPhotoPath && (
              <img
                style={{ width: "100%", marginBottom: 12 }}
                src={`${import.meta.env.VITE_API_URL || ""}${
                  guest.idPhotoPath
                }`}
              />
            )}
            <Card.Meta
              title={guest.name}
              description={
                <div style={{ color: "#666" }}>
                  {guest.idNumber && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <NumberOutlined
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
                        {guest.idNumber}
                      </span>
                    </div>
                  )}
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
  );
};

export default GuestCard;
