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
  WarningOutlined,
  PlusOutlined,
  EyeOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import axiosClient from "../api/axiosClient";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function ProctorIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Load incidents
  const loadIncidents = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/proctor/incidents");
      setIncidents(res.data.incidents);
    } catch (error) {
      console.error("Error loading incidents:", error);
      message.error("Không thể tải danh sách sự cố");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  // Handle report incident
  const handleReportIncident = async (values) => {
    try {
      await axiosClient.post("/proctor/incidents", {
        ...values,
        incident_time: values.incident_time.format("YYYY-MM-DD HH:mm:ss"),
      });
      message.success("Báo cáo sự cố thành công");
      setModalVisible(false);
      form.resetFields();
      loadIncidents();
    } catch (error) {
      console.error("Error reporting incident:", error);
      message.error("Không thể báo cáo sự cố");
    }
  };

  // Columns for incidents table
  const columns = [
    {
      title: "Ca thi",
      key: "session",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.exam_title}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.subject_name}
          </Text>
        </div>
      ),
    },
    {
      title: "Loại sự cố",
      dataIndex: "incident_type",
      key: "incident_type",
      render: (type) => {
        const typeMap = {
          technical: { color: "blue", text: "Sự cố kỹ thuật" },
          power: { color: "orange", text: "Mất điện" },
          network: { color: "purple", text: "Lỗi mạng" },
          equipment: { color: "red", text: "Hỏng thiết bị" },
          other: { color: "default", text: "Khác" },
        };
        const config = typeMap[type] || { color: "default", text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Mức độ",
      dataIndex: "severity",
      key: "severity",
      render: (severity) => {
        const severityMap = {
          low: { color: "green", text: "Thấp" },
          medium: { color: "orange", text: "Trung bình" },
          high: { color: "red", text: "Cao" },
          critical: { color: "red", text: "Nghiêm trọng" },
        };
        const config = severityMap[severity] || { color: "default", text: severity };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Thời gian",
      dataIndex: "incident_time",
      key: "incident_time",
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
          reported: { color: "processing", text: "Đã báo cáo" },
          investigating: { color: "warning", text: "Đang điều tra" },
          resolved: { color: "success", text: "Đã giải quyết" },
          closed: { color: "default", text: "Đã đóng" },
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
              // Show incident details
              Modal.info({
                title: "Chi tiết sự cố",
                content: (
                  <div>
                    <p><strong>Ca thi:</strong> {record.exam_title}</p>
                    <p><strong>Loại sự cố:</strong> {record.incident_type}</p>
                    <p><strong>Mức độ:</strong> {record.severity}</p>
                    <p><strong>Thời gian:</strong> {new Date(record.incident_time).toLocaleString("vi-VN")}</p>
                    <p><strong>Mô tả:</strong> {record.description}</p>
                    <p><strong>Trạng thái:</strong> {record.status}</p>
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
        <div style={{ marginTop: 16 }}>Đang tải danh sách sự cố...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={2}>Quản lý sự cố</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Báo cáo sự cố
        </Button>
      </div>
      
      <Card>
        <Table
          columns={columns}
          dataSource={incidents}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có sự cố nào được báo cáo"
              />
            ),
          }}
        />
      </Card>

      {/* Modal báo cáo sự cố */}
      <Modal
        title="Báo cáo sự cố"
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
          onFinish={handleReportIncident}
        >
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
            name="incident_type"
            label="Loại sự cố"
            rules={[{ required: true, message: "Vui lòng chọn loại sự cố" }]}
          >
            <Select placeholder="Chọn loại sự cố">
              <Option value="technical">Sự cố kỹ thuật</Option>
              <Option value="power">Mất điện</Option>
              <Option value="network">Lỗi mạng</Option>
              <Option value="equipment">Hỏng thiết bị</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="severity"
            label="Mức độ"
            rules={[{ required: true, message: "Vui lòng chọn mức độ" }]}
          >
            <Select placeholder="Chọn mức độ">
              <Option value="low">Thấp</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="high">Cao</Option>
              <Option value="critical">Nghiêm trọng</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="incident_time"
            label="Thời gian sự cố"
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
              placeholder="Mô tả chi tiết về sự cố..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
