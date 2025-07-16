import { useState, useEffect } from "react";
import {
  Card,
  Switch,
  Button,
  Input,
  Form,
  Typography,
  Space,
  Alert,
  Divider,
  message,
  Tag,
  Row,
  Col,
} from "antd";
import {
  WhatsAppOutlined,
  SendOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import api from "../../lib/api";

const { Title, Text, Paragraph } = Typography;

const NotificationSettings = () => {
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [settings, setSettings] = useState({
    whatsappEnabled: false,
    whatsappConfigured: false,
  });
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/notifications/settings");
      setSettings(response.data.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      message.error("Gagal memuat pengaturan notifikasi");
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async (values) => {
    try {
      setTestLoading(true);
      await api.post("/notifications/test", {
        phoneNumber: values.testPhoneNumber,
      });
      message.success("Notifikasi test berhasil dikirim!");
      form.resetFields();
    } catch (error) {
      console.error("Error sending test notification:", error);
      message.error(
        error.response?.data?.message || "Gagal mengirim notifikasi test"
      );
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={3}>
        <SettingOutlined /> Pengaturan Notifikasi
      </Title>
      <Paragraph type="secondary">
        Kelola pengaturan notifikasi untuk sistem buku tamu
      </Paragraph>

      {/* WhatsApp Settings */}
      <Card
        title={
          <Space>
            <WhatsAppOutlined style={{ color: "#25D366" }} />
            WhatsApp Notifications
          </Space>
        }
        loading={loading}
        style={{ marginBottom: 24 }}
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text strong>Status Konfigurasi:</Text>
                <br />
                {settings.whatsappConfigured ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    Terkonfigurasi
                  </Tag>
                ) : (
                  <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                    Belum Dikonfigurasi
                  </Tag>
                )}
              </div>

              <div>
                <Text strong>Status Aktif:</Text>
                <br />
                {settings.whatsappEnabled ? (
                  <Tag color="success">Aktif</Tag>
                ) : (
                  <Tag color="default">Nonaktif</Tag>
                )}
              </div>
            </Space>
          </Col>

          <Col xs={24} md={12}>
            <Alert
              message="Informasi WhatsApp"
              description={
                <div>
                  <p>
                    • Notifikasi akan dikirim ke PIC ketika tamu melakukan
                    registrasi
                  </p>
                  <p>• Pastikan nomor telepon PIC sudah benar dan aktif</p>
                  <p>
                    • Untuk mengaktifkan, hubungi administrator sistem untuk
                    konfigurasi API
                  </p>
                </div>
              }
              type="info"
              showIcon
            />
          </Col>
        </Row>

        {!settings.whatsappConfigured && (
          <>
            <Divider />
            <Alert
              message="Konfigurasi Diperlukan"
              description="WhatsApp API belum dikonfigurasi. Hubungi administrator sistem untuk mengatur WHATSAPP_API_TOKEN dan WHATSAPP_API_URL di environment variables."
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          </>
        )}
      </Card>

      {/* Test Notification */}
      <Card
        title={
          <Space>
            <SendOutlined />
            Test Notifikasi WhatsApp
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={sendTestNotification}
          disabled={!settings.whatsappConfigured}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Nomor Telepon"
                name="testPhoneNumber"
                rules={[
                  {
                    required: true,
                    message: "Silakan masukkan nomor telepon",
                  },
                  {
                    pattern: /^[0-9+\-\s()]+$/,
                    message: "Format nomor telepon tidak valid",
                  },
                ]}
              >
                <Input
                  prefix={<WhatsAppOutlined />}
                  placeholder="08xxxxxxxxxx atau +62xxxxxxxxxx"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label=" ">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={testLoading}
                  disabled={!settings.whatsappConfigured}
                  icon={<SendOutlined />}
                >
                  Kirim Test Notifikasi
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {!settings.whatsappConfigured && (
          <Alert
            message="Test notifikasi tidak tersedia"
            description="Konfigurasi WhatsApp API diperlukan untuk mengirim test notifikasi."
            type="info"
            showIcon
          />
        )}
      </Card>

      {/* Information Card */}
      <Card title="Cara Kerja Notifikasi">
        <div>
          <Title level={5}>📱 Notifikasi WhatsApp</Title>
          <Paragraph>
            <ol>
              <li>
                <strong>Registrasi Tamu:</strong> Ketika tamu melakukan
                registrasi dan memilih PIC, sistem akan otomatis mengirim
                notifikasi WhatsApp ke nomor telepon PIC yang terdaftar.
              </li>
              <li>
                <strong>Informasi yang Dikirim:</strong>
                <ul>
                  <li>Data lengkap tamu (nama, telepon, email, perusahaan)</li>
                  <li>Tujuan kunjungan</li>
                  <li>Waktu kunjungan</li>
                  <li>Catatan tambahan (jika ada)</li>
                </ul>
              </li>
              <li>
                <strong>Syarat:</strong> PIC harus memiliki nomor telepon yang
                valid dan sistem WhatsApp API harus dikonfigurasi dengan benar.
              </li>
            </ol>
          </Paragraph>

          <Title level={5}>⚙️ Konfigurasi</Title>
          <Paragraph>
            Untuk mengaktifkan notifikasi WhatsApp, administrator perlu mengatur
            variabel environment berikut:
          </Paragraph>
          <div
            style={{ backgroundColor: "#f5f5f5", padding: 16, borderRadius: 4 }}
          >
            <code>
              WHATSAPP_NOTIFICATIONS_ENABLED=true
              <br />
              WHATSAPP_API_URL=https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID
              <br />
              WHATSAPP_API_TOKEN=your_whatsapp_api_token
            </code>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificationSettings;
