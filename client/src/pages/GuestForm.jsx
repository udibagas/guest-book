import { useState, useRef, useEffect } from "react";
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
  Steps,
  Row,
  Col,
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
  ArrowRightOutlined,
  AimOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import Webcam from "react-webcam";
import api from "../lib/api";
import { useFetch } from "../hooks/useFetch";

const { Title, Text } = Typography;
const { TextArea } = Input;

const GuestForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [idPhoto, setIdPhoto] = useState(null);
  const [idPhotoUrl, setIdPhotoUrl] = useState(null);
  const [showCustomPurpose, setShowCustomPurpose] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const { data: purposes = [] } = useFetch("/purposes");
  const { data: hosts = [] } = useFetch("/hosts");

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handlePurposeChange = (value) => {
    const purpose = purposes.find((p) => p.id === value);
    setShowCustomPurpose(purpose && purpose.name === "Other");
  };

  const handleIdentityChange = async (e) => {
    // const target = e.target.name;
    const identity = e.target.value;

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Only search if phone number has at least 10 digits
    if (identity && identity.replace(/[^0-9]/g, "").length >= 10) {
      // Debounce the search to avoid too many API calls
      const timeout = setTimeout(async () => {
        try {
          const { data: guest } = await api.get(
            `/guests/search?query=${identity}`
          );

          // Pre-fill form fields with existing guest data
          form.setFieldsValue({
            email: guest.email || "",
            company: guest.company || "",
            role: guest.role || "",
            idNumber: guest.idNumber || "",
            phoneNumber: guest.phoneNumber || "",
          });

          message.success("Data tamu ditemukan dan telah diisi otomatis");
        } catch (error) {
          // Silent fail - don't show error to user as this is just a convenience feature
          console.log("Guest search failed:", error);
        }
      }, 800); // Wait 800ms after user stops typing

      setSearchTimeout(timeout);
    }
  };

  const next = async () => {
    try {
      // Validate current step fields and save form data
      if (currentStep === 0) {
        await form.validateFields(["name", "phoneNumber", "email"]);
      } else if (currentStep === 1) {
        await form.validateFields(["PurposeId", "HostId"]);
        if (showCustomPurpose) {
          await form.validateFields(["customPurpose"]);
        }
      }

      // Save current form data to preserve it between steps
      const currentValues = form.getFieldsValue();
      console.log(
        "Saving form values at step",
        currentStep,
        ":",
        currentValues
      );

      setCurrentStep(currentStep + 1);
    } catch {
      // Validation failed, stay on current step
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const steps = [
    {
      title: "Informasi Pribadi",
      content: "personal-info",
    },
    {
      title: "Informasi Kunjungan",
      content: "visit-info",
    },
    {
      title: "Foto Identitas",
      content: "id-photo",
    },
  ];

  const renderPersonalInfoStep = () => (
    <>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12}>
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
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Nomor Identitas"
            name="idNumber"
            rules={[
              {
                max: 20,
                message: "Nomor identitas maksimal 20 karakter",
              },
            ]}
          >
            <Input
              prefix={<IdcardOutlined />}
              placeholder="Masukkan nomor KTP/SIM (opsional)"
              onChange={handleIdentityChange}
              name="idNumber"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12}>
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
              onChange={handleIdentityChange}
              name="phoneNumber"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
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
        </Col>
      </Row>

      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12}>
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
        </Col>
        <Col xs={24} sm={12}>
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
              placeholder="Masukkan jabatan/posisi Anda (opsional)"
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  const renderVisitInfoStep = () => (
    <>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12}>
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
              showSearch
              optionFilterProp="text"
              placeholder="Pilih tujuan kunjungan"
              onChange={handlePurposeChange}
              options={purposes.map((purpose) => ({
                text: purpose.name,
                label: (
                  <>
                    <AimOutlined /> {purpose.name}
                  </>
                ),
                value: purpose.id,
              }))}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Orang yang Akan Ditemui"
            name="HostId"
            rules={[
              { required: true, message: "Pilih orang yang akan ditemui" },
            ]}
          >
            <Select
              showSearch
              optionFilterProp="text"
              placeholder="Pilih orang yang akan ditemui"
              allowClear
              options={hosts.map((host) => ({
                text: host.name,
                label: (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <UserOutlined /> {host.name}{" "}
                      <i style={{ color: "#999" }}>{host.Role.name}</i>
                    </div>
                    {host.Department.name}
                  </div>
                ),
                value: host.id,
              }))}
            />
          </Form.Item>
        </Col>
      </Row>

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
    </>
  );

  const renderIdPhotoStep = () => (
    <Form.Item label="Foto Identitas" required>
      <div className="photo-upload-container">
        {idPhotoUrl ? (
          <div>
            <img src={idPhotoUrl} alt="ID Preview" className="photo-preview" />
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
            <FileTextOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
            <div style={{ marginTop: 16 }}>
              <Text>Silakan unggah atau ambil foto identitas Anda</Text>
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
  );

  const handleSubmit = async () => {
    try {
      // Get all form values including the current ones
      const allValues = form.getFieldsValue();
      console.log("Form values:", allValues); // Debug log

      if (!idPhoto) {
        message.error("Silakan unggah atau ambil foto identitas Anda");
        return;
      }

      setLoading(true);

      // First upload the photo
      const formData = new FormData();
      formData.append("idPhoto", idPhoto);

      const uploadResponse = await api.post("/upload/id-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Prepare visit data using all form values
      const visitData = {
        guestData: {
          name: allValues.name,
          phoneNumber: allValues.phoneNumber,
          idNumber: allValues.idNumber || null,
          email: allValues.email,
          company: allValues.company || null,
          role: allValues.role,
          idPhotoPath: uploadResponse.data.data.filePath,
        },
        PurposeId: allValues.PurposeId,
        HostId: allValues.HostId || null,
        customPurpose: allValues.customPurpose || null,
        notes: allValues.notes || null,
      };

      await api.post("/visits", visitData);

      message.success("Registrasi berhasil! Selamat datang!");
      setSubmitted(true);
    } catch (error) {
      console.error("Registration error:", error);
      message.error(
        error.response?.data?.message || "Registrasi gagal. Silakan coba lagi."
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
          subTitle="Terima kasih telah mendaftar. Anda sekarang telah check-in ke PT PLN. Selamat berkunjung!"
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
        <Steps
          current={currentStep}
          items={steps}
          style={{ marginBottom: 32 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
          preserve={true}
        >
          <div className="steps-content" style={{ minHeight: 300 }}>
            <div style={{ display: currentStep === 0 ? "block" : "none" }}>
              {renderPersonalInfoStep()}
            </div>
            <div style={{ display: currentStep === 1 ? "block" : "none" }}>
              {renderVisitInfoStep()}
            </div>
            <div style={{ display: currentStep === 2 ? "block" : "none" }}>
              {renderIdPhotoStep()}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            {currentStep > 0 && (
              <Button
                style={{ margin: "10px 8px" }}
                onClick={prev}
                icon={<ArrowLeftOutlined />}
              >
                Sebelumnya
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={next}>
                Selanjutnya
                <ArrowRightOutlined />
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button
                type="primary"
                loading={loading}
                size="large"
                onClick={async () => {
                  try {
                    // Validate all required fields before submission
                    const requiredFields = [
                      "name",
                      "phoneNumber",
                      "PurposeId",
                      "HostId",
                    ];
                    if (showCustomPurpose) {
                      requiredFields.push("customPurpose");
                    }
                    await form.validateFields(requiredFields);

                    // If validation passes, submit the form manually
                    handleSubmit();
                  } catch {
                    message.error(
                      "Silakan lengkapi semua field yang wajib diisi"
                    );
                  }
                }}
              >
                {loading ? "Mendaftar..." : "Selesaikan Registrasi"}
              </Button>
            )}
          </div>
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
                  facingMode: "environment", // Use back camera for better ID photo capture
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
