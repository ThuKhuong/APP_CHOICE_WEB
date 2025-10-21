import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Timeline,
  Button,
  Statistic,
  Badge,
  Modal,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

export default function StudentMonitorPage({ studentId, sessionId, onBack }) {
  const [studentInfo, setStudentInfo] = useState(null);
  const [activities, setActivities] = useState([]);
  const [violations, setViolations] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (studentId && sessionId) {
      loadStudentDetails();
    }
  }, [studentId, sessionId]);

  const loadStudentDetails = () => {
    // Mock data cho thông tin chi tiết sinh viên
    const mockStudentInfo = {
      student_id: studentId,
      student_name: "Nguyễn Văn A",
      student_code: "SV001",
      status: "taking",
      start_time: "2025-10-16T08:05:00Z",
      current_question: 15,
      total_questions: 30,
      time_remaining: 1800, // seconds
      tab_switches: 3,
      browser_focus_lost: 5,
      ip_address: "192.168.1.100",
      user_agent: "Chrome 118.0.5993.117",
    };

    // Mock activities (hoạt động của sinh viên)
    const mockActivities = [
      {
        id: 1,
        type: "login",
        description: "Đăng nhập vào hệ thống",
        timestamp: "2025-10-16T08:05:00Z",
      },
      {
        id: 2,
        type: "start_exam",
        description: "Bắt đầu làm bài",
        timestamp: "2025-10-16T08:05:30Z",
      },
      {
        id: 3,
        type: "answer",
        description: "Trả lời câu hỏi số 1",
        timestamp: "2025-10-16T08:07:15Z",
      },
      {
        id: 4,
        type: "tab_switch",
        description: "Chuyển sang tab khác (Vi phạm)",
        timestamp: "2025-10-16T08:15:22Z",
        isViolation: true,
      },
      {
        id: 5,
        type: "answer",
        description: "Trả lời câu hỏi số 5",
        timestamp: "2025-10-16T08:25:10Z",
      },
    ];

    // Mock violations
    const mockViolations = [
      {
        id: 1,
        type: "tab_out",
        description: "Rời khỏi tab thi trong 5 giây",
        timestamp: "2025-10-16T08:15:22Z",
        severity: "medium",
      },
      {
        id: 2,
        type: "tab_out",
        description: "Rời khỏi tab thi trong 10 giây",
        timestamp: "2025-10-16T08:32:45Z",
        severity: "high",
      },
    ];

    setStudentInfo(mockStudentInfo);
    setActivities(mockActivities);
    setViolations(mockViolations);
  };

  const handleForceSubmit = () => {
    setConfirmModalOpen(true);
  };

  const confirmForceSubmit = () => {
    // Thực hiện force submit
    message.success("Đã buộc sinh viên nộp bài");
    setConfirmModalOpen(false);
    if (onBack) onBack();
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getViolationSeverityColor = (severity) => {
    const colors = {
      low: "#52c41a",
      medium: "#faad14",
      high: "#ff4d4f",
    };
    return colors[severity] || "#d9d9d9";
  };

  const activitiesColumns = [
    {
      title: "Thời gian",
      dataIndex: "timestamp",
      render: (time) => dayjs(time).format("HH:mm:ss"),
      width: 100,
    },
    {
      title: "Loại",
      dataIndex: "type",
      render: (type, record) => {
        const typeLabels = {
          login: "Đăng nhập",
          start_exam: "Bắt đầu",
          answer: "Trả lời",
          tab_switch: "Chuyển tab",
          submit: "Nộp bài",
        };
        return (
          <span style={{ color: record.isViolation ? "#ff4d4f" : undefined }}>
            {typeLabels[type] || type}
          </span>
        );
      },
      width: 100,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
    },
  ];

  const violationsColumns = [
    {
      title: "Thời gian",
      dataIndex: "timestamp",
      render: (time) => dayjs(time).format("HH:mm:ss"),
      width: 100,
    },
    {
      title: "Loại",
      dataIndex: "type",
      render: (type) => {
        const typeLabels = {
          tab_out: "Rời tab",
          multi_device: "Nhiều thiết bị",
          copy_paste: "Copy/Paste",
          suspicious: "Đáng nghi",
        };
        return typeLabels[type] || type;
      },
      width: 120,
    },
    {
      title: "Mức độ",
      dataIndex: "severity",
      render: (severity) => (
        <Badge
          color={getViolationSeverityColor(severity)}
          text={
            severity === "low"
              ? "Thấp"
              : severity === "medium"
              ? "Trung bình"
              : "Cao"
          }
        />
      ),
      width: 100,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
    },
  ];

  if (!studentInfo) {
    return <div style={{ padding: 24 }}>Đang tải thông tin sinh viên...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{ marginRight: 16 }}
        >
          Trở về
        </Button>
        <Button
          type="primary"
          danger
          icon={<ExclamationCircleOutlined />}
          onClick={handleForceSubmit}
        >
          Buộc nộp bài
        </Button>
      </div>

      {/* Thông tin tổng quan */}
      <Card
        title={`Chi tiết: ${studentInfo.student_name} (${studentInfo.student_code})`}
        style={{ marginBottom: 16 }}
      >
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Statistic
            title="Trạng thái"
            value={studentInfo.status === "taking" ? "Đang thi" : "Đã nộp"}
            valueStyle={{
              color: studentInfo.status === "taking" ? "#1890ff" : "#52c41a",
            }}
          />
          <Statistic
            title="Câu hỏi hiện tại"
            value={`${studentInfo.current_question}/${studentInfo.total_questions}`}
          />
          <Statistic
            title="Thời gian còn lại"
            value={formatTime(studentInfo.time_remaining)}
            valueStyle={{
              color: studentInfo.time_remaining < 600 ? "#ff4d4f" : undefined,
            }}
          />
          <Statistic
            title="Lần chuyển tab"
            value={studentInfo.tab_switches}
            valueStyle={{
              color: studentInfo.tab_switches > 2 ? "#ff4d4f" : undefined,
            }}
          />
          <Statistic
            title="Mất focus"
            value={studentInfo.browser_focus_lost}
            valueStyle={{
              color: studentInfo.browser_focus_lost > 3 ? "#faad14" : undefined,
            }}
          />
        </div>

        <div style={{ marginTop: 16, fontSize: "12px", color: "#666" }}>
          <div>
            <strong>IP:</strong> {studentInfo.ip_address}
          </div>
          <div>
            <strong>Trình duyệt:</strong> {studentInfo.user_agent}
          </div>
        </div>
      </Card>

      {/* Hoạt động và Vi phạm */}
      <div style={{ display: "flex", gap: 16 }}>
        <Card title="Lịch sử hoạt động" style={{ flex: 1 }}>
          <Table
            dataSource={activities}
            columns={activitiesColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Card>

        <Card title={`Vi phạm (${violations.length})`} style={{ flex: 1 }}>
          <Table
            dataSource={violations}
            columns={violationsColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Card>
      </div>

      {/* Modal xác nhận buộc nộp bài */}
      <Modal
        title="Xác nhận buộc nộp bài"
        open={confirmModalOpen}
        onOk={confirmForceSubmit}
        onCancel={() => setConfirmModalOpen(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>
          Bạn có chắc chắn muốn buộc sinh viên{" "}
          <strong>{studentInfo.student_name}</strong> nộp bài?
        </p>
        <p style={{ color: "#666", fontSize: "14px" }}>
          Hành động này sẽ kết thúc bài thi của sinh viên và không thể hoàn tác.
        </p>
      </Modal>
    </div>
  );
}
