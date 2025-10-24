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
import axiosTeacherClient from "../api/axiosTeacherClient";
import { useParams, useNavigate } from "react-router-dom";

export default function StudentAttemptDetailPage() {
  const { sessionId, studentId } = useParams();
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosTeacherClient.get(
          `/exam-sessions/${sessionId}/student/${studentId}`
        );
        setData(res.data);
      } catch (error) {
        console.error("Lỗi khi tải bài làm sinh viên:", error);
        console.error("Chi tiết lỗi:", error.response?.data);
        message.error("Không tải được bài làm của sinh viên");
      }
    };
    load();
  }, [sessionId, studentId]);
  if (!data) return <p style={{ padding: 24 }}>Đang tải dữ liệu...</p>;

  // Xử lý fallback cho các trường hợp null/undefined
  const score =
    data.score !== null && data.score !== undefined ? data.score : 0;
  const correctAnswers =
    data.correct_answers !== null && data.correct_answers !== undefined
      ? data.correct_answers
      : 0;
  const totalQuestions =
    data.total_questions !== null && data.total_questions !== undefined
      ? data.total_questions
      : 0;
  let submittedAt = data.submitted_at;
  let submittedAtStr = "";
  if (submittedAt) {
    const d = new Date(submittedAt);
    submittedAtStr = isNaN(d.getTime()) ? "-" : d.toLocaleString();
  } else {
    submittedAtStr = "-";
  }

  const columns = [
    {
      title: "Câu hỏi",
      dataIndex: "question_content",
      key: "question_content",
    },
    {
      title: "Đáp án đúng",
      render: (_, record) => {
        // Lấy tất cả đáp án đúng (is_correct=true) và nối bằng dấu phẩy
        const correctLabels = Array.isArray(record.all_answers)
          ? record.all_answers.filter((a) => a.is_correct).map((a) => a.label)
          : [];
        return (
          <b style={{ color: "green" }}>
            {correctLabels.length > 0 ? correctLabels.join(", ") : "N/A"}
          </b>
        );
      },
    },
    {
      title: "Sinh viên chọn",
      render: (_, record) => {
        const isCorrect = record.is_correct;
        return (
          <span style={{ color: isCorrect ? "green" : "red" }}>
            {record.chosen_answer_label || "-"}
          </span>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/*  Breadcrumb */}
      <Breadcrumb
        items={[
          { title: <a onClick={() => navigate("/results")}>Kết quả thi</a> },
          {
            title: (
              <a onClick={() => navigate(`/results/${sessionId}`)}>
                Ca thi #{sessionId}
              </a>
            ),
          },
          { title: `Sinh viên: ${data.student}` },
        ]}
        style={{ marginBottom: 12 }}
      />

      {/*  Nút quay lại */}
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
            <Statistic title="Điểm" value={score} precision={1} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Câu đúng"
              value={`${correctAnswers}/${totalQuestions}`}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Ngày nộp" value={submittedAtStr} />
          </Card>
        </Col>
      </Row>

      <Table
        dataSource={data.answers}
        columns={columns}
        rowKey={(r, index) => index}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
