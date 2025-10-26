import React, { useState, useEffect } from "react";
import {
  Select,
  Button,
  Space,
  Tag,
  message,
  Card,
  Typography,
  Avatar,
  List,
  Checkbox,
} from "antd";
import { UserOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import axiosTeacherClient from "../api/axiosTeacherClient";

const { Text, Title } = Typography;
const { Option } = Select;

export default function ProctorSelector({ 
  value = null, 
  onChange, 
  disabled = false,
  style = {} 
}) {
  const [proctors, setProctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProctor, setSelectedProctor] = useState(value || null);

  // Load danh sách giám thị
  const loadProctors = async () => {
    setLoading(true);
    try {
      const res = await axiosTeacherClient.get("/proctors");
      console.log("Proctors response:", res.data);
      setProctors(res.data.proctors || res.data);
    } catch (error) {
      console.error("Error loading proctors:", error);
      message.error("Không thể tải danh sách giám thị");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProctors();
  }, []);

  // Cập nhật selectedProctor khi value thay đổi
  useEffect(() => {
    console.log("ProctorSelector value changed:", value);
    setSelectedProctor(value || null);
  }, [value]);

  // Chọn giám thị
  const handleSelectProctor = (proctorId) => {
    const proctor = proctors.find(p => p.id === proctorId);
    if (proctor) {
      setSelectedProctor(proctor);
      onChange?.(proctor);
    }
  };

  // Xóa giám thị đã chọn
  const handleRemoveProctor = () => {
    setSelectedProctor(null);
    onChange?.(null);
  };

  // Debug log
  console.log("ProctorSelector render - selectedProctor:", selectedProctor);
  console.log("ProctorSelector render - value prop:", value);

  return (
    <Card 
      title="Phân công giám thị" 
      size="small" 
      style={style}
      extra={
        <Text type="secondary">
          {selectedProctor ? "1 giám thị đã chọn" : "Chưa chọn giám thị"}
        </Text>
      }
    >
      {/* Giám thị đã chọn */}
      {selectedProctor && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>Giám thị đã chọn:</Title>
          <List
            size="small"
            dataSource={[selectedProctor]}
            renderItem={(proctor) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={handleRemoveProctor}
                    disabled={disabled}
                  >
                    Xóa
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} size="small" />}
                  title={proctor.full_name}
                  description={proctor.email}
                />
              </List.Item>
            )}
          />
        </div>
      )}

      {/* Chọn giám thị - chỉ hiển thị khi chưa chọn */}
      {!selectedProctor && (
        <div>
          <Text strong>Chọn giám thị:</Text>
          <Select
            placeholder="Chọn giám thị"
            style={{ width: "100%", marginTop: 8 }}
            loading={loading}
            disabled={disabled}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            onSelect={handleSelectProctor}
            notFoundContent={loading ? "Đang tải..." : "Không có giám thị khả dụng"}
          >
            {proctors.map((proctor) => (
              <Option key={proctor.id} value={proctor.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar icon={<UserOutlined />} size="small" />
                  <div>
                    <div>{proctor.full_name}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {proctor.email}
                    </Text>
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </div>
      )}

      {/* Thông báo nếu không có giám thị */}
      {proctors.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "20px 0", color: "#999" }}>
          <Text type="secondary">Chưa có giám thị nào trong hệ thống</Text>
        </div>
      )}
    </Card>
  );
}
