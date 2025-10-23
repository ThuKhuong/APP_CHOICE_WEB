import React, { useEffect, useState } from "react";
import { Card, Row, Col, Table, Badge, Progress, Statistic, Alert } from "antd";
import { 
  UserOutlined, 
  ExclamationCircleOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined 
} from "@ant-design/icons";
import dayjs from "dayjs";
import axiosProctorClient from "../api/axiosProctorClient";

export default function ProctorDashboard() {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    loadDashboardData();
    
    // Cập nhật dữ liệu mỗi 30 giây
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Gọi API thực tế
      const response = await axiosProctorClient.get("/dashboard");
      setDashboardData(response.data);
    } catch (error) {
      console.error("Lỗi tải dashboard:", error);
      // Fallback to mock data nếu API lỗi
      const mockData = {
      activeSessions: [
        {
          session_id: 1,
          exam_title: "Kiểm tra giữa kỳ - Java",
          room: "A101",
          total_students: 45,
          taking: 30,
          submitted: 12,
          disconnected: 2,
          absent: 1,
          violations: 8,
          start_time: "08:00",
          end_time: "10:00",
          time_remaining: 3600
        },
        {
          session_id: 2,
          exam_title: "Thi cuối kỳ - Database",
          room: "B203", 
          total_students: 38,
          taking: 35,
          submitted: 2,
          disconnected: 1,
          absent: 0,
          violations: 3,
          start_time: "14:00",
          end_time: "16:00",
          time_remaining: 5400
        }
      ],
      recentViolations: [
        {
          id: 1,
          student_name: "Nguyễn Văn A",
          room: "A101",
          type: "tab_out",
          description: "Rời tab thi 3 lần liên tiếp",
          timestamp: "2025-10-16T09:30:00Z",
          severity: "high"
        },
        {
          id: 2,
          student_name: "Trần Thị B", 
          room: "B203",
          type: "multi_device",
          description: "Phát hiện đăng nhập từ 2 thiết bị",
          timestamp: "2025-10-16T09:25:00Z",
          severity: "high"
        },
        {
          id: 3,
          student_name: "Lê Văn C",
          room: "A101", 
          type: "timeout",
          description: "Mất kết nối trong 2 phút",
          timestamp: "2025-10-16T09:20:00Z",
          severity: "medium"
        }
      ],
      pendingIncidents: [
        {
          id: 1,
          student_name: "Nguyễn Văn D",
          room: "A101",
          description: "Máy tính bị treo, yêu cầu khởi động lại",
          timestamp: "2025-10-16T09:15:00Z"
        },
        {
          id: 2,
          student_name: "Phạm Thị E",
          room: "B203",
          description: "Không thể tải được câu hỏi",
          timestamp: "2025-10-16T09:10:00Z"
        }
      ],
      statistics: {
        totalStudents: 83,
        totalTaking: 65,
        totalSubmitted: 14,
        totalDisconnected: 3,
        totalViolations: 11,
        totalIncidents: 2
      }
      };

      setDashboardData(mockData);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      taking: "#1890ff",
      submitted: "#52c41a", 
      disconnected: "#ff4d4f",
      absent: "#d9d9d9"
    };
    return colors[status] || "#d9d9d9";
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: "#52c41a",
      medium: "#faad14",
      high: "#ff4d4f"
    };
    return colors[severity] || "#d9d9d9";
  };

  const formatTimeRemaining = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const sessionColumns = [
    { title: "Phòng", dataIndex: "room", width: 80 },
    { title: "Đề thi", dataIndex: "exam_title" },
    { 
      title: "Thời gian", 
      render: (record) => `${record.start_time} - ${record.end_time}`,
      width: 120
    },
    {
      title: "Tiến độ",
      render: (record) => {
        const completedPercent = ((record.submitted + record.disconnected + record.absent) / record.total_students) * 100;
        return (
          <div>
            <Progress 
              percent={completedPercent} 
              size="small" 
              status={completedPercent > 80 ? "success" : "active"}
            />
            <div style={{ fontSize: "12px", color: "#666" }}>
              {record.submitted + record.disconnected + record.absent}/{record.total_students} hoàn thành
            </div>
          </div>
        );
      },
      width: 150
    },
    {
      title: "Trạng thái SV",
      render: (record) => (
        <div style={{ fontSize: "12px" }}>
          <div style={{ color: getStatusColor("taking") }}>
            <UserOutlined /> {record.taking} đang thi
          </div>
          <div style={{ color: getStatusColor("submitted") }}>
            <CheckCircleOutlined /> {record.submitted} đã nộp
          </div>
          {record.disconnected > 0 && (
            <div style={{ color: getStatusColor("disconnected") }}>
              <ExclamationCircleOutlined /> {record.disconnected} mất kết nối
            </div>
          )}
        </div>
      ),
      width: 120
    },
    {
      title: "Vi phạm",
      dataIndex: "violations",
      render: (violations) => (
        <Badge 
          count={violations} 
          style={{ backgroundColor: violations > 5 ? "#ff4d4f" : "#faad14" }}
        />
      ),
      width: 80
    },
    {
      title: "Còn lại",
      dataIndex: "time_remaining",
      render: (seconds) => (
        <div style={{ 
          color: seconds < 1800 ? "#ff4d4f" : "#666",
          fontWeight: seconds < 1800 ? "bold" : "normal"
        }}>
          <ClockCircleOutlined /> {formatTimeRemaining(seconds)}
        </div>
      ),
      width: 100
    }
  ];

  const violationColumns = [
    {
      title: "Thời gian",
      dataIndex: "timestamp",
      render: (time) => dayjs(time).format("HH:mm"),
      width: 80
    },
    { title: "Sinh viên", dataIndex: "student_name", width: 120 },
    { title: "Phòng", dataIndex: "room", width: 80 },
    {
      title: "Loại",
      dataIndex: "type",
      render: (type) => {
        const typeLabels = {
          tab_out: "Rời tab",
          multi_device: "Nhiều thiết bị", 
          timeout: "Mất kết nối",
          suspicious: "Đáng nghi"
        };
        return typeLabels[type] || type;
      },
      width: 100
    },
    {
      title: "Mức độ",
      dataIndex: "severity", 
      render: (severity) => (
        <Badge 
          color={getSeverityColor(severity)}
          text={severity === "low" ? "Thấp" : severity === "medium" ? "TB" : "Cao"}
        />
      ),
      width: 80
    },
    { title: "Mô tả", dataIndex: "description" }
  ];

  const incidentColumns = [
    {
      title: "Thời gian",
      dataIndex: "timestamp", 
      render: (time) => dayjs(time).format("HH:mm"),
      width: 80
    },
    { title: "Sinh viên", dataIndex: "student_name", width: 120 },
    { title: "Phòng", dataIndex: "room", width: 80 },
    { title: "Mô tả", dataIndex: "description" }
  ];

  if (!dashboardData) {
    return <div style={{ padding: 24 }}>Đang tải dashboard...</div>;
  }

  const { activeSessions, recentViolations, pendingIncidents, statistics } = dashboardData;

  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard Giám sát Thi</h2>
      
      {/* Thống kê tổng quan */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Tổng SV"
              value={statistics.totalStudents}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Đang thi"
              value={statistics.totalTaking}
              valueStyle={{ color: "#1890ff" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Đã nộp"
              value={statistics.totalSubmitted}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Mất kết nối"
              value={statistics.totalDisconnected}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Vi phạm"
              value={statistics.totalViolations}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Sự cố"
              value={statistics.totalIncidents}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Cảnh báo */}
      {(statistics.totalViolations > 10 || statistics.totalIncidents > 5) && (
        <Alert
          message="Cảnh báo"
          description={`Phát hiện ${statistics.totalViolations} vi phạm và ${statistics.totalIncidents} sự cố. Vui lòng kiểm tra ngay!`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Ca thi đang diễn ra */}
      <Card title="Ca thi đang diễn ra" style={{ marginBottom: 16 }}>
        <Table
          dataSource={activeSessions}
          columns={sessionColumns}
          rowKey="session_id"
          pagination={false}
          size="small"
        />
      </Card>

      <Row gutter={16}>
        {/* Vi phạm gần đây */}
        <Col span={12}>
          <Card title="Vi phạm gần đây" extra={<Badge count={recentViolations.length} />}>
            <Table
              dataSource={recentViolations}
              columns={violationColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Sự cố chưa xử lý */}
        <Col span={12}>
          <Card title="Sự cố chưa xử lý" extra={<Badge count={pendingIncidents.length} />}>
            <Table
              dataSource={pendingIncidents}
              columns={incidentColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}