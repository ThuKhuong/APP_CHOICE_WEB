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
  Form,
  Input,
  Select,
  DatePicker,
} from "antd";
import {
  ExclamationCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import axiosClient from "../api/axiosClient";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function ProctorViolationsPage() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Load violations
  const loadViolations = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/proctor/violations");
      setViolations(res.data.violations);
    } catch (error) {
      console.error("Error loading violations:", error);
      message.error("Không thể tải danh sách vi phạm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadViolations();
  }, []);

  // Handle report violation
  const handleReportViolation = async (values) => {
    try {
      await axiosClient.post("/proctor/violations", {
        ...values,
        violation_time: values.violation_time.format("YYYY-MM-DD HH:mm:ss"),
      });
      message.success("Báo cáo vi phạm thành công");
      setModalVisible(false);
      form.resetFields();
      loadViolations();
    } catch (error) {
      console.error("Error reporting violation:", error);
      message.error("Không thể báo cáo vi phạm");
    }
  };

  // Columns for violations table
  const columns = [
    {
      title: "Sinh viên",
      key: "student",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.student_name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.student_id}
          </Text>
        </div>
      ),
    },
    {
      title: "Ca thi",
      key: "session",
      render: (_, record) => (
        <div>
          <div>{record.exam_title}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.subject_name}
          </Text>
        </div>
      ),
    },
    {
      title: "Loại vi phạm",
      dataIndex: "violation_type",
      key: "violation_type",
      render: (type) => {
        const typeMap = {
          cheating: { color: "red", text: "Gian lận" },
          talking: { color: "orange", text: "Nói chuyện" },
          phone: { color: "purple", text: "Sử dụng điện thoại" },
          other: { color: "default", text: "Khác" },
        };
        const config = typeMap[type] || { color: "default", text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Thời gian",
      dataIndex: "violation_time",
      key: "violation_time",
      render: (time) => new Date(time).toLocaleString("vi-VN"),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          pending: { color: "processing", text: "Chờ xử lý" },
          confirmed: { color: "error", text: "Đã xác nhận" },
          dismissed: { color: "default", text: "Đã bỏ qua" },
        };
        const config = statusMap[status] || { color: "default", text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              // Show violation details
              Modal.info({
                title: "Chi tiết vi phạm",
                content: (
                  <div>
                    <p><strong>Sinh viên:</strong> {record.student_name} ({record.student_id})</p>
                    <p><strong>Ca thi:</strong> {record.exam_title}</p>
                    <p><strong>Loại vi phạm:</strong> {record.violation_type}</p>
                    <p><strong>Thời gian:</strong> {new Date(record.violation_time).toLocaleString("vi-VN")}</p>
                    <p><strong>Mô tả:</strong> {record.description}</p>
                  </div>
                ),
              });
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
        <div style={{ marginTop: 16 }}>Đang tải danh sách vi phạm...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={2}>Quản lý vi phạm</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Báo cáo vi phạm
        </Button>
      </div>
      
      <Card>
        <Table
          columns={columns}
          dataSource={violations}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có vi phạm nào được báo cáo"
              />
            ),
          }}
        />
      </Card>

      {/* Modal báo cáo vi phạm */}
      <Modal
        title="Báo cáo vi phạm"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleReportViolation}
        >
          <Form.Item
            name="student_id"
            label="Mã sinh viên"
            rules={[{ required: true, message: "Vui lòng nhập mã sinh viên" }]}
          >
            <Input placeholder="Nhập mã sinh viên" />
          </Form.Item>

          <Form.Item
            name="session_id"
            label="Ca thi"
            rules={[{ required: true, message: "Vui lòng chọn ca thi" }]}
          >
            <Select placeholder="Chọn ca thi">
              {/* Load sessions from API */}
            </Select>
          </Form.Item>

          <Form.Item
            name="violation_type"
            label="Loại vi phạm"
            rules={[{ required: true, message: "Vui lòng chọn loại vi phạm" }]}
          >
            <Select placeholder="Chọn loại vi phạm">
              <Option value="cheating">Gian lận</Option>
              <Option value="talking">Nói chuyện</Option>
              <Option value="phone">Sử dụng điện thoại</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="violation_time"
            label="Thời gian vi phạm"
            rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả chi tiết"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <TextArea
              rows={4}
              placeholder="Mô tả chi tiết về vi phạm..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
