import React, { useEffect, useState } from "react";
import { Table, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axiosTeacherClient from "../api/axiosTeacherClient";

export default function ExamResultPage() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  // Tải danh sách kết quả các ca thi
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosTeacherClient.get("/exam-sessions"); // gọi API backend
        setData(res.data);
      } catch (err) {
        console.error(err);
        message.error("Không tải được kết quả thi");
      }
    };
    load();
  }, []);

  if (!data) return <p style={{ padding: 24 }}>Đang tải...</p>;
// Cột
  const columns = [
    { title: "ID", dataIndex: "session_id", width: 60 },
    { title: "Đề thi", dataIndex: "exam_title" },
    { title: "Môn học", dataIndex: "subject_name" },
    {
      title: "Thời gian",
      render: (r) =>
        `${dayjs(r.start_at).format("HH:mm DD/MM")} → ${dayjs(r.end_at).format(
          "HH:mm DD/MM"
        )}`,
    },
    { title: "Số SV thi", dataIndex: "total_students" },
    {
      title: "Điểm TB",
      dataIndex: "avg_score",
      render: (value) => (value ? Number(value).toFixed(2) : "-"),
    },
    {
      title: "Hành động",
      align: "center",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/results/${record.session_id}`)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // Hiển thị bảng
  return (
    <div style={{ padding: 24 }}>
      <h2>Kết quả thi của các ca</h2>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="session_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
