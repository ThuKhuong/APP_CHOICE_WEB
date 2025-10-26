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
  Select,
  Input,
  Row,
  Col,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import axiosClient from "../api/axiosClient";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function ProctorIssueReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [resolveAction, setResolveAction] = useState("");
  const [resolveNote, setResolveNote] = useState("");

  // Load issue reports
  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/proctor/issue-reports");
      setReports(res.data);
    } catch (error) {
      console.error("Error loading issue reports:", error);
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
      } else if (error.response?.status === 403) {
        message.error("Bạn không có quyền truy cập trang này");
      } else {
        message.error("Không thể tải danh sách báo lỗi");
      }
    } finally {
      setLoading(false);
    }
  };

  // Resolve issue report
  const handleResolveReport = async () => {
    try {
      await axiosClient.put(`/proctor/issue-reports/${selectedReport.id}/resolve`, {
        action: resolveAction,
        note: resolveNote
      });
      message.success("Xử lý báo lỗi thành công!");
      setResolveModalVisible(false);
      setSelectedReport(null);
      setResolveAction("");
      setResolveNote("");
      loadReports();
    } catch (error) {
      console.error("Error resolving report:", error);
      message.error("Không thể xử lý báo lỗi");
    }
  };

  useEffect(() => {
    loadReports();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(loadReports, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Get issue type text
  const getIssueTypeText = (type) => {
    const types = {
      'wrong_content': 'Sai nội dung',
      'typo': 'Lỗi chính tả',
      'ambiguous': 'Mơ hồ',
      'other': 'Khác'
    };
    return types[type] || type;
  };

  // Get issue type color
  const getIssueTypeColor = (type) => {
    const colors = {
      'wrong_content': 'red',
      'typo': 'orange',
      'ambiguous': 'yellow',
      'other': 'default'
    };
    return colors[type] || 'default';
  };

  // Columns for reports table
  const columns = [
    {
      title: "Thí sinh",
      key: "student",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.student_name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.student_email}
          </Text>
        </div>
      ),
    },
    {
      title: "Ca thi",
      key: "session",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.exam_title}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.subject_name} - {record.access_code}
          </Text>
        </div>
      ),
    },
    {
      title: "Loại lỗi",
      dataIndex: "issue_type",
      key: "issue_type",
      render: (type) => (
        <Tag color={getIssueTypeColor(type)}>
          {getIssueTypeText(type)}
        </Tag>
      ),
    },
    {
      title: "Nội dung câu hỏi",
      dataIndex: "question_content",
      key: "question_content",
      ellipsis: true,
      render: (content) => (
        <div style={{ maxWidth: 200 }}>
          {content?.substring(0, 100)}...
        </div>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
      render: (note) => note || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "resolved",
      key: "resolved",
      render: (resolved) => (
        <Tag color={resolved ? "green" : "red"}>
          {resolved ? "Đã xử lý" : "Chờ xử lý"}
        </Tag>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "created_at",
      key: "created_at",
      render: (time) => new Date(time).toLocaleString("vi-VN"),
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
              setSelectedReport(record);
              setResolveModalVisible(true);
            }}
          >
            Xem chi tiết
          </Button>
          {!record.resolved && (
            <Button
              type="default"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                setSelectedReport(record);
                setResolveModalVisible(true);
              }}
            >
              Xử lý
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải danh sách báo lỗi...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Xử lý báo lỗi câu hỏi</Title>
          <Text type="secondary">Quản lý và xử lý các báo lỗi từ thí sinh</Text>
        </div>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={loadReports}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: "bold", color: "#1890ff" }}>
                {reports.length}
              </div>
              <div>Tổng báo lỗi</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: "bold", color: "#ff4d4f" }}>
                {reports.filter(r => !r.resolved).length}
              </div>
              <div>Chờ xử lý</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: "bold", color: "#52c41a" }}>
                {reports.filter(r => r.resolved).length}
              </div>
              <div>Đã xử lý</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Reports Table */}
      <Card title="Danh sách báo lỗi">
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} báo lỗi`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có báo lỗi nào"
              />
            ),
          }}
        />
      </Card>

      {/* Resolve Modal */}
      <Modal
        title="Xử lý báo lỗi câu hỏi"
        open={resolveModalVisible}
        onOk={handleResolveReport}
        onCancel={() => {
          setResolveModalVisible(false);
          setSelectedReport(null);
          setResolveAction("");
          setResolveNote("");
        }}
        okText="Xử lý"
        cancelText="Hủy"
        width={800}
      >
        {selectedReport && (
          <div>
            <Descriptions bordered column={1} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Thí sinh">
                {selectedReport.student_name} ({selectedReport.student_email})
              </Descriptions.Item>
              <Descriptions.Item label="Ca thi">
                {selectedReport.exam_title} - {selectedReport.subject_name}
              </Descriptions.Item>
              <Descriptions.Item label="Loại lỗi">
                <Tag color={getIssueTypeColor(selectedReport.issue_type)}>
                  {getIssueTypeText(selectedReport.issue_type)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú từ thí sinh">
                {selectedReport.note || "Không có ghi chú"}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginBottom: 16 }}>
              <Title level={5}>Nội dung câu hỏi:</Title>
              <div style={{ 
                padding: 12, 
                backgroundColor: "#f5f5f5", 
                borderRadius: 4,
                maxHeight: 200,
                overflowY: "auto"
              }}>
                {selectedReport.question_content}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Title level={5}>Hành động xử lý:</Title>
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn hành động xử lý"
                value={resolveAction}
                onChange={setResolveAction}
              >
                <Option value="fix_typo">Sửa lỗi chính tả/ký tự</Option>
                <Option value="replace_question">Thay thế câu hỏi</Option>
                <Option value="disable_question">Vô hiệu hóa câu hỏi</Option>
              </Select>
            </div>

            <div>
              <Title level={5}>Ghi chú xử lý:</Title>
              <TextArea
                placeholder="Nhập ghi chú về cách xử lý..."
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}




