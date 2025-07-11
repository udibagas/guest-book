import { Table, Tag } from "antd";
import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import dayjs from "dayjs";

export default function VisitTable() {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { data, isPending } = useFetch("/visits", {
    page: pagination.current,
    limit: pagination.pageSize,
  });

  const columns = [
    {
      title: "Nama Tamu",
      dataIndex: ["Guest", "name"],
      key: "guestName",
    },
    {
      title: "Perusahaan",
      dataIndex: ["Guest", "company"],
      key: "guestCompany",
      render: (company) => company || "-",
    },
    {
      title: "Tujuan",
      dataIndex: ["Purpose", "name"],
      key: "purposeName",
    },
    {
      title: "PIC",
      dataIndex: ["Host", "name"],
      key: "hostName",
      render: (hostName) => hostName || "-",
    },
    {
      title: "Waktu Masuk",
      dataIndex: "checkInTime",
      key: "checkInTime",
      render: (time) => dayjs(time).format("DD-MMM-YYYY HH:mm"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 150,
      render: (status) => (
        <Tag color={status === "checked_in" ? "green" : "blue"}>
          {status === "checked_in" ? "Sudah Masuk" : "Sudah Keluar"}
        </Tag>
      ),
    },
  ];

  return (
    <Table
      size="middle"
      columns={columns}
      dataSource={data?.data?.rows || []}
      rowKey="id"
      loading={isPending}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} dari ${total} kunjungan`,
      }}
      onChange={(pagination) => setPagination(pagination)}
    />
  );
}
