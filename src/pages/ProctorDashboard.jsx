import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Alert,
  Spin,
  Empty,
  Modal,
  Form,
  Input,
  Select,
  message,
  Timeline,
  Badge,
} from "antd";
import { 
  UserOutlined, 
  ClockCircleOutlined,
  ExclamationCircleOutlined, 
  EyeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

export default function ProctorDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [assignedSessions, setAssignedSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [violationModalVisible, setViolationModalVisible] = useState(false);
  const [incidentModalVisible, setIncidentModalVisible] = useState(false);
  const [violationForm] = Form.useForm();
  const [incidentForm] = Form.useForm();
  const navigate = useNavigate();

  // Load dashboard data
  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/proctor/dashboard");
      setDashboardData(res.data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      message.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Load assigned sessions
  const loadAssignedSessions = async () => {
    try {
      const res = await axiosClient.get("/proctor/assigned-sessions");
      setAssignedSessions(res.data.sessions);
    } catch (error) {
      console.error("Error loading assigned sessions:", error);
      message.error("Không thể tải danh sách ca thi được phân công");
    }
  };

  // Load session details
  const loadSessionDetails = async (sessionId) => {
    try {
      const res = await axiosClient.get(`/proctor/sessions/${sessionId}/details`);
      setSessionDetails(res.data);
    } catch (error) {
      console.error("Error loading session details:", error);
      message.error("Không thể tải chi tiết ca thi");
    }
  };

  useEffect(() => {
    loadDashboard();
    loadAssignedSessions();
  }, []);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboard();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Handle record violation
  const handleRecordViolation = async (values) => {
    try {
      await axiosClient.post("/proctor/violations", values);
      message.success("Ghi nhận vi phạm thành công");
      setViolationModalVisible(false);
      violationForm.resetFields();
      loadDashboard();
    } catch (error) {
      console.error("Error recording violation:", error);
      message.error("Không thể ghi nhận vi phạm");
    }
  };

  // Handle report incident
  const handleReportIncident = async (values) => {
    try {
      await axiosClient.post("/proctor/incidents", {
        ...values,
        session_id: selectedSession?.id,
      });
      message.success("Báo cáo sự cố thành công");
      setIncidentModalVisible(false);
      incidentForm.resetFields();
    } catch (error) {
      console.error("Error reporting incident:", error);
      message.error("Không thể báo cáo sự cố");
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "in_progress":
        return "processing";
      case "submitted":
        return "success";
      case "disconnected":
        return "warning";
      case "not_started":
        return "default";
      default:
        return "default";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case "in_progress":
        return "Đang thi";
      case "submitted":
        return "Đã nộp bài";
      case "disconnected":
        return "Mất kết nối";
      case "not_started":
        return "Chưa bắt đầu";
      default:
        return status;
    }
  };

  // Get violation severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "green";
      default:
        return "default";
    }
  };

  // Columns for assigned sessions table
  const sessionColumns = [
    {
      title: "Ca thi",
      dataIndex: "exam_title",
      key: "exam_title",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.subject_name}
          </Text>
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "start_at",
      key: "start_at",
      render: (startAt, record) => (
          <div>
          <div>{new Date(startAt).toLocaleString("vi-VN")}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {new Date(record.end_at).toLocaleString("vi-VN")}
          </Text>
            </div>
      ),
    },
    {
      title: "Phòng thi",
      dataIndex: "room",
      key: "room",
      render: (room) => room || "Chưa phân phòng",
    },
    {
      title: "Sinh viên",
      key: "students",
      render: (_, record) => (
        <div>
          <div>Tổng: {record.total_students}</div>
          <div style={{ fontSize: 12 }}>
            <Tag color="processing" size="small">
              Đang thi: {record.taking}
            </Tag>
            <Tag color="success" size="small">
              Đã nộp: {record.submitted}
            </Tag>
            </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        const now = new Date();
        const startAt = new Date(record.start_at);
        const endAt = new Date(record.end_at);

        if (now < startAt) {
          return <Tag color="default">Chưa bắt đầu</Tag>;
        } else if (now > endAt) {
          return <Tag color="success">Đã kết thúc</Tag>;
        } else {
          return <Tag color="processing">Đang diễn ra</Tag>;
        }
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedSession(record);
              loadSessionDetails(record.id);
            }}
          >
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  // Columns for students table
  const studentColumns = [
    {
      title: "Sinh viên",
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
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
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
          <Button
            type="link"
            size="small"
            icon={<ExclamationCircleOutlined />}
            onClick={() => {
              violationForm.setFieldsValue({ attempt_id: record.attempt_id });
              setViolationModalVisible(true);
            }}
          >
            Ghi vi phạm
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Dashboard Giám thị</Title>

      {/* Active Sessions Overview */}
      {dashboardData?.active_sessions?.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {dashboardData.active_sessions.map((session) => (
            <Col xs={24} sm={12} lg={8} key={session.session_id}>
          <Card>
            <Statistic
                  title={session.exam_title}
                  value={session.total_students}
                  suffix="sinh viên"
              prefix={<UserOutlined />}
            />
                <div style={{ marginTop: 16 }}>
                  <Row gutter={8}>
                    <Col span={6}>
            <Statistic
              title="Đang thi"
                        value={session.taking}
                        valueStyle={{ color: "#1890ff", fontSize: 16 }}
            />
        </Col>
                    <Col span={6}>
            <Statistic
              title="Đã nộp"
                        value={session.submitted}
                        valueStyle={{ color: "#52c41a", fontSize: 16 }}
            />
        </Col>
                    <Col span={6}>
            <Statistic
              title="Mất kết nối"
                        value={session.disconnected}
                        valueStyle={{ color: "#faad14", fontSize: 16 }}
            />
        </Col>
                    <Col span={6}>
            <Statistic
              title="Vi phạm"
                        value={session.violations}
                        valueStyle={{ color: "#ff4d4f", fontSize: 16 }}
            />
        </Col>
                  </Row>
                  <div style={{ marginTop: 12 }}>
                    <Text type="secondary">
                      Phòng: {session.room} | Thời gian còn lại: {Math.floor(session.time_remaining / 60)} phút
                    </Text>
                  </div>
                </div>
          </Card>
        </Col>
          ))}
      </Row>
      )}

      {/* Recent Violations */}
      {dashboardData?.recent_violations?.length > 0 && (
        <Card title="Vi phạm gần đây" style={{ marginBottom: 24 }}>
          <Timeline>
            {dashboardData.recent_violations.map((violation) => (
              <Timeline.Item
                key={violation.id}
                color={getSeverityColor(violation.severity)}
                dot={
                  violation.severity === "high" ? (
                    <ExclamationCircleOutlined />
                  ) : violation.severity === "medium" ? (
                    <WarningOutlined />
                  ) : (
                    <CheckCircleOutlined />
                  )
                }
              >
                <div>
                  <div style={{ fontWeight: 500 }}>
                    {violation.student_name} - {violation.room}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {violation.type} - {violation.description}
                  </div>
                  <div style={{ fontSize: 12, color: "#999" }}>
                    {new Date(violation.timestamp).toLocaleString("vi-VN")}
                  </div>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}

      {/* Assigned Sessions */}
      <Card title="Ca thi được phân công">
        <Table
          columns={sessionColumns}
          dataSource={assignedSessions}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có ca thi nào được phân công"
              />
            ),
          }}
        />
      </Card>

      {/* Session Details Modal */}
      <Modal
        title={`Chi tiết ca thi: ${selectedSession?.exam_title}`}
        open={!!selectedSession}
        onCancel={() => {
          setSelectedSession(null);
          setSessionDetails(null);
        }}
        footer={[
          <Button
            key="incident"
            type="primary"
            danger
            icon={<WarningOutlined />}
            onClick={() => setIncidentModalVisible(true)}
          >
            Báo cáo sự cố
          </Button>,
          <Button key="close" onClick={() => setSelectedSession(null)}>
            Đóng
          </Button>,
        ]}
        width={1000}
      >
        {sessionDetails && (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Tổng sinh viên"
                    value={sessionDetails.students.length}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Đang thi"
                    value={sessionDetails.students.filter(s => s.status === "in_progress").length}
                    valueStyle={{ color: "#1890ff" }}
                    prefix={<PlayCircleOutlined />}
            />
          </Card>
        </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Đã nộp bài"
                    value={sessionDetails.students.filter(s => s.status === "submitted").length}
                    valueStyle={{ color: "#52c41a" }}
                    prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

            <Table
              columns={studentColumns}
              dataSource={sessionDetails.students}
              rowKey="student_id"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </div>
        )}
      </Modal>

      {/* Violation Modal */}
      <Modal
        title="Ghi nhận vi phạm"
        open={violationModalVisible}
        onCancel={() => {
          setViolationModalVisible(false);
          violationForm.resetFields();
        }}
        onOk={() => violationForm.submit()}
      >
        <Form
          form={violationForm}
          layout="vertical"
          onFinish={handleRecordViolation}
        >
          <Form.Item
            name="type"
            label="Loại vi phạm"
            rules={[{ required: true, message: "Vui lòng chọn loại vi phạm" }]}
          >
            <Select placeholder="Chọn loại vi phạm">
              <Option value="tab_out">Chuyển tab</Option>
              <Option value="multi_device">Sử dụng nhiều thiết bị</Option>
              <Option value="cheating">Gian lận</Option>
              <Option value="suspicious">Hành vi đáng nghi</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả chi tiết"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={4} placeholder="Mô tả chi tiết vi phạm..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Incident Modal */}
      <Modal
        title="Báo cáo sự cố"
        open={incidentModalVisible}
        onCancel={() => {
          setIncidentModalVisible(false);
          incidentForm.resetFields();
        }}
        onOk={() => incidentForm.submit()}
      >
        <Form
          form={incidentForm}
          layout="vertical"
          onFinish={handleReportIncident}
        >
          <Form.Item
            name="type"
            label="Loại sự cố"
            rules={[{ required: true, message: "Vui lòng chọn loại sự cố" }]}
          >
            <Select placeholder="Chọn loại sự cố">
              <Option value="technical">Sự cố kỹ thuật</Option>
              <Option value="network">Sự cố mạng</Option>
              <Option value="power">Mất điện</Option>
              <Option value="disruption">Gián đoạn</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="severity"
            label="Mức độ nghiêm trọng"
            rules={[{ required: true, message: "Vui lòng chọn mức độ" }]}
          >
            <Select placeholder="Chọn mức độ nghiêm trọng">
              <Option value="low">Thấp</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="high">Cao</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả chi tiết"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={4} placeholder="Mô tả chi tiết sự cố..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}