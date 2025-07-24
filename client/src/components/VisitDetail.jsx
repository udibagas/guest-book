import {
  Descriptions,
  Tag,
  Typography,
  Image,
  Modal,
  Button,
  Tabs,
} from "antd";
import {
  LogoutOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CameraOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
const { Title } = Typography;

export default function VisitDetail({
  visit,
  modalVisible,
  setModalVisible,
  handleCheckOut,
  sendNotification,
}) {
  return (
    <Modal
      title="Detail Kunjungan"
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      footer={[
        <Button key="close" onClick={() => setModalVisible(false)}>
          Tutup
        </Button>,
        visit?.status === "checked_in" && handleCheckOut && (
          <Button
            key="checkout"
            type="primary"
            icon={<LogoutOutlined />}
            onClick={() => {
              handleCheckOut(visit.id);
              setModalVisible(false);
            }}
          >
            Check Out
          </Button>
        ),
        visit?.status === "checked_in" && sendNotification && (
          <Button
            key="checkout"
            type="primary"
            icon={<WhatsAppOutlined />}
            onClick={() => {
              sendNotification(visit.id);
            }}
          >
            Kirim Notifikasi
          </Button>
        ),
      ]}
      width={700}
    >
      {visit && (
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: (
                <span>
                  <UserOutlined /> Informasi Tamu
                </span>
              ),
              children: (
                <Descriptions size="small" bordered column={1}>
                  <Descriptions.Item label="Nama">
                    {visit.Guest?.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {visit.Guest?.email || "Tidak ada"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nomor Telepon">
                    {visit.Guest?.phoneNumber}
                  </Descriptions.Item>
                  <Descriptions.Item label="Perusahaan">
                    {visit.Guest?.company || "Tidak ada"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Jabatan">
                    {visit.Guest?.role || "Tidak ada"}
                  </Descriptions.Item>
                </Descriptions>
              ),
            },
            {
              key: "2",
              label: (
                <span>
                  <CalendarOutlined /> Informasi Kunjungan
                </span>
              ),
              children: (
                <Descriptions size="small" bordered column={1}>
                  <Descriptions.Item label="Tujuan">
                    {visit.Purpose?.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="PIC">
                    {visit.Host?.name || "Tidak ada"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Departemen">
                    {visit.Host?.Department?.name || "Tidak ada"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Waktu Masuk">
                    {dayjs(visit.checkInTime).format("DD-MMM-YYYY HH:mm")}
                  </Descriptions.Item>
                  {visit.checkOutTime && (
                    <Descriptions.Item label="Waktu Keluar">
                      {dayjs(visit.checkOutTime).format("DD-MMM-YYYY HH:mm")}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Status">
                    <Tag
                      color={visit.status === "checked_in" ? "green" : "blue"}
                    >
                      {visit.status === "checked_in"
                        ? "Sudah Masuk"
                        : "Sudah Keluar"}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              ),
            },
            {
              key: "3",
              label: (
                <span>
                  <FileTextOutlined /> Catatan
                </span>
              ),
              children: (
                <div>
                  {visit.customPurpose && (
                    <div style={{ marginBottom: 16 }}>
                      <Title level={5}>Tujuan Kustom:</Title>
                      <p
                        style={{
                          backgroundColor: "#f5f5f5",
                          padding: 12,
                          borderRadius: 6,
                          border: "1px solid #d9d9d9",
                        }}
                      >
                        {visit.customPurpose}
                      </p>
                    </div>
                  )}

                  {visit.notes ? (
                    <div>
                      <Title level={5}>Catatan Tambahan:</Title>
                      <p
                        style={{
                          backgroundColor: "#f5f5f5",
                          padding: 12,
                          borderRadius: 6,
                          border: "1px solid #d9d9d9",
                        }}
                      >
                        {visit.notes}
                      </p>
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: 40,
                        color: "#999",
                      }}
                    >
                      {!visit.customPurpose && "Tidak ada catatan tambahan"}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: "4",
              label: (
                <span>
                  <CameraOutlined /> Foto Identitas
                </span>
              ),
              children: (
                <div style={{ textAlign: "center" }}>
                  {visit.Guest?.idPhotoPath ? (
                    <Image
                      src={`${import.meta.env.VITE_API_URL || ""}${
                        visit.Guest.idPhotoPath
                      }`}
                      alt="Identitas Tamu"
                      style={{
                        maxWidth: "100%",
                        maxHeight: 400,
                        borderRadius: 8,
                        border: "1px solid #d9d9d9",
                      }}
                    />
                  ) : (
                    <div style={{ padding: 40, color: "#999" }}>
                      Foto identitas tidak tersedia
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}
    </Modal>
  );
}
