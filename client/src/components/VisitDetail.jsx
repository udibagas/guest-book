import { Descriptions, Tag, Typography, Image, Modal, Button } from "antd";
import dayjs from "dayjs";
const { Title } = Typography;

export default function VisitDetail({
  visit,
  modalVisible,
  setModalVisible,
  handleCheckOut,
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
      ]}
      width={800}
    >
      {visit && (
        <div>
          <Descriptions
            size="small"
            title="Informasi Tamu"
            bordered
            column={1}
            style={{ marginBottom: 24 }}
          >
            <Descriptions.Item label="Nama">
              {visit.Guest?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {visit.Guest?.email}
            </Descriptions.Item>
            <Descriptions.Item label="Nomor Telepon">
              {visit.Guest?.phoneNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Perusahaan">
              {visit.Guest?.company || "Tidak ada"}
            </Descriptions.Item>
            <Descriptions.Item label="Jabatan">
              {visit.Guest?.role}
            </Descriptions.Item>
          </Descriptions>

          <Descriptions
            size="small"
            title="Informasi Kunjungan"
            bordered
            column={1}
            style={{ marginBottom: 24 }}
          >
            <Descriptions.Item label="Tujuan">
              {visit.Purpose?.name}
            </Descriptions.Item>
            <Descriptions.Item label="PIC">
              {visit.Host?.name || "Tidak ada"}
            </Descriptions.Item>
            <Descriptions.Item label="Departemen">
              {visit.Host?.department || "Tidak ada"}
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
              <Tag color={visit.status === "checked_in" ? "green" : "blue"}>
                {visit.status === "checked_in" ? "Sudah Masuk" : "Sudah Keluar"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          {visit.customPurpose && (
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>Tujuan Kustom:</Title>
              <p
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: 8,
                  borderRadius: 4,
                }}
              >
                {visit.customPurpose}
              </p>
            </div>
          )}

          {visit.notes && (
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>Catatan:</Title>
              <p
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: 8,
                  borderRadius: 4,
                }}
              >
                {visit.notes}
              </p>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <Title level={5}>Foto Identitas:</Title>
            {visit.Guest?.idPhotoPath && (
              <Image
                src={`${import.meta.env.VITE_API_URL || ""}${
                  visit.Guest.idPhotoPath
                }`}
                alt="Identitas Tamu"
                style={{ maxWidth: "100%", maxHeight: 300 }}
              />
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
