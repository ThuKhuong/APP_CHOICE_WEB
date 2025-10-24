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
} from "antd";
import {
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axiosClient from "../api/axiosClient";

const { Title, Text } = Typography;

export default function ProctorSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load assigned sessions
  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/proctor/assigned-sessions");
      setSessions(res.data.sessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
      message.error("Không thể tải danh sách ca thi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
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
      title: "Phòng thi",
      dataIndex: "room",
      key: "room",
      render: (room) => room || "Chưa phân phòng",
    },
    {
      title: "Giáo viên",
      key: "teacher",
      render: (_, record) => (
        <div>
          <div>{record.teacher_name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.teacher_email}
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
            onClick={() => {
              // Navigate to session details
              window.location.href = `/proctor/sessions/${record.id}`;
            }}
          >
            Xem chi tiết
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
      <Title level={2}>Ca thi được phân công</Title>
      
      <Card>
        <Table
          columns={columns}
          dataSource={sessions}
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
    </div>
  );
}
