import React, { useEffect, useState } from "react";
import { Table, Button, Breadcrumb, message } from "antd";
import axiosTeacherClient from "../api/axiosTeacherClient";
import { useParams, useNavigate } from "react-router-dom";

export default function ExamResultDetailPage() {
  const { id } = useParams(); // sessionId
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosTeacherClient.get(`/exam-sessions/${id}/results`);
        setData(res.data);
      } catch {
        message.error("Không tải được kết quả ca thi");
      }
    };
    load();
  }, [id]);

  if (!data) return <p style={{ padding: 24 }}>Đang tải...</p>;

  const columns = [
    { title: "Mã bài làm", dataIndex: "attempt_id", width: 100 },
    { title: "Sinh viên", dataIndex: "student_name" },
    { title: "Điểm", dataIndex: "score" },
    {
      title: "Thời gian nộp",
      dataIndex: "submitted_at",
      render: (v) => new Date(v).toLocaleString(),
    },
    {
      title: "Thao tác",
      render: (r) => (
        <Button
          type="link"
          onClick={() => navigate(`/results/${id}/student/${r.student_id}`)}
        >
          Xem bài làm
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { title: <a onClick={() => navigate("/results")}>Kết quả thi</a> },
          { title: `Ca thi #${id}` },
        ]}
        style={{ marginBottom: 12 }}
      />

      {/* Nút quay lại */}
      <Button
        type="default"
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        ← Quay lại
      </Button>

      <h2>Kết quả ca thi #{id}</h2>
      <p>
        Tổng sinh viên: {data.total_students} | Điểm TB: {data.average_score} |{" "}
        Cao nhất: {data.max_score} | Thấp nhất: {data.min_score}
      </p>

      <Table
        dataSource={data.attempts}
        columns={columns}
        rowKey="attempt_id"
        pagination={{ pageSize: 8 }}
      />
    </div>
  );
}
