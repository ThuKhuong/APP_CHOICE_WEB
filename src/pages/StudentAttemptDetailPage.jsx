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
  Tag,
  Space,
  Progress,
  Divider,
  Typography,
  Tooltip
} from "antd";
import { 
  ArrowLeftOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BookOutlined
} from "@ant-design/icons";
import axiosTeacherClient from "../api/axiosTeacherClient";
import { useParams, useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

export default function StudentAttemptDetailPage() {
  const { sessionId, studentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axiosTeacherClient.get(
          `/exam-sessions/${sessionId}/student/${studentId}`
        );
        setData(res.data);
      } catch (error) {
        console.error("Lỗi khi tải bài làm sinh viên:", error);
        console.error("Chi tiết lỗi:", error.response?.data);
        message.error("Không tải được bài làm của sinh viên");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId, studentId]);

  if (loading) return <p style={{ padding: 24 }}>Đang tải dữ liệu...</p>;
  if (!data) return <p style={{ padding: 24 }}>Không có dữ liệu</p>;

  // Xử lý fallback cho các trường hợp null/undefined
  const score = data.score !== null && data.score !== undefined ? data.score : 0;
  const correctAnswers = data.correct_answers !== null && data.correct_answers !== undefined ? data.correct_answers : 0;
  const totalQuestions = data.total_questions !== null && data.total_questions !== undefined ? data.total_questions : 0;
  
  let submittedAt = data.submitted_at;
  let submittedAtStr = "";
  if (submittedAt) {
    const d = new Date(submittedAt);
    submittedAtStr = isNaN(d.getTime()) ? "-" : d.toLocaleString();
  } else {
    submittedAtStr = "-";
  }

  // Tính phần trăm đúng
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100) : 0;
  
  // Tính điểm theo thang 10
  const scoreOutOf10 = (score / 10) * 10;

  const columns = [
    {
      title: "Câu hỏi",
      dataIndex: "question_content",
      key: "question_content",
      width: "40%",
      render: (text, record, index) => (
        <div>
          <Text strong>Câu {index + 1}:</Text>
          <div style={{ marginTop: 4 }}>{text}</div>
        </div>
      ),
    },
    {
      title: "Đáp án đúng",
      width: "25%",
      render: (_, record) => {
        const correctLabels = Array.isArray(record.all_answers)
          ? record.all_answers.filter((a) => a.is_correct).map((a) => a.label)
          : [];
        return (
          <Space direction="vertical" size="small">
            {correctLabels.map((label, idx) => (
              <Tag key={idx} color="green" icon={<CheckCircleOutlined />}>
                {label}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "Sinh viên chọn",
      width: "25%",
      render: (_, record) => {
        const isCorrect = record.is_correct;
        return (
          <Space direction="vertical" size="small">
            {record.chosen_answer_label ? (
              <Tag 
                color={isCorrect ? "green" : "red"} 
                icon={isCorrect ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              >
                {record.chosen_answer_label}
              </Tag>
            ) : (
              <Tag color="default">Không trả lời</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Kết quả",
      width: "10%",
      align: "center",
      render: (_, record) => {
        const isCorrect = record.is_correct;
        return (
          <Tag 
            color={isCorrect ? "green" : "red"}
            icon={isCorrect ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          >
            {isCorrect ? "Đúng" : "Sai"}
          </Tag>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Breadcrumb */}
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

      {/* Nút quay lại */}
      <Button
        type="default"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Quay lại
      </Button>

      <Title level={2}>Bài làm của sinh viên {data.student}</Title>

      {/* Thống kê tổng quan */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Điểm số" 
              value={score} 
              precision={2}
              prefix={<TrophyOutlined />}
              suffix="/ 10"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Câu đúng"
              value={`${correctAnswers}/${totalQuestions}`}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tỷ lệ đúng"
              value={accuracy}
              precision={1}
              suffix="%"
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Ngày nộp" 
              value={submittedAtStr}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress bar cho điểm số */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>Phân tích kết quả</Title>
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Điểm số: {score}/10</Text>
              <Progress 
                percent={scoreOutOf10} 
                strokeColor={score >= 8 ? "#52c41a" : score >= 6.5 ? "#1890ff" : score >= 5 ? "#fa8c16" : "#f5222d"}
                format={() => `${score}/10`}
              />
            </div>
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Tỷ lệ đúng: {accuracy.toFixed(1)}%</Text>
              <Progress 
                percent={accuracy} 
                strokeColor={accuracy >= 80 ? "#52c41a" : accuracy >= 65 ? "#1890ff" : accuracy >= 50 ? "#fa8c16" : "#f5222d"}
                format={() => `${accuracy.toFixed(1)}%`}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Bảng chi tiết câu trả lời */}
      <Card>
        <Title level={4}>Chi tiết câu trả lời</Title>
        <Table
          dataSource={data.answers}
          columns={columns}
          rowKey={(r, index) => index}
          pagination={{ 
            pageSize: 5,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} câu hỏi`
          }}
          loading={loading}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
}
