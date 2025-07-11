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
  Select,
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
import { useFetch } from "../../hooks/useFetch";

const { Title } = Typography;
const { Option } = Select;

const Hosts = () => {
  const {
    form,
    createMutation,
    updateMutation,
    modalOpen,
    editingData,
    useFetch: useFetchCrud,
    setModalOpen,
    handleAdd,
    handleEdit,
    handleDelete,
    refreshData,
    handleSubmit,
  } = useCrud("/hosts");

  const { data: hosts, isPending } = useFetchCrud();
  const { data: departments = [] } = useFetch("/departments");
  const { data: roles = [] } = useFetch("/roles");

  useEffect(() => {
    if (editingData) {
      form.setFieldsValue(editingData);
    } else {
      form.resetFields();
    }
  }, [editingData, form]);

  const columns = [
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Telepon",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (phoneNumber) => phoneNumber || "-",
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
          <Title level={3}>Kelola PIC</Title>
          <Space>
            <Button
              variant="solid"
              color="default"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Tambah PIC
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

        {/* Hosts Table */}
        <Table
          size="middle"
          columns={columns}
          dataSource={hosts}
          rowKey="id"
          loading={isPending}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        width={450}
        title={editingData ? "Edit PIC" : "Tambah PIC"}
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
            label="Nama"
            name="name"
            rules={[
              { required: true, message: "Silakan masukkan nama PIC" },
              { min: 2, message: "Nama minimal 2 karakter" },
            ]}
          >
            <Input placeholder="Masukkan nama PIC" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { type: "email", message: "Silakan masukkan email yang valid" },
            ]}
          >
            <Input placeholder="Masukkan email PIC" />
          </Form.Item>

          <Form.Item label="Nomor Telepon" name="phoneNumber">
            <Input placeholder="Masukkan nomor telepon (opsional)" />
          </Form.Item>

          <Form.Item
            label="Departemen"
            name="DepartmentId"
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
            name="RoleId"
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
        </Form>
      </Modal>
    </>
  );
};

export default Hosts;
