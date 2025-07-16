import { useState, useEffect } from "react";
import {
  Card,
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
  Image,
  Spin,
} from "antd";
import {
  WhatsAppOutlined,
  SendOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  DisconnectOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import api from "../../lib/api";

const { Title, Text, Paragraph } = Typography;

const NotificationSettings = () => {
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [settings, setSettings] = useState({
    whatsappEnabled: false,
    whatsappConfigured: false,
    connectionStatus: {
      isConnected: false,
      isConnecting: false,
      qrCode: null,
      needsQR: false,
    },
  });
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSettings();
    // Poll for status updates every 3 seconds when connecting or needing QR
    const interval = setInterval(() => {
      if (
        settings.connectionStatus?.isConnecting ||
        settings.connectionStatus?.needsQR
      ) {
        fetchSettings();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [
    settings.connectionStatus?.isConnecting,
    settings.connectionStatus?.needsQR,
  ]);

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

  const connectWhatsApp = async () => {
    try {
      setConnectLoading(true);
      await api.post("/notifications/whatsapp/connect");
      message.success(
        "Koneksi WhatsApp dimulai. Silakan scan QR code jika muncul."
      );
      fetchSettings();
    } catch (error) {
      console.error("Error connecting WhatsApp:", error);
      message.error("Gagal memulai koneksi WhatsApp");
    } finally {
      setConnectLoading(false);
    }
  };

  const disconnectWhatsApp = async () => {
    try {
      setConnectLoading(true);
      await api.post("/notifications/whatsapp/disconnect");
      message.success("WhatsApp berhasil diputus");
      fetchSettings();
    } catch (error) {
      console.error("Error disconnecting WhatsApp:", error);
      message.error("Gagal memutus koneksi WhatsApp");
    } finally {
      setConnectLoading(false);
    }
  };

  const reconnectWhatsApp = async () => {
    try {
      setConnectLoading(true);
      await api.post("/notifications/whatsapp/reconnect");
      message.success("Reconnect WhatsApp dimulai");
      fetchSettings();
    } catch (error) {
      console.error("Error reconnecting WhatsApp:", error);
      message.error("Gagal reconnect WhatsApp");
    } finally {
      setConnectLoading(false);
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
                <Text strong>Status Koneksi:</Text>
                <br />
                {settings.connectionStatus?.isConnected ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    Terhubung
                  </Tag>
                ) : settings.connectionStatus?.isConnecting ? (
                  <Tag color="processing" icon={<Spin size="small" />}>
                    Menghubungkan...
                  </Tag>
                ) : (
                  <Tag color="error" icon={<ExclamationCircleOutlined />}>
                    Terputus
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

              <div>
                <Space>
                  {!settings.connectionStatus?.isConnected && (
                    <Button
                      type="primary"
                      icon={<WhatsAppOutlined />}
                      loading={connectLoading}
                      onClick={connectWhatsApp}
                    >
                      Hubungkan WhatsApp
                    </Button>
                  )}

                  {settings.connectionStatus?.isConnected && (
                    <Button
                      danger
                      icon={<DisconnectOutlined />}
                      loading={connectLoading}
                      onClick={disconnectWhatsApp}
                    >
                      Putus Koneksi
                    </Button>
                  )}

                  <Button
                    icon={<ReloadOutlined />}
                    loading={connectLoading}
                    onClick={reconnectWhatsApp}
                  >
                    Reconnect
                  </Button>
                </Space>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={12}>
            {settings.connectionStatus?.qrCode ? (
              <Card
                title={
                  <Space>
                    <QrcodeOutlined />
                    Scan QR Code untuk Login
                  </Space>
                }
                size="small"
              >
                <div style={{ textAlign: "center" }}>
                  <Image
                    src={settings.connectionStatus.qrCode}
                    width={200}
                    height={200}
                    style={{ border: "1px solid #d9d9d9", borderRadius: 8 }}
                    preview={false}
                  />
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">
                      1. Buka WhatsApp di ponsel
                      <br />
                      2. Tap Menu (⋮) → Linked Devices
                      <br />
                      3. Tap 'Link a Device'
                      <br />
                      4. Scan QR code di atas
                    </Text>
                  </div>
                </div>
              </Card>
            ) : (
              <Alert
                message="Informasi WhatsApp"
                description={
                  <div>
                    <p>• Menggunakan WhatsApp Web melalui library Baileys</p>
                    <p>
                      • Notifikasi akan dikirim ke PIC ketika tamu melakukan
                      registrasi
                    </p>
                    <p>
                      • Memerlukan autentikasi QR Code saat pertama kali setup
                    </p>
                    <p>
                      • Session tersimpan otomatis untuk penggunaan selanjutnya
                    </p>
                    <p>
                      • Pastikan nomor telepon PIC sudah benar dan aktif di
                      WhatsApp
                    </p>
                  </div>
                }
                type="info"
                showIcon
              />
            )}
          </Col>
        </Row>

        {!settings.connectionStatus?.isConnected &&
          !settings.connectionStatus?.qrCode && (
            <>
              <Divider />
              <Alert
                message="WhatsApp Belum Terhubung"
                description="Klik tombol 'Hubungkan WhatsApp' untuk memulai proses koneksi. QR Code akan muncul untuk di-scan."
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
          disabled={!settings.connectionStatus?.isConnected}
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
                  disabled={!settings.connectionStatus?.isConnected}
                  icon={<SendOutlined />}
                >
                  Kirim Test Notifikasi
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {!settings.connectionStatus?.isConnected && (
          <Alert
            message="Test notifikasi tidak tersedia"
            description="WhatsApp harus terhubung terlebih dahulu untuk mengirim test notifikasi."
            type="info"
            showIcon
          />
        )}
      </Card>

      {/* Information Card */}
      <Card title="Cara Kerja Notifikasi">
        <Paragraph>
          <ol>
            <li>
              <strong>Registrasi Tamu:</strong> Ketika tamu melakukan registrasi
              dan memilih PIC, sistem akan otomatis mengirim notifikasi WhatsApp
              ke nomor telepon PIC yang terdaftar.
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
              valid dan aktif di WhatsApp. Sistem harus sudah terautentikasi
              melalui QR Code.
            </li>
          </ol>
        </Paragraph>
      </Card>
    </div>
  );
};

export default NotificationSettings;
