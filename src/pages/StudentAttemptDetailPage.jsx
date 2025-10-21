import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Statistic,
  Button,
  Breadcrumb,
  message,
  Row,
  Col,
} from "antd";
import axiosClient from "../api/axiosClient";
import { useParams, useNavigate } from "react-router-dom";

export default function StudentAttemptDetailPage() {
  const { sessionId, studentId } = useParams();
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosClient.get(
          `/exam-sessions/${sessionId}/student/${studentId}`
        );
        setData(res.data);
      } catch {
        message.error("Không tải được bài làm của sinh viên");
      }
    };
    load();
  }, [sessionId, studentId]);

  if (!data) return <p style={{ padding: 24 }}>Đang tải dữ liệu...</p>;

  const columns = [
    { title: "Câu hỏi", dataIndex: "text" },
    {
      title: "Đáp án đúng",
      dataIndex: "correct_choice",
      render: (v) => <b style={{ color: "green" }}>{v}</b>,
    },
    {
      title: "Sinh viên chọn",
      dataIndex: "chosen_choice",
      render: (v, r) => (
        <span style={{ color: v === r.correct_choice ? "green" : "red" }}>
          {v || "-"}
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 🧭 Breadcrumb */}
      <Breadcrumb
        items={[
          { title: <a onClick={() => navigate("/results")}>Kết quả thi</a> },
          { title: <a onClick={() => navigate(`/results/${sessionId}`)}>Ca thi #{sessionId}</a> },
          { title: `Sinh viên: ${data.student}` },
        ]}
        style={{ marginBottom: 12 }}
      />

      {/* 🔙 Nút quay lại */}
      <Button
        type="default"
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        ← Quay lại
      </Button>

      <h2>Bài làm của sinh viên {data.student}</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Điểm" value={data.score} precision={1} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Câu đúng"
              value={`${data.correct_answers}/${data.total_questions}`}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Ngày nộp"
              value={new Date(data.submitted_at).toLocaleString()}
            />
          </Card>
        </Col>
      </Row>

      <Table
        dataSource={data.answers}
        columns={columns}
        rowKey={(r) => r.text}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
