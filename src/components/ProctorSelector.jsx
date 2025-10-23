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
import axiosClient from "../api/axiosClient";

const { Text, Title } = Typography;
const { Option } = Select;

export default function ProctorSelector({ 
  value = [], 
  onChange, 
  disabled = false,
  style = {} 
}) {
  const [proctors, setProctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProctors, setSelectedProctors] = useState(value || []);

  // Load danh sách giám thị
  const loadProctors = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/proctors");
      setProctors(res.data);
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

  // Cập nhật selectedProctors khi value thay đổi
  useEffect(() => {
    setSelectedProctors(value || []);
  }, [value]);

  // Thêm giám thị
  const handleAddProctor = (proctorId) => {
    if (selectedProctors.find(p => p.id === proctorId)) {
      message.warning("Giám thị đã được chọn");
      return;
    }

    const proctor = proctors.find(p => p.id === proctorId);
    if (proctor) {
      const newSelected = [...selectedProctors, proctor];
      setSelectedProctors(newSelected);
      onChange?.(newSelected);
    }
  };

  // Xóa giám thị
  const handleRemoveProctor = (proctorId) => {
    const newSelected = selectedProctors.filter(p => p.id !== proctorId);
    setSelectedProctors(newSelected);
    onChange?.(newSelected);
  };

  // Lấy danh sách giám thị chưa được chọn
  const availableProctors = proctors.filter(
    proctor => !selectedProctors.find(selected => selected.id === proctor.id)
  );

  return (
    <Card 
      title="Phân công giám thị" 
      size="small" 
      style={style}
      extra={
        <Text type="secondary">
          {selectedProctors.length} giám thị đã chọn
        </Text>
      }
    >
      {/* Danh sách giám thị đã chọn */}
      {selectedProctors.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>Giám thị đã chọn:</Title>
          <List
            size="small"
            dataSource={selectedProctors}
            renderItem={(proctor) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveProctor(proctor.id)}
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

      {/* Chọn giám thị mới */}
      <div>
        <Text strong>Thêm giám thị:</Text>
        <Select
          placeholder="Chọn giám thị"
          style={{ width: "100%", marginTop: 8 }}
          loading={loading}
          disabled={disabled}
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          onSelect={handleAddProctor}
          notFoundContent={loading ? "Đang tải..." : "Không có giám thị khả dụng"}
        >
          {availableProctors.map((proctor) => (
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

      {/* Thông báo nếu không có giám thị */}
      {proctors.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "20px 0", color: "#999" }}>
          <Text type="secondary">Chưa có giám thị nào trong hệ thống</Text>
        </div>
      )}
    </Card>
  );
}
