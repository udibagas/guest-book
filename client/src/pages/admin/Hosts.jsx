import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Input,
  Button,
  Space,
  Typography,
  message,
  Popconfirm,
  Modal,
  Form,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import api from "../../api/axios";

const { Title } = Typography;
const { Option } = Select;

const Hosts = () => {
  const [hosts, setHosts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHost, setEditingHost] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  const fetchHosts = async () => {
    setLoading(true);
    try {
      const params = searchText ? { search: searchText } : {};
      const { data } = await api.get("/api/hosts", { params });
      setHosts(data);
    } catch (error) {
      console.error("Error fetching hosts:", error);
      message.error("Gagal memuat data host");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get("/api/departments");
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data } = await api.get("/api/roles");
      setRoles(data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    fetchHosts();
    fetchDepartments();
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleAdd = () => {
    setEditingHost(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (host) => {
    setEditingHost(host);
    form.setFieldsValue({
      name: host.name,
      email: host.email,
      phone: host.phone,
      departmentId: host.departmentId,
      roleId: host.roleId,
    });
    setModalVisible(true);
  };

  const handleDelete = async (hostId) => {
    try {
      await api.delete(`/api/hosts/${hostId}`);
      message.success("Host berhasil dihapus");
      fetchHosts();
    } catch (error) {
      console.error("Error deleting host:", error);
      message.error("Gagal menghapus host");
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingHost) {
        await api.put(`/api/hosts/${editingHost.id}`, values);
        message.success("Host berhasil diperbarui");
      } else {
        await api.post("/api/hosts", values);
        message.success("Host berhasil ditambahkan");
      }
      setModalVisible(false);
      fetchHosts();
    } catch (error) {
      console.error("Error saving host:", error);
      message.error("Gagal menyimpan host");
    }
  };

  const columns = [
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Telepon",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => phone || "-",
    },
    {
      title: "Departemen",
      dataIndex: ["Department", "name"],
      key: "department",
      render: (departmentName) => departmentName || "-",
    },
    {
      title: "Jabatan",
      dataIndex: ["Role", "name"],
      key: "role",
      render: (roleName) => roleName || "-",
    },
    {
      title: "Aksi",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit"
          />
          <Popconfirm
            title="Apakah Anda yakin ingin menghapus host ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Hapus"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="hosts-container">
      <Card>
        <div className="page-header">
          <Title level={2}>Manajemen Host</Title>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Tambah Host
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchHosts}
              loading={loading}
            >
              Perbarui
            </Button>
          </Space>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Cari berdasarkan nama atau email"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            size="large"
          />
        </div>

        {/* Hosts Table */}
        <Table
          columns={columns}
          dataSource={hosts}
          rowKey="id"
          loading={loading}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingHost ? "Edit Host" : "Tambah Host"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Nama"
            name="name"
            rules={[
              { required: true, message: "Silakan masukkan nama host" },
              { min: 2, message: "Nama minimal 2 karakter" },
            ]}
          >
            <Input placeholder="Masukkan nama host" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Silakan masukkan email host" },
              { type: "email", message: "Silakan masukkan email yang valid" },
            ]}
          >
            <Input placeholder="Masukkan email host" />
          </Form.Item>

          <Form.Item label="Nomor Telepon" name="phone">
            <Input placeholder="Masukkan nomor telepon (opsional)" />
          </Form.Item>

          <Form.Item
            label="Departemen"
            name="departmentId"
            rules={[{ required: true, message: "Silakan pilih departemen" }]}
          >
            <Select placeholder="Pilih departemen">
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Jabatan"
            name="roleId"
            rules={[{ required: true, message: "Silakan pilih jabatan" }]}
          >
            <Select placeholder="Pilih jabatan">
              {roles.map((role) => (
                <Option key={role.id} value={role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingHost ? "Perbarui" : "Tambah"}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Batal</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Hosts;
