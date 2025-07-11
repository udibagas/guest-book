import { useState, useRef } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Space,
  Card,
  Upload,
  message,
  Result,
  Select,
  Divider,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  BankOutlined,
  IdcardOutlined,
  FileTextOutlined,
  CameraOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  TeamOutlined,
  AimOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import Webcam from "react-webcam";
import api from "../lib/api";
import { useFetch } from "../hooks/useFetch";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const GuestForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [idPhoto, setIdPhoto] = useState(null);
  const [idPhotoUrl, setIdPhotoUrl] = useState(null);
  const [showCustomPurpose, setShowCustomPurpose] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const { data: purposes = [] } = useFetch("/purposes");
  const { data: hosts = [] } = useFetch("/hosts");

  const handlePurposeChange = (value) => {
    const purpose = purposes.find((p) => p.id === value);
    setShowCustomPurpose(purpose && purpose.name === "Other");
  };

  const handleSubmit = async (values) => {
    if (!idPhoto) {
      message.error("Silakan unggah atau ambil foto identitas Anda");
      return;
    }

    setLoading(true);

    try {
      // First upload the photo
      const formData = new FormData();
      formData.append("idPhoto", idPhoto);

      const uploadResponse = await api.post("/upload/id-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Prepare visit data
      const visitData = {
        guestData: {
          name: values.name,
          phoneNumber: values.phoneNumber,
          email: values.email,
          company: values.company || null,
          role: values.role,
          idPhotoPath: uploadResponse.data.data.filePath,
        },
        PurposeId: values.PurposeId,
        HostId: values.HostId || null,
        customPurpose: values.customPurpose || null,
        notes: values.notes || null,
      };

      await api.post("/visits", visitData);

      message.success("Registrasi berhasil! Selamat datang!");
      setSubmitted(true);
    } catch (error) {
      console.error("Registration error:", error);
      message.error(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();

    // Convert base64 to blob
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "id-photo.jpg", { type: "image/jpeg" });
        setIdPhoto(file);
        setIdPhotoUrl(imageSrc);
        setShowCamera(false);
        message.success("Photo captured successfully!");
      });
  };

  const handleFileUpload = (info) => {
    const file = info.file.originFileObj || info.file;

    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        message.error("Please upload an image file");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        message.error("File size must be less than 5MB");
        return;
      }

      setIdPhoto(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setIdPhotoUrl(e.target.result);
      };
      reader.readAsDataURL(file);

      message.success("Photo uploaded successfully!");
    }
  };

  if (submitted) {
    return (
      <div className="guest-form-container">
        <Result
          status="success"
          title="Registrasi Berhasil!"
          subTitle="Terima kasih telah mendaftar. Anda sekarang telah check-in ke Mitrateknik. Selamat berkunjung!"
          extra={[
            <Button type="primary" key="home" onClick={() => navigate("/")}>
              Kembali ke Beranda
            </Button>,
            // <Button
            //   type="primary"
            //   key="new"
            //   onClick={() => {
            //     setSubmitted(false);
            //     form.resetFields();
            //     setIdPhoto(null);
            //     setIdPhotoUrl(null);
            //     setShowCustomPurpose(false);
            //   }}
            // >
            //   Daftarkan Tamu Lain
            // </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="guest-form-container">
      <Card
        title={
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/")}
            />
            <Title level={2} style={{ margin: 0 }}>
              Registrasi Tamu
            </Title>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Title level={4}>Informasi Pribadi</Title>

          <Form.Item
            label="Nama Lengkap"
            name="name"
            rules={[
              { required: true, message: "Silakan masukkan nama lengkap Anda" },
              { min: 2, message: "Nama minimal 2 karakter" },
              { max: 100, message: "Nama maksimal 100 karakter" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Masukkan nama lengkap Anda"
            />
          </Form.Item>

          <Form.Item
            label="Nomor Telepon"
            name="phoneNumber"
            rules={[
              {
                required: true,
                message: "Silakan masukkan nomor telepon Anda",
              },
              {
                pattern: /^[0-9+\-\s()]+$/,
                message: "Silakan masukkan nomor telepon yang valid",
              },
              { min: 10, message: "Nomor telepon minimal 10 digit" },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Masukkan nomor telepon Anda"
            />
          </Form.Item>

          <Form.Item
            label="Alamat Email"
            name="email"
            rules={[
              {
                type: "email",
                message: "Silakan masukkan alamat email yang valid",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Masukkan alamat email Anda"
            />
          </Form.Item>

          <Form.Item
            label="Perusahaan"
            name="company"
            rules={[
              {
                max: 100,
                message: "Nama perusahaan maksimal 100 karakter",
              },
            ]}
          >
            <Input
              prefix={<BankOutlined />}
              placeholder="Masukkan nama perusahaan (opsional)"
            />
          </Form.Item>

          <Form.Item
            label="Jabatan/Posisi"
            name="role"
            rules={[
              { min: 2, message: "Jabatan minimal 2 karakter" },
              { max: 100, message: "Jabatan maksimal 100 karakter" },
            ]}
          >
            <Input
              prefix={<IdcardOutlined />}
              placeholder="Masukkan jabatan atau posisi Anda (opsional)"
            />
          </Form.Item>

          <Divider />

          <Title level={4}>Informasi Kunjungan</Title>

          <Form.Item
            label="Tujuan Kunjungan"
            name="PurposeId"
            rules={[
              {
                required: true,
                message: "Silakan pilih tujuan kunjungan Anda",
              },
            ]}
          >
            <Select
              placeholder="Pilih tujuan kunjungan"
              onChange={handlePurposeChange}
            >
              {purposes.map((purpose) => (
                <Option key={purpose.id} value={purpose.id}>
                  <Space>
                    <AimOutlined />
                    {purpose.name}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {showCustomPurpose && (
            <Form.Item
              label="Silakan sebutkan tujuan Anda"
              name="customPurpose"
              rules={[
                { required: true, message: "Silakan sebutkan tujuan Anda" },
                { max: 500, message: "Tujuan maksimal 500 karakter" },
              ]}
            >
              <TextArea
                rows={3}
                placeholder="Silakan jelaskan tujuan spesifik Anda"
                showCount
                maxLength={500}
              />
            </Form.Item>
          )}

          <Form.Item
            label="Orang yang Akan Ditemui"
            name="HostId"
            rules={[
              { required: true, message: "Pilih orang yang akan ditemui" },
            ]}
          >
            <Select placeholder="Pilih orang yang akan ditemui" allowClear>
              {hosts.map((host) => (
                <Option key={host.id} value={host.id}>
                  <Space>
                    <TeamOutlined />
                    {host.name} - {host.role}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Catatan Tambahan"
            name="notes"
            rules={[{ max: 1000, message: "Catatan maksimal 1000 karakter" }]}
          >
            <TextArea
              rows={3}
              placeholder="Informasi tambahan (opsional)"
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Divider />

          <Form.Item label="Foto Identitas" required>
            <div className="photo-upload-container">
              {idPhotoUrl ? (
                <div>
                  <img
                    src={idPhotoUrl}
                    alt="ID Preview"
                    className="photo-preview"
                  />
                  <div style={{ marginTop: 16 }}>
                    <Space>
                      <Button
                        icon={<CameraOutlined />}
                        onClick={() => setShowCamera(true)}
                      >
                        Ulang
                      </Button>
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={handleFileUpload}
                      >
                        <Button icon={<UploadOutlined />}>Unggah Foto</Button>
                      </Upload>
                    </Space>
                  </div>
                </div>
              ) : (
                <div>
                  <FileTextOutlined
                    style={{ fontSize: 48, color: "#d9d9d9" }}
                  />
                  <div style={{ marginTop: 16 }}>
                    <Text>Please upload or capture your ID photo</Text>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <Space>
                      <Button
                        type="primary"
                        icon={<CameraOutlined />}
                        onClick={() => setShowCamera(true)}
                      >
                        Ambil Foto
                      </Button>
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={handleFileUpload}
                      >
                        <Button icon={<UploadOutlined />}>Unggah Foto</Button>
                      </Upload>
                    </Space>
                  </div>
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
              style={{ height: "50px", fontSize: "16px" }}
            >
              {loading ? "Mendaftar..." : "Selesaikan Registrasi"}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Camera Modal */}
      {showCamera && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <Card
            title="Ambil Foto Identitas"
            style={{ width: "90%", maxWidth: 500 }}
            extra={<Button onClick={() => setShowCamera(false)}>Batal</Button>}
          >
            <div className="webcam-container">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                width="100%"
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: "user",
                }}
              />
              <Button
                type="primary"
                size="large"
                onClick={capturePhoto}
                className="capture-button"
                style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                Ambil Foto
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GuestForm;
