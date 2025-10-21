import React, { useEffect, useState } from "react";
import { Card, Table, Select, DatePicker, Button, Row, Col, Statistic, Chart } from "antd";
import { DownloadOutlined, BarChartOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function ViolationReportPage() {
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: [dayjs().subtract(7, 'day'), dayjs()],
    examType: 'all',
    violationType: 'all'
  });

  useEffect(() => {
    loadReportData();
  }, [filters]);

  const loadReportData = () => {
    // Mock data cho báo cáo vi phạm
    const mockData = {
      summary: {
        totalViolations: 156,
        totalStudents: 450,
        violationRate: 34.7,
        topViolationType: "tab_out"
      },
      violationsByType: [
        { type: "tab_out", count: 67, percentage: 43.0 },
        { type: "multi_device", count: 34, percentage: 21.8 },
        { type: "timeout", count: 28, percentage: 17.9 },
        { type: "suspicious", count: 27, percentage: 17.3 }
      ],
      violationsByExam: [
        { exam_title: "Kiểm tra giữa kỳ - Java", violations: 45, students: 120, rate: 37.5 },
        { exam_title: "Thi cuối kỳ - Database", violations: 38, students: 95, rate: 40.0 },
        { exam_title: "Kiểm tra thực hành - Web", violations: 32, students: 110, rate: 29.1 },
        { exam_title: "Thi cuối kỳ - AI", violations: 41, students: 125, rate: 32.8 }
      ],
      violationsByTime: [
        { hour: "08:00", count: 23 },
        { hour: "09:00", count: 45 },
        { hour: "10:00", count: 38 },
        { hour: "11:00", count: 28 },
        { hour: "14:00", count: 22 }
      ],
      detailedViolations: [
        {
          id: 1,
          student_name: "Nguyễn Văn A",
          student_code: "SV001",
          exam_title: "Kiểm tra giữa kỳ - Java",
          violation_type: "tab_out",
          description: "Rời tab thi 5 lần",
          timestamp: "2025-10-16T09:30:00Z",
          severity: "high",
          proctor_name: "Giáo viên X"
        },
        {
          id: 2,
          student_name: "Trần Thị B",
          student_code: "SV002", 
          exam_title: "Thi cuối kỳ - Database",
          violation_type: "multi_device",
          description: "Đăng nhập từ 2 thiết bị khác nhau",
          timestamp: "2025-10-16T10:15:00Z",
          severity: "high",
          proctor_name: "Giáo viên Y"
        },
        {
          id: 3,
          student_name: "Lê Văn C",
          student_code: "SV003",
          exam_title: "Kiểm tra thực hành - Web", 
          violation_type: "timeout",
          description: "Mất kết nối 3 phút",
          timestamp: "2025-10-16T11:20:00Z",
          severity: "medium",
          proctor_name: "Giáo viên Z"
        }
      ]
    };

    setReportData(mockData);
  };

  const handleExport = () => {
    // Xuất báo cáo Excel/CSV
    console.log("Xuất báo cáo...");
  };

  const violationTypeColumns = [
    {
      title: "Loại vi phạm",
      dataIndex: "type",
      render: (type) => {
        const labels = {
          tab_out: "Rời tab thi",
          multi_device: "Nhiều thiết bị", 
          timeout: "Mất kết nối",
          suspicious: "Hành vi đáng nghi"
        };
        return labels[type] || type;
      }
    },
    { title: "Số lượng", dataIndex: "count" },
    { 
      title: "Tỷ lệ (%)", 
      dataIndex: "percentage",
      render: (val) => `${val}%`
    }
  ];

  const examViolationColumns = [
    { title: "Đề thi", dataIndex: "exam_title" },
    { title: "Vi phạm", dataIndex: "violations" },
    { title: "Tổng SV", dataIndex: "students" },
    { 
      title: "Tỷ lệ (%)", 
      dataIndex: "rate",
      render: (val) => `${val}%`,
      sorter: (a, b) => a.rate - b.rate
    }
  ];

  const detailColumns = [
    { title: "Mã SV", dataIndex: "student_code", width: 80 },
    { title: "Sinh viên", dataIndex: "student_name" },
    { title: "Đề thi", dataIndex: "exam_title" },
    {
      title: "Loại vi phạm",
      dataIndex: "violation_type",
      render: (type) => {
        const labels = {
          tab_out: "Rời tab",
          multi_device: "Nhiều thiết bị",
          timeout: "Mất kết nối", 
          suspicious: "Đáng nghi"
        };
        return labels[type] || type;
      }
    },
    { title: "Mô tả", dataIndex: "description" },
    {
      title: "Mức độ",
      dataIndex: "severity",
      render: (severity) => {
        const colors = {
          low: "#52c41a",
          medium: "#faad14",
          high: "#ff4d4f"
        };
        const labels = {
          low: "Thấp",
          medium: "Trung bình", 
          high: "Cao"
        };
        return (
          <span style={{ color: colors[severity] }}>
            {labels[severity] || severity}
          </span>
        );
      }
    },
    {
      title: "Thời gian",
      dataIndex: "timestamp",
      render: (time) => dayjs(time).format("DD/MM HH:mm")
    },
    { title: "Cán bộ coi thi", dataIndex: "proctor_name" }
  ];

  if (!reportData) {
    return <div style={{ padding: 24 }}>Đang tải báo cáo...</div>;
  }

  const { summary, violationsByType, violationsByExam, detailedViolations } = reportData;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2>Báo cáo vi phạm</h2>
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
          Xuất báo cáo
        </Button>
      </div>

      {/* Bộ lọc */}
      <Card title="Bộ lọc" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>Khoảng thời gian:</div>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              style={{ width: "100%" }}
            />
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>Loại kỳ thi:</div>
            <Select
              value={filters.examType}
              onChange={(value) => setFilters({ ...filters, examType: value })}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="midterm">Giữa kỳ</Option>
              <Option value="final">Cuối kỳ</Option>
              <Option value="practice">Thực hành</Option>
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>Loại vi phạm:</div>
            <Select
              value={filters.violationType}
              onChange={(value) => setFilters({ ...filters, violationType: value })}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="tab_out">Rời tab</Option>
              <Option value="multi_device">Nhiều thiết bị</Option>
              <Option value="timeout">Mất kết nối</Option>
              <Option value="suspicious">Đáng nghi</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Thống kê tổng quan */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng vi phạm"
              value={summary.totalViolations}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng sinh viên"
              value={summary.totalStudents}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tỷ lệ vi phạm"
              value={summary.violationRate}
              suffix="%"
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Vi phạm phổ biến"
              value="Rời tab thi"
              valueStyle={{ fontSize: "16px" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        {/* Vi phạm theo loại */}
        <Col span={12}>
          <Card title="Vi phạm theo loại">
            <Table
              dataSource={violationsByType}
              columns={violationTypeColumns}
              rowKey="type"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Vi phạm theo đề thi */}
        <Col span={12}>
          <Card title="Vi phạm theo đề thi">
            <Table
              dataSource={violationsByExam}
              columns={examViolationColumns}
              rowKey="exam_title"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Chi tiết vi phạm */}
      <Card title="Chi tiết vi phạm">
        <Table
          dataSource={detailedViolations}
          columns={detailColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}