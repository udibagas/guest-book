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
  Upload,
  message,
  Divider,
  Alert,
  List,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  MoreOutlined,
  UploadOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useCrud } from "../../hooks/useCrud";
import { useEffect, useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import * as XLSX from "xlsx";

const { Title } = Typography;
const { Option } = Select;

const Hosts = () => {
  const queryClient = useQueryClient();
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filteredHosts, setFilteredHosts] = useState([]);

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

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/hosts/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      setImportResults(data.results);
      queryClient.invalidateQueries(["hosts"]);
      message.success(
        `Import completed! ${data.results.imported} new hosts imported, ${data.results.updated} updated.`
      );
    },
    onError: (error) => {
      console.error("Import error:", error);
      message.error(error.response?.data?.error || "Failed to import hosts");
    },
  });

  // Handle file upload
  const handleImportFile = (file) => {
    importMutation.mutate(file);
    return false; // Prevent default upload behavior
  };

  // Download Excel template
  const downloadTemplate = () => {
    const templateData = [
      {
        name: "John Doe",
        email: "john.doe@example.com",
        phoneNumber: "08123456789",
        department: "IT",
        role: "Manager",
      },
      {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phoneNumber: "08987654321",
        department: "HR",
        role: "Staff",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hosts Template");

    // Set column widths
    const colWidths = [
      { wch: 20 }, // name
      { wch: 25 }, // email
      { wch: 15 }, // phoneNumber
      { wch: 15 }, // department
      { wch: 15 }, // role
    ];
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, "hosts_template.xlsx");
  };

  const openImportModal = () => {
    setImportModalOpen(true);
    setImportResults(null);
  };

  useEffect(() => {
    if (editingData) {
      form.setFieldsValue(editingData);
    } else {
      form.resetFields();
    }
  }, [editingData, form]);

  // Filter hosts based on search text
  useEffect(() => {
    if (!hosts) {
      setFilteredHosts([]);
      return;
    }

    if (!searchText.trim()) {
      setFilteredHosts(hosts);
      return;
    }

    const filtered = hosts.filter((host) => {
      const searchLower = searchText.toLowerCase();
      return (
        host.name?.toLowerCase().includes(searchLower) ||
        host.email?.toLowerCase().includes(searchLower) ||
        host.phoneNumber?.toLowerCase().includes(searchLower) ||
        host.Department?.name?.toLowerCase().includes(searchLower) ||
        host.Role?.name?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredHosts(filtered);
  }, [hosts, searchText]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

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
      title: <ReloadOutlined onClick={refreshData} />,
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
                title: "Hapus PIC",
                content: "Anda yakin akan menghapus PIC ini?",
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
            <Input.Search
              placeholder="Cari berdasarkan nama, email, telepon, departemen, atau jabatan"
              allowClear
              style={{ width: 400 }}
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>
              Download Template
            </Button>
            <Button icon={<UploadOutlined />} onClick={openImportModal}>
              Import Excel
            </Button>
            <Button
              variant="solid"
              color="default"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Tambah PIC
            </Button>
          </Space>
        </div>

        {/* Hosts Table */}
        <Table
          size="middle"
          columns={columns}
          dataSource={filteredHosts}
          rowKey="id"
          loading={isPending}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} PIC${
                searchText ? ` (difilter dari ${hosts?.length || 0} total)` : ""
              }`,
          }}
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

      {/* Import Modal */}
      <Modal
        title="Import PIC dari Excel"
        open={importModalOpen}
        onCancel={() => setImportModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setImportModalOpen(false)}>
            Tutup
          </Button>,
        ]}
        width={600}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Alert
            message="Petunjuk Import Excel"
            description={
              <div>
                <p>
                  File Excel harus memiliki kolom berikut (case insensitive):
                </p>
                <ul>
                  <li>
                    <strong>name/nama:</strong> Nama PIC (wajib)
                  </li>
                  <li>
                    <strong>email:</strong> Email PIC (wajib)
                  </li>
                  <li>
                    <strong>phoneNumber/phone/telepon:</strong> Nomor telepon
                    (opsional)
                  </li>
                  <li>
                    <strong>department/departemen:</strong> Nama departemen
                    (opsional, akan dibuat otomatis jika belum ada)
                  </li>
                  <li>
                    <strong>role/jabatan:</strong> Nama jabatan (opsional, akan
                    dibuat otomatis jika belum ada)
                  </li>
                </ul>
                <p>
                  PIC yang sudah ada (berdasarkan email) akan diperbarui dengan
                  data baru.
                </p>
              </div>
            }
            type="info"
            icon={<InfoCircleOutlined />}
            style={{ marginBottom: 16 }}
          />

          <div>
            <Button
              icon={<DownloadOutlined />}
              onClick={downloadTemplate}
              style={{ marginBottom: 16 }}
            >
              Download Template Excel
            </Button>
          </div>

          <Upload.Dragger
            accept=".xlsx,.xls,.csv"
            beforeUpload={handleImportFile}
            showUploadList={false}
            loading={importMutation.isPending}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">
              Klik atau drag file Excel ke area ini untuk import
            </p>
            <p className="ant-upload-hint">
              Mendukung file .xlsx, .xls, dan .csv (maksimal 5MB)
            </p>
          </Upload.Dragger>

          {importMutation.isPending && (
            <Alert message="Sedang memproses file..." type="info" showIcon />
          )}

          {importResults && (
            <div>
              <Divider>Hasil Import</Divider>

              <Space direction="vertical" style={{ width: "100%" }}>
                <Alert
                  message={`Import Selesai: ${importResults.imported} data baru, ${importResults.updated} data diperbarui dari ${importResults.total} total baris`}
                  type="success"
                  showIcon
                />

                {importResults.newDepartments.length > 0 && (
                  <div>
                    <strong>Departemen baru yang dibuat:</strong>
                    <div style={{ marginTop: 8 }}>
                      {importResults.newDepartments.map((dept, index) => (
                        <Tag key={index} color="green">
                          {dept}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}

                {importResults.newRoles.length > 0 && (
                  <div>
                    <strong>Jabatan baru yang dibuat:</strong>
                    <div style={{ marginTop: 8 }}>
                      {importResults.newRoles.map((role, index) => (
                        <Tag key={index} color="blue">
                          {role}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}

                {importResults.errors.length > 0 && (
                  <div>
                    <Alert
                      message={`${importResults.errors.length} error ditemukan:`}
                      type="warning"
                      showIcon
                    />
                    <List
                      size="small"
                      dataSource={importResults.errors}
                      renderItem={(error, index) => (
                        <List.Item key={index}>
                          <Typography.Text type="danger">
                            {error}
                          </Typography.Text>
                        </List.Item>
                      )}
                      style={{ marginTop: 8, maxHeight: 200, overflow: "auto" }}
                    />
                  </div>
                )}
              </Space>
            </div>
          )}
        </Space>
      </Modal>
    </>
  );
};

export default Hosts;
