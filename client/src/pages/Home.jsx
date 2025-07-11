import { Typography, Button, Space, QRCode } from "antd";
import { useNavigate } from "react-router";

const { Title, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();

  // Get the current URL for QR code
  const guestFormUrl = `${window.location.origin}/guest-form`;

  return (
    <div className="home-container">
      <Space direction="vertical" size="large" align="center">
        <Title level={1} style={{ color: "white", marginBottom: 0 }}>
          Welcome to Mitrateknik
        </Title>

        <Paragraph
          style={{ fontSize: "18px", textAlign: "center", color: "white" }}
        >
          We're delighted to have you here. Please register your visit by
          scanning the QR code below or clicking the button to fill out our
          guest form.
        </Paragraph>

        <div className="qr-container">
          <Title
            level={3}
            style={{ marginBottom: 16, textAlign: "center", color: "#333" }}
          >
            Scan to Register
          </Title>
          <QRCode value={guestFormUrl} size={200} />
          <Paragraph
            style={{ marginTop: 16, textAlign: "center", color: "#666" }}
          >
            Scan this QR code with your phone's camera
          </Paragraph>
        </div>

        <Space size="large">
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/guest-form")}
            style={{
              height: "50px",
              padding: "0 40px",
              fontSize: "16px",
              borderRadius: "8px",
            }}
          >
            Fill Guest Form
          </Button>

          <Button
            size="large"
            onClick={() => navigate("/admin")}
            style={{
              height: "50px",
              padding: "0 40px",
              fontSize: "16px",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "white",
              color: "white",
            }}
          >
            Admin Panel
          </Button>
        </Space>

        <Paragraph style={{ marginTop: 32, color: "rgba(255, 255, 255, 0.8)" }}>
          For assistance, please contact our reception desk
        </Paragraph>
      </Space>
    </div>
  );
};

export default Home;
