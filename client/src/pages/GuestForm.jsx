import React, { useState, useRef, useEffect } from "react";
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
import axios from "axios";

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
  const [purposes, setPurposes] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showCustomPurpose, setShowCustomPurpose] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPurposes();
    fetchHosts();
    fetchDepartments();
  }, []);

  const fetchPurposes = async () => {
    try {
      const response = await axios.get("/api/purposes");
      setPurposes(response.data.data);
    } catch (error) {
      console.error("Error fetching purposes:", error);
      message.error("Failed to load purposes");
    }
  };

  const fetchHosts = async () => {
    try {
      const response = await axios.get("/api/hosts");
      setHosts(response.data.data);
    } catch (error) {
      console.error("Error fetching hosts:", error);
      message.error("Failed to load hosts");
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("/api/hosts/departments");
      setDepartments(response.data.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchHostsByDepartment = async (department) => {
    try {
      const response = await axios.get(
        `/api/hosts?department=${encodeURIComponent(department)}`
      );
      setHosts(response.data.data);
    } catch (error) {
      console.error("Error fetching hosts by department:", error);
    }
  };

  const handlePurposeChange = (value) => {
    const purpose = purposes.find((p) => p.id === value);
    setShowCustomPurpose(purpose && purpose.name === "Other");
  };

  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value);
    form.setFieldValue("hostId", undefined); // Clear host selection
    if (value) {
      fetchHostsByDepartment(value);
    } else {
      fetchHosts(); // Fetch all hosts if no department selected
    }
  };

  const handleSubmit = async (values) => {
    if (!idPhoto) {
      message.error("Please upload or capture your ID photo");
      return;
    }

    setLoading(true);

    try {
      // First upload the photo
      const formData = new FormData();
      formData.append("idPhoto", idPhoto);

      const uploadResponse = await axios.post(
        "/api/upload/id-photo",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

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
        purposeId: values.purposeId,
        hostId: values.hostId || null,
        customPurpose: values.customPurpose || null,
        notes: values.notes || null,
      };

      await axios.post("/api/visits", visitData);

      message.success("Registration successful! Welcome to Mitrateknik.");
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
          title="Registration Successful!"
          subTitle="Thank you for registering. You are now checked in to Mitrateknik. Have a pleasant visit!"
          extra={[
            <Button type="primary" key="home" onClick={() => navigate("/")}>
              Back to Home
            </Button>,
            <Button
              key="new"
              onClick={() => {
                setSubmitted(false);
                form.resetFields();
                setIdPhoto(null);
                setIdPhotoUrl(null);
                setSelectedDepartment(null);
                setShowCustomPurpose(false);
              }}
            >
              Register Another Guest
            </Button>,
          ]}
        />
      </div>
    );
  }

  const filteredHosts = selectedDepartment
    ? hosts.filter((host) => host.department === selectedDepartment)
    : hosts;

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
              Guest Registration
            </Title>
          </Space>
        }
        bordered={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Title level={4}>Personal Information</Title>

          <Form.Item
            label="Full Name"
            name="name"
            rules={[
              { required: true, message: "Please enter your full name" },
              { min: 2, message: "Name must be at least 2 characters" },
              { max: 100, message: "Name must not exceed 100 characters" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your full name"
            />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phoneNumber"
            rules={[
              { required: true, message: "Please enter your phone number" },
              {
                pattern: /^[0-9+\-\s()]+$/,
                message: "Please enter a valid phone number",
              },
              { min: 10, message: "Phone number must be at least 10 digits" },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Enter your phone number"
            />
          </Form.Item>

          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: "Please enter your email address" },
              { type: "email", message: "Please enter a valid email address" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email address"
            />
          </Form.Item>

          <Form.Item
            label="Company"
            name="company"
            rules={[
              {
                max: 100,
                message: "Company name must not exceed 100 characters",
              },
            ]}
          >
            <Input
              prefix={<BankOutlined />}
              placeholder="Enter your company name (optional)"
            />
          </Form.Item>

          <Form.Item
            label="Role/Position"
            name="role"
            rules={[
              { required: true, message: "Please enter your role or position" },
              { min: 2, message: "Role must be at least 2 characters" },
              { max: 100, message: "Role must not exceed 100 characters" },
            ]}
          >
            <Input
              prefix={<IdcardOutlined />}
              placeholder="Enter your role or position"
            />
          </Form.Item>

          <Divider />

          <Title level={4}>Visit Information</Title>

          <Form.Item
            label="Purpose of Visit"
            name="purposeId"
            rules={[
              {
                required: true,
                message: "Please select the purpose of your visit",
              },
            ]}
          >
            <Select
              placeholder="Select purpose of visit"
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
              label="Please specify your purpose"
              name="customPurpose"
              rules={[
                { required: true, message: "Please specify your purpose" },
                { max: 500, message: "Purpose must not exceed 500 characters" },
              ]}
            >
              <TextArea
                rows={3}
                placeholder="Please describe your specific purpose"
                showCount
                maxLength={500}
              />
            </Form.Item>
          )}

          <Form.Item label="Department" name="department">
            <Select
              placeholder="Select department (optional)"
              allowClear
              onChange={handleDepartmentChange}
            >
              {departments.map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Person to Meet"
            name="hostId"
            help="Select the person you want to meet (optional)"
          >
            <Select placeholder="Select person to meet (optional)" allowClear>
              {filteredHosts.map((host) => (
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
            label="Additional Notes"
            name="notes"
            rules={[
              { max: 1000, message: "Notes must not exceed 1000 characters" },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Any additional information (optional)"
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Divider />

          <Form.Item label="ID Photo" required>
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
                        Retake Photo
                      </Button>
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={handleFileUpload}
                      >
                        <Button icon={<UploadOutlined />}>
                          Upload Different Photo
                        </Button>
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
                        Take Photo
                      </Button>
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={handleFileUpload}
                      >
                        <Button icon={<UploadOutlined />}>Upload Photo</Button>
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
              {loading ? "Registering..." : "Complete Registration"}
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
            title="Capture ID Photo"
            style={{ width: "90%", maxWidth: 500 }}
            extra={<Button onClick={() => setShowCamera(false)}>Cancel</Button>}
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
                Capture Photo
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GuestForm;
