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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import api from "../../api/axios";

const { Title } = Typography;

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const params = searchText ? { search: searchText } : {};
      const response = await api.get("/api/departments", { params });
      setDepartments(response.data.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      message.error("Gagal memuat data departemen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleAdd = () => {
    setEditingDepartment(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    form.setFieldsValue({
      name: department.name,
      description: department.description,
    });
    setModalVisible(true);
  };

  const handleDelete = async (departmentId) => {
    try {
      await api.delete(`/api/departments/${departmentId}`);
      message.success("Departemen berhasil dihapus");
      fetchDepartments();
    } catch (error) {
      console.error("Error deleting department:", error);
      message.error("Gagal menghapus departemen");
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingDepartment) {
        await api.put(`/api/departments/${editingDepartment.id}`, values);
        message.success("Departemen berhasil diperbarui");
      } else {
        await api.post("/api/departments", values);
        message.success("Departemen berhasil ditambahkan");
      }
      setModalVisible(false);
      fetchDepartments();
    } catch (error) {
      console.error("Error saving department:", error);
      message.error("Gagal menyimpan departemen");
    }
  };

  const columns = [
    {
      title: "Nama Departemen",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
      render: (description) => description || "-",
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
            title="Apakah Anda yakin ingin menghapus departemen ini?"
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
    <div className="departments-container">
      <Card>
        <div className="page-header">
          <Title level={2}>Manajemen Departemen</Title>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Tambah Departemen
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchDepartments}
              loading={loading}
            >
              Perbarui
            </Button>
          </Space>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Cari departemen"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            size="large"
          />
        </div>

        {/* Departments Table */}
        <Table
          columns={columns}
          dataSource={departments}
          rowKey="id"
          loading={loading}
          scroll={{ x: 600 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingDepartment ? "Edit Departemen" : "Tambah Departemen"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Nama Departemen"
            name="name"
            rules={[
              { required: true, message: "Silakan masukkan nama departemen" },
              { min: 2, message: "Nama minimal 2 karakter" },
            ]}
          >
            <Input placeholder="Masukkan nama departemen" />
          </Form.Item>

          <Form.Item label="Deskripsi" name="description">
            <Input.TextArea
              rows={3}
              placeholder="Masukkan deskripsi departemen (opsional)"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingDepartment ? "Perbarui" : "Tambah"}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Batal</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Departments;
