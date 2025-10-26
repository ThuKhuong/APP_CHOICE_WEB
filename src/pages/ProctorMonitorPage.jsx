import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Empty,
  Spin,
  message,
  Modal,
  Descriptions,
  Badge,
  Row,
  Col,
  Statistic,
  Popconfirm,
  Input,
} from "antd";
import {
  EyeOutlined,
  LockOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import axiosClient from "../api/axiosClient";
import { useParams } from "react-router-dom";

const { Title, Text } = Typography;

export default function ProctorMonitorPage() {
  const { sessionId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lockModalVisible, setLockModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [lockReason, setLockReason] = useState("");

  // Load session data
  const loadSessionData = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/proctor/sessions/${sessionId}/students`);
      setSessionData(res.data);
    } catch (error) {
      console.error("Error loading session data:", error);
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
      } else if (error.response?.status === 403) {
        message.error("Bạn không có quyền truy cập ca thi này");
      } else {
        message.error("Không thể tải dữ liệu ca thi");
      }
    } finally {
      setLoading(false);
    }
  };

  // Lock student attempt
  const handleLockAttempt = async () => {
    try {
      await axiosClient.put(`/proctor/attempts/${selectedStudent.attempt_id}/lock`, {
        reason: lockReason
      });
      message.success("Khóa bài thi thành công!");
      setLockModalVisible(false);
      setSelectedStudent(null);
      setLockReason("");
      loadSessionData();
    } catch (error) {
      console.error("Error locking attempt:", error);
      message.error("Không thể khóa bài thi");
    }
  };

  useEffect(() => {
    loadSessionData();
    
    // Auto refresh every 10 seconds
    const interval = setInterval(loadSessionData, 10000);
    
    return () => clearInterval(interval);
  }, [sessionId]);

  // Columns for students table
  const studentColumns = [
    {
      title: "Thí sinh",
      key: "student",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.full_name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.email}
          </Text>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Tag color={record.status_color}>
          {record.status_text}
        </Tag>
      ),
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "started_at",
      key: "started_at",
      render: (startedAt) =>
        startedAt ? new Date(startedAt).toLocaleString("vi-VN") : "-",
    },
    {
      title: "Thời gian nộp bài",
      dataIndex: "submitted_at",
      key: "submitted_at",
      render: (submittedAt) =>
        submittedAt ? new Date(submittedAt).toLocaleString("vi-VN") : "-",
    },
    {
      title: "Điểm",
      dataIndex: "score",
      key: "score",
      render: (score) => (score !== null ? score : "-"),
    },
    {
      title: "Vi phạm",
      dataIndex: "violation_count",
      key: "violation_count",
      render: (count) => (
        <Badge 
          count={count}
          style={{ backgroundColor: count > 0 ? "#ff4d4f" : "#52c41a" }}
        />
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          {record.status === 'in_progress' && (
            <Popconfirm
              title="Xác nhận khóa bài thi?"
              description="Hành động này sẽ khóa bài thi của thí sinh và không thể hoàn tác!"
              onConfirm={() => {
                setSelectedStudent(record);
                setLockModalVisible(true);
              }}
              okText="Khóa"
              cancelText="Hủy"
            >
              <Button 
                type="primary" 
                danger 
                size="small"
                icon={<LockOutlined />}
              >
                Khóa bài
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải dữ liệu ca thi...</div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Empty description="Không thể tải dữ liệu ca thi" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Giám sát ca thi</Title>
          <Text type="secondary">{sessionData.session?.exam_title}</Text>
        </div>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={loadSessionData}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      {/* Session Info */}
      <Card style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Mã truy cập" span={1}>
            <Tag color="blue">{sessionData.session?.access_code}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Môn học" span={1}>
            {sessionData.session?.subject_name}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian bắt đầu" span={1}>
            {new Date(sessionData.session?.start_at).toLocaleString("vi-VN")}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian kết thúc" span={1}>
            {new Date(sessionData.session?.end_at).toLocaleString("vi-VN")}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng thí sinh"
              value={sessionData.total_students}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đang thi"
              value={sessionData.in_progress}
              valueStyle={{ color: "#1890ff" }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đã nộp bài"
              value={sessionData.submitted}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Bị khóa"
              value={sessionData.locked}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<LockOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Students Table */}
      <Card title="Danh sách thí sinh">
        <Table
          columns={studentColumns}
          dataSource={sessionData.students}
          rowKey="student_id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thí sinh`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có thí sinh nào tham gia"
              />
            ),
          }}
        />
      </Card>

      {/* Lock Attempt Modal */}
      <Modal
        title="Khóa bài thi"
        open={lockModalVisible}
        onOk={handleLockAttempt}
        onCancel={() => {
          setLockModalVisible(false);
          setSelectedStudent(null);
          setLockReason("");
        }}
        okText="Khóa bài thi"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        {selectedStudent && (
          <div>
            <p><strong>Thí sinh:</strong> {selectedStudent.full_name}</p>
            <p><strong>Email:</strong> {selectedStudent.email}</p>
            <br />
            <Input.TextArea
              placeholder="Nhập lý do khóa bài thi..."
              value={lockReason}
              onChange={(e) => setLockReason(e.target.value)}
              rows={4}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}




