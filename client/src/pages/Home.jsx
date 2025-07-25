import { Typography, Button, Space, QRCode, Card, Row, Col } from "antd";
import { useNavigate } from "react-router";
import { QrcodeOutlined, FormOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();

  // Get the current URL for QR code
  const guestFormUrl = `${window.location.origin}/guest-form`;

  return (
    <div className="home-container">
      <div className="home-content">
        <Row gutter={[32, 32]} align="middle" justify="center">
          {/* Welcome Section */}
          <Col xs={24} lg={12} className="welcome-section">
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div className="welcome-text">
                <Title
                  level={1}
                  className="welcome-title"
                  style={{ marginBottom: 16 }}
                >
                  Selamat Datang di
                </Title>
                <Title
                  level={1}
                  className="company-name"
                  style={{ marginBottom: 24, color: "#1890ff" }}
                >
                  PLN
                </Title>
                <Paragraph className="welcome-description">
                  Terima kasih telah berkunjung. Silakan daftarkan kunjungan
                  Anda dengan memindai kode QR di samping atau mengklik tombol
                  formulir tamu untuk mengisi data kunjungan.
                </Paragraph>
              </div>

              <Space size="large" className="action-buttons" wrap>
                <Button
                  type="primary"
                  size="large"
                  icon={<FormOutlined />}
                  onClick={() => navigate("/guest-form")}
                  className="primary-btn"
                >
                  Isi Formulir Tamu
                </Button>
              </Space>
            </Space>
          </Col>

          {/* QR Code Section */}
          <Col xs={24} lg={12} className="qr-section">
            <Card
              className="qr-card"
              styles={{
                body: { padding: "40px", textAlign: "center" },
              }}
            >
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <div className="qr-header">
                  <QrcodeOutlined className="qr-icon" />
                  <Title
                    level={3}
                    style={{ marginBottom: 8, color: "#1890ff" }}
                  >
                    Pindai untuk Mendaftar
                  </Title>
                  <Paragraph style={{ color: "#666", marginBottom: 24 }}>
                    Gunakan kamera ponsel Anda untuk memindai kode QR
                  </Paragraph>
                </div>

                <div className="qr-code-wrapper">
                  <QRCode
                    value={guestFormUrl}
                    size={200}
                    style={{
                      padding: 16,
                      backgroundColor: "white",
                      borderRadius: 8,
                      border: "1px solid #f0f0f0",
                    }}
                  />
                </div>

                <Paragraph style={{ fontSize: "14px", color: "#999" }}>
                  Scan kode QR ini dengan kamera ponsel Anda
                </Paragraph>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Footer Section */}
        <div className="footer-section">
          <Card className="footer-card">
            <Row gutter={[24, 24]} justify="center">
              <Col xs={24} sm={12} md={8} className="footer-item">
                <Title level={5} style={{ color: "#1890ff", marginBottom: 8 }}>
                  Bantuan
                </Title>
                <Paragraph style={{ marginBottom: 0, color: "#666" }}>
                  Hubungi meja resepsionis kami untuk bantuan
                </Paragraph>
              </Col>
              <Col xs={24} sm={12} md={8} className="footer-item">
                <Title level={5} style={{ color: "#1890ff", marginBottom: 8 }}>
                  Jam Operasional
                </Title>
                <Paragraph style={{ marginBottom: 0, color: "#666" }}>
                  Senin - Jumat: 08:00 - 17:00 WIB
                </Paragraph>
              </Col>
              <Col xs={24} sm={12} md={8} className="footer-item">
                <Title level={5} style={{ color: "#1890ff", marginBottom: 8 }}>
                  Keamanan
                </Title>
                <Paragraph style={{ marginBottom: 0, color: "#666" }}>
                  Semua kunjungan dicatat untuk keamanan bersama
                </Paragraph>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
