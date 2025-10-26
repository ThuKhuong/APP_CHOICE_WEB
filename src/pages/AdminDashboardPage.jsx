import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Table, Button, Space, message, Empty } from "antd";
import { DashboardOutlined, UserOutlined, BookOutlined, CheckCircleOutlined, TeamOutlined } from "@ant-design/icons";
import axiosAdminClient from "../api/axiosAdminClient";


export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [exams, setExams] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, examsRes] = await Promise.all([
        axiosAdminClient.get("/dashboard"),
        axiosAdminClient.get("/exams")
      ]);
      
      console.log("Dashboard Stats:", statsRes.data);
      console.log("Exams Data:", examsRes.data);
      
      setStats(statsRes.data || {});
      
      // Handle exams data format
      let examsData = examsRes.data;
      if (Array.isArray(examsData)) {
        setExams(examsData);
      } else if (examsData && Array.isArray(examsData.exams)) {
        setExams(examsData.exams);
      } else {
        setExams([]);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu dashboard:", error);
      console.error("Error details:", error.response?.data);
      message.error(`Không thể tải dữ liệu dashboard: ${error.message}`);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const examColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Môn học",
      dataIndex: "subject_name",
      key: "subject_name",
      render: (name) => name || "Chưa có",
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      render: (duration) => duration ? `${duration} phút` : "N/A",
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <h2>
          <DashboardOutlined /> Dashboard Quản Trị
        </h2>
        <p>Thống kê tổng quan hệ thống thi trắc nghiệm</p>
      </div>

      {/* Refresh Button */}
      <Card style={{ marginBottom: 24 }}>
        <Space>
          <Button type="primary" onClick={handleRefresh} loading={loading}>
            Làm Mới Dữ Liệu
          </Button>
        </Space>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng Số Người Dùng"
              value={stats.totalUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Giáo Viên"
              value={stats.totalTeachers || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Bài Thi"
              value={stats.totalExams || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Bài Thi Hoàn Thành"
              value={stats.completedExams || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Exams Table */}
      <Card title="Danh Sách Bài Thi Gần Đây">
        {exams.length > 0 ? (
          <Table
            columns={examColumns}
            dataSource={exams}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <Empty description="Chưa có bài thi nào" />
        )}
      </Card>
    </div>
  );
}

