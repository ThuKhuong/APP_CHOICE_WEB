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
  Empty,
  Spin,
} from "antd";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";
import axiosClient from "../api/axiosClient";

const { Text, Title } = Typography;
const { Option } = Select;

export default function SingleProctorSelector({ 
  value = null, 
  onChange, 
  disabled = false,
  style = {},
  placeholder = "Chọn giám thị"
}) {
  const [proctors, setProctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProctor, setSelectedProctor] = useState(value || null);

  // Load danh sách giám thị có sẵn
  const loadAvailableProctors = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/proctor/available");
      setProctors(res.data);
    } catch (error) {
      console.error("Error loading available proctors:", error);
      message.error("Không thể tải danh sách giám thị có sẵn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableProctors();
  }, []);

  // Cập nhật selectedProctor khi value thay đổi
  useEffect(() => {
    setSelectedProctor(value || null);
  }, [value]);

  // Xử lý chọn giám thị
  const handleSelectProctor = (proctorId) => {
    const proctor = proctors.find(p => p.id === proctorId);
    if (proctor) {
      setSelectedProctor(proctor);
      onChange?.(proctor);
    }
  };

  // Xóa giám thị đã chọn
  const handleClearProctor = () => {
    setSelectedProctor(null);
    onChange?.(null);
  };

  return (
    <Card 
      title="Chọn giám thị" 
      size="small" 
      style={style}
      extra={
        selectedProctor && (
          <Button 
            type="link" 
            danger 
            size="small"
            onClick={handleClearProctor}
            disabled={disabled}
          >
            Xóa
          </Button>
        )
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
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} size="small" />}
                  title={proctor.full_name}
                  description={
                    <div>
                      <div>{proctor.email}</div>
                      <div>
                        <Tag 
                          color={
                            proctor.availability_status === 'available' ? 'green' :
                            proctor.availability_status === 'busy' ? 'orange' : 'red'
                          }
                        >
                          {proctor.availability_status === 'available' ? 'Có sẵn' :
                           proctor.availability_status === 'busy' ? 'Bận' : 'Quá tải'}
                        </Tag>
                        {proctor.assigned_sessions_count > 0 && (
                          <Tag color="blue">
                            {proctor.assigned_sessions_count} ca thi
                          </Tag>
                        )}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      )}

      {/* Chọn giám thị mới */}
      <div>
        <Text strong>Chọn giám thị:</Text>
        <Select
          placeholder={placeholder}
          style={{ width: "100%", marginTop: 8 }}
          loading={loading}
          disabled={disabled}
          showSearch
          allowClear
          value={selectedProctor?.id || undefined}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          onSelect={handleSelectProctor}
          onClear={handleClearProctor}
          notFoundContent={
            loading ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <Spin size="small" />
                <div style={{ marginTop: 8 }}>Đang tải...</div>
              </div>
            ) : (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có giám thị khả dụng"
              />
            )
          }
        >
          {proctors.map((proctor) => (
            <Option key={proctor.id} value={proctor.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar icon={<UserOutlined />} size="small" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{proctor.full_name}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {proctor.email}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Tag 
                      color={
                        proctor.availability_status === 'available' ? 'green' :
                        proctor.availability_status === 'busy' ? 'orange' : 'red'
                      }
                      size="small"
                    >
                      {proctor.availability_status === 'available' ? 'Có sẵn' :
                       proctor.availability_status === 'busy' ? 'Bận' : 'Quá tải'}
                    </Tag>
                    {proctor.assigned_sessions_count > 0 && (
                      <Tag color="blue" size="small">
                        {proctor.assigned_sessions_count} ca thi
                      </Tag>
                    )}
                  </div>
                </div>
              </div>
            </Option>
          ))}
        </Select>
      </div>

      {/* Thông báo nếu không có giám thị */}
      {proctors.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "20px 0", color: "#999" }}>
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có giám thị nào có sẵn"
          />
        </div>
      )}
    </Card>
  );
}
