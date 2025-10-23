import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  InputNumber,
  message,
  Table,
  Space,
  Typography,
  Modal,
  Tag,
  Divider,
  Row,
  Col,
  Statistic,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ReloadOutlined, 
  EyeOutlined, 
  PlusOutlined,
  ArrowLeftOutlined 
} from "@ant-design/icons";
import axiosClient from "../api/axiosClient";

const { Title, Text } = Typography;

export default function ShuffleExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [examSets, setExamSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [selectedExamSet, setSelectedExamSet] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [examSetQuestions, setExamSetQuestions] = useState([]);
  const [examSetCount, setExamSetCount] = useState(5);

  // Load thông tin đề thi
  const loadExam = async () => {
    try {
      const res = await axiosClient.get(`/exams/${examId}`);
      setExam(res.data);
    } catch (error) {
      console.error("Error loading exam:", error);
      message.error("Không thể tải thông tin đề thi");
    }
  };

  // Load danh sách bộ đề
  const loadExamSets = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/exams/${examId}/sets`);
      setExamSets(res.data);
    } catch (error) {
      console.error("Error loading exam sets:", error);
      message.error("Không thể tải danh sách bộ đề");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExam();
    loadExamSets();
  }, [examId]);

  // Tạo bộ đề mới
  const handleCreateExamSets = async (count) => {
    setShuffling(true);
    try {
      await axiosClient.post(`/exams/${examId}/shuffle`, { count });
      message.success(`Đã tạo ${count} bộ đề thi thành công!`);
      loadExamSets();
    } catch (error) {
      console.error("Error creating exam sets:", error);
      message.error("Không thể tạo bộ đề thi");
    } finally {
      setShuffling(false);
    }
  };

  // Xem chi tiết bộ đề
  const handleViewExamSet = async (examSetId) => {
    try {
      const res = await axiosClient.get(`/exam-sets/${examSetId}/questions`);
      setExamSetQuestions(res.data);
      setSelectedExamSet(examSets.find(set => set.id === examSetId));
      setDetailModalVisible(true);
    } catch (error) {
      console.error("Error loading exam set details:", error);
      message.error("Không thể tải chi tiết bộ đề");
    }
  };

  // Cấu hình cột bảng
  const columns = [
    {
      title: "Mã bộ đề",
      dataIndex: "code",
      width: 100,
      render: (code) => <Tag color="blue">Bộ {code}</Tag>,
    },
    {
      title: "Số câu hỏi",
      dataIndex: "question_count",
      width: 120,
      render: (count) => (
        <Text strong>{count} câu</Text>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      width: 150,
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: "Thao tác",
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewExamSet(record.id)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // Cấu hình cột chi tiết câu hỏi
  const questionColumns = [
    {
      title: "STT",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nội dung câu hỏi",
      dataIndex: "content",
      ellipsis: {
        showTitle: false,
      },
      render: (content) => (
        <div 
          style={{ 
            maxWidth: 300,
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.4'
          }}
          title={content}
        >
          {content}
        </div>
      ),
    },
    {
      title: "Chương",
      dataIndex: "chapter_name",
      width: 150,
    },
    {
      title: "Đáp án",
      dataIndex: "answers",
      width: 250,
      render: (answers) => (
        <div style={{ maxWidth: 250 }}>
          {answers?.map((answer, index) => (
            <div key={index} style={{ marginBottom: 4 }}>
              <Tag 
                color={answer.is_correct ? "green" : "default"}
                style={{ 
                  marginBottom: 2,
                  maxWidth: '100%',
                  wordWrap: 'break-word',
                  whiteSpace: 'normal',
                  height: 'auto',
                  lineHeight: '1.3'
                }}
              >
                <span style={{ fontWeight: 'bold' }}>{answer.label}.</span> {answer.content}
              </Tag>
            </div>
          ))}
        </div>
      ),
    },
  ];

  if (!exam) {
    return <div>Đang tải...</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate("/exams")}
          style={{ marginBottom: 16 }}
        >
          Quay lại
        </Button>
        
        <Title level={2}>Trộn đề thi: {exam.title}</Title>
        <Text type="secondary">Môn học: {exam.subject_name}</Text>
      </div>

      {/* Thống kê */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng bộ đề"
              value={examSets.length}
              prefix={<ReloadOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Thời gian thi"
              value={exam.duration}
              suffix="phút"
            />
          </Card>
        </Col>
      </Row>

      {/* Tạo bộ đề mới */}
      <Card title="Tạo bộ đề mới" style={{ marginBottom: 24 }}>
        <Space>
          <Text>Số lượng bộ đề cần tạo:</Text>
          <InputNumber
            min={1}
            max={20}
            value={examSetCount}
            onChange={setExamSetCount}
            style={{ width: 100 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={shuffling}
            onClick={() => {
              if (examSetCount && examSetCount > 0) {
                handleCreateExamSets(examSetCount);
              } else {
                message.error("Vui lòng nhập số lượng bộ đề");
              }
            }}
          >
            Tạo bộ đề
          </Button>
        </Space>
      </Card>

      {/* Danh sách bộ đề */}
      <Card title="Danh sách bộ đề">
        <Table
          dataSource={examSets}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal chi tiết bộ đề */}
      <Modal
        title={`Chi tiết bộ đề ${selectedExamSet?.code}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={1200}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Bộ đề: {selectedExamSet?.code}</Text>
          <Divider type="vertical" />
          <Text>Số câu hỏi: {examSetQuestions.length}</Text>
        </div>
        
        <Table
          dataSource={examSetQuestions}
          columns={questionColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Modal>
    </div>
  );
}