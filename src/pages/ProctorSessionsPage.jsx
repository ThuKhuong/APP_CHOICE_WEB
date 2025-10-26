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
} from "antd";
import {
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  MonitorOutlined,
} from "@ant-design/icons";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function ProctorSessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Load assigned sessions
  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/proctor/assigned-sessions");
      setSessions(res.data.sessions || []);
    } catch (error) {
      console.error("Error loading sessions:", error);
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        // Redirect to login
        window.location.href = "/login";
      } else if (error.response?.status === 403) {
        message.error("Bạn không có quyền truy cập trang này");
      } else {
        message.error("Không thể tải danh sách ca thi");
      }
      setSessions([]);
    } finally {
      setLoading(false);
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

  // Handle view session details
  const handleViewDetails = async (record) => {
    setSelectedSession(record);
    setDetailsModalVisible(true);
    await loadSessionDetails(record.id);
  };

  // Handle monitor session
  const handleMonitorSession = (record) => {
    navigate(`/proctor/sessions/${record.id}/monitor`);
  };

  useEffect(() => {
    loadSessions();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(loadSessions, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Columns for sessions table
  const columns = [
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
      title: "Giáo viên",
      key: "teacher",
      render: (_, record) => (
        <div>
          <div>{record.teacher_name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
          </Text>
        </div>
      ),
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
            onClick={() => handleViewDetails(record)}
          >
            Xem
          </Button>
          <Button
            type="default"
            size="small"
            icon={<MonitorOutlined />}
            onClick={() => handleMonitorSession(record)}
          >
            Giám sát
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải danh sách ca thi...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Ca thi được phân công</Title>
        </div>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={loadSessions}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>
      
      <Card>
        <Table
          columns={columns}
          dataSource={sessions}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} ca thi`,
          }}
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
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false);
          setSelectedSession(null);
          setSessionDetails(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={1000}
      >
        {sessionDetails && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="ID ca thi" span={1}>
                {sessionDetails.session?.id}
              </Descriptions.Item>
              <Descriptions.Item label="Mã truy cập" span={1}>
                <Tag color="blue">{sessionDetails.session?.access_code}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Đề thi" span={2}>
                {sessionDetails.session?.exam_title}
              </Descriptions.Item>
              <Descriptions.Item label="Môn học" span={2}>
                {sessionDetails.session?.subject_name}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian bắt đầu" span={1}>
                {new Date(sessionDetails.session?.start_at).toLocaleString("vi-VN")}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian kết thúc" span={1}>
                {new Date(sessionDetails.session?.end_at).toLocaleString("vi-VN")}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian làm bài" span={1}>
                {Math.round((new Date(sessionDetails.session?.end_at) - new Date(sessionDetails.session?.start_at)) / 60000)} phút
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                {(() => {
                  const now = new Date();
                  const startAt = new Date(sessionDetails.session?.start_at);
                  const endAt = new Date(sessionDetails.session?.end_at);

                  if (now < startAt) {
                    return <Tag color="default">Chưa bắt đầu</Tag>;
                  } else if (now > endAt) {
                    return <Tag color="success">Đã kết thúc</Tag>;
                  } else {
                    return <Tag color="processing">Đang diễn ra</Tag>;
                  }
                })()}
              </Descriptions.Item>
            </Descriptions>

            <Card title="Danh sách sinh viên" size="small">
              <Table
                dataSource={sessionDetails.students || []}
                columns={[
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
                    render: (status) => {
                      const statusConfig = {
                        "in_progress": { color: "processing", text: "Đang thi" },
                        "submitted": { color: "success", text: "Đã nộp bài" },
                        "disconnected": { color: "warning", text: "Mất kết nối" },
                        "not_started": { color: "default", text: "Chưa bắt đầu" },
                      };
                      const config = statusConfig[status] || { color: "default", text: status };
                      return <Tag color={config.color}>{config.text}</Tag>;
                    },
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
                ]}
                rowKey="student_id"
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}
