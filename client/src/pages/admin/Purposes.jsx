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

const Purposes = () => {
  const [purposes, setPurposes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPurpose, setEditingPurpose] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  const fetchPurposes = async () => {
    setLoading(true);
    try {
      const params = searchText ? { search: searchText } : {};
      const response = await api.get("/api/purposes", { params });
      setPurposes(response.data.data);
    } catch (error) {
      console.error("Error fetching purposes:", error);
      message.error("Gagal memuat data tujuan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurposes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleAdd = () => {
    setEditingPurpose(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (purpose) => {
    setEditingPurpose(purpose);
    form.setFieldsValue({
      name: purpose.name,
      description: purpose.description,
    });
    setModalVisible(true);
  };

  const handleDelete = async (purposeId) => {
    try {
      await api.delete(`/api/purposes/${purposeId}`);
      message.success("Tujuan berhasil dihapus");
      fetchPurposes();
    } catch (error) {
      console.error("Error deleting purpose:", error);
      message.error("Gagal menghapus tujuan");
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingPurpose) {
        await api.put(`/api/purposes/${editingPurpose.id}`, values);
        message.success("Tujuan berhasil diperbarui");
      } else {
        await api.post("/api/purposes", values);
        message.success("Tujuan berhasil ditambahkan");
      }
      setModalVisible(false);
      fetchPurposes();
    } catch (error) {
      console.error("Error saving purpose:", error);
      message.error("Gagal menyimpan tujuan");
    }
  };

  const columns = [
    {
      title: "Nama Tujuan",
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
            title="Apakah Anda yakin ingin menghapus tujuan ini?"
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
    <div className="purposes-container">
      <Card>
        <div className="page-header">
          <Title level={2}>Manajemen Tujuan</Title>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Tambah Tujuan
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchPurposes}
              loading={loading}
            >
              Perbarui
            </Button>
          </Space>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Cari tujuan"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            size="large"
          />
        </div>

        {/* Purposes Table */}
        <Table
          columns={columns}
          dataSource={purposes}
          rowKey="id"
          loading={loading}
          scroll={{ x: 600 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingPurpose ? "Edit Tujuan" : "Tambah Tujuan"}
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
            label="Nama Tujuan"
            name="name"
            rules={[
              { required: true, message: "Silakan masukkan nama tujuan" },
              { min: 2, message: "Nama minimal 2 karakter" },
            ]}
          >
            <Input placeholder="Masukkan nama tujuan" />
          </Form.Item>

          <Form.Item label="Deskripsi" name="description">
            <Input.TextArea
              rows={3}
              placeholder="Masukkan deskripsi tujuan (opsional)"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingPurpose ? "Perbarui" : "Tambah"}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Batal</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Purposes;
