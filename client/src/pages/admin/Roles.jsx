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
  MoreOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useCrud } from "../../hooks/useCrud";
import { useEffect } from "react";

const { Title } = Typography;

const Roles = () => {
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
  } = useCrud("/roles");

  const { data: roles, isPending } = useFetch();

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
      title: "Nama Jabatan",
      dataIndex: "name",
      key: "name",
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
          <Title level={3}>Kelola Jabatan</Title>
          <Space>
            <Button
              variant="solid"
              color="default"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Tambah Jabatan
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

        {/* Roles Table */}
        <Table
          size="middle"
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={isPending}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        width={450}
        title={editingData ? "Edit Jabatan" : "Tambah Jabatan"}
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
          labelCol={{ span: 7 }}
          style={{ marginTop: 20 }}
          colon={false}
          variant="filled"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Nama Jabatan"
            name="name"
            rules={[
              { required: true, message: "Silakan masukkan nama jabatan" },
              { min: 2, message: "Nama minimal 2 karakter" },
            ]}
          >
            <Input placeholder="Masukkan nama jabatan" />
          </Form.Item>

          <Form.Item label="Deskripsi" name="description">
            <Input.TextArea
              rows={3}
              placeholder="Masukkan deskripsi jabatan (opsional)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Roles;
