import { useEffect } from "react";
import {
  Table,
  Card,
  Input,
  Button,
  Space,
  Typography,
  Modal,
  Form,
  Dropdown,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SettingOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useCrud } from "../../hooks/useCrud";

const { Title } = Typography;

const Departments = () => {
  const {
    form,
    createMutation,
    updateMutation,
    modalOpen,
    editingData,
    useFetch,
    setModalOpen,
    handleAdd,
    handleEdit,
    handleDelete,
    refreshData,
    handleSubmit,
  } = useCrud("/departments");

  const { data: departments, isPending } = useFetch();

  useEffect(() => {
    if (editingData) {
      form.setFieldsValue({
        name: editingData.name,
        description: editingData.description,
      });
    } else {
      form.resetFields();
    }
  }, [editingData, form]);

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
      title: <SettingOutlined />,
      key: "actions",
      align: "center",
      width: 60,
      render: (_, record) => {
        const menuItems = [
          {
            key: "edit",
            label: "Edit",
            icon: <EditOutlined />,
            onClick: () => handleEdit(record),
          },
          {
            key: "delete",
            label: "Hapus",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: "Hapus Role",
                content: "Anda yakin akan menghapus role ini?",
                okText: "Ya",
                cancelText: "Tidak",
                onOk: () => handleDelete(record.id),
              });
            },
          },
        ];

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button type="text" icon={<MoreOutlined />} size="small" />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      <Card style={{ minHeight: "calc(100vh - 100px)" }}>
        <div className="page-header">
          <Title level={3}>Kelola Departemen</Title>
          <Space>
            <Button
              variant="solid"
              color="default"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Tambah Departemen
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={refreshData}
              loading={isPending}
            >
              Perbarui
            </Button>
          </Space>
        </div>

        {/* Departments Table */}
        <Table
          size="middle"
          columns={columns}
          dataSource={departments}
          rowKey="id"
          loading={isPending}
          scroll={{ x: 600 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        width={500}
        title={editingData ? "Edit Departemen" : "Tambah Departemen"}
        open={modalOpen}
        cancelText="Batal"
        onCancel={() => setModalOpen(false)}
        afterClose={() => form.resetFields()}
        onOk={() => form.submit()}
        okText="Simpan"
        okButtonProps={{
          variant: "solid",
          color: "default",
          loading: createMutation.isPending || updateMutation.isPending,
        }}
      >
        <Form
          form={form}
          layout="horizontal"
          labelAlign="left"
          requiredMark={false}
          labelCol={{ span: 8 }}
          style={{ marginTop: 20 }}
          colon={false}
          variant="filled"
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
        </Form>
      </Modal>
    </>
  );
};

export default Departments;
