import React, { useEffect, useState } from "react";
import { 
  Table, 
  Button, 
  message, 
  Input, 
  Select, 
  Card, 
  Row, 
  Col, 
  Statistic,
  Tag,
  Space,
  Tooltip
} from "antd";
import { 
  SearchOutlined, 
  EyeOutlined, 
  BarChartOutlined,
  UserOutlined,
  TrophyOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axiosTeacherClient from "../api/axiosTeacherClient";

const { Search } = Input;
const { Option } = Select;

export default function ExamResultPage() {
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  // Tải danh sách kết quả các ca thi
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axiosTeacherClient.get("/exam-sessions");
        setData(res.data);
        setFilteredData(res.data);
      } catch (err) {
        console.error(err);
        message.error("Không tải được kết quả thi");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Lọc dữ liệu
  useEffect(() => {
    if (!data) return;
    
    let filtered = data.filter(item => {
      const matchesSearch = !searchText || 
        item.exam_title?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.subject_name?.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesSubject = !subjectFilter || item.subject_name === subjectFilter;
      
      const matchesStatus = !statusFilter || 
        (statusFilter === "completed" && item.status === "completed") ||
        (statusFilter === "ongoing" && item.status === "ongoing") ||
        (statusFilter === "scheduled" && item.status === "scheduled");
      
      return matchesSearch && matchesSubject && matchesStatus;
    });
    
    setFilteredData(filtered);
  }, [data, searchText, subjectFilter, statusFilter]);

  // Lấy danh sách môn học unique
  const subjects = data ? [...new Set(data.map(item => item.subject_name))] : [];
  
  // Tính thống kê
  const stats = data ? {
    totalSessions: data.length,
    totalStudents: data.reduce((sum, item) => sum + (item.total_students || 0), 0),
    averageScore: data.reduce((sum, item) => sum + (item.avg_score || 0), 0) / data.length,
    completedSessions: data.filter(item => item.status === "completed").length
  } : {};

  const columns = [
    { 
      title: "ID", 
      dataIndex: "session_id", 
      width: 80,
      render: (id) => <Tag color="blue">#{id}</Tag>
    },
    { 
      title: "Đề thi", 
      dataIndex: "exam_title",
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      )
    },
    { 
      title: "Môn học", 
      dataIndex: "subject_name",
      render: (text) => <Tag color="green">{text}</Tag>
    },
    {
      title: "Thời gian",
      render: (r) => (
        <div>
          <div>{dayjs(r.start_at).format("DD/MM/YYYY HH:mm")}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            → {dayjs(r.end_at).format("DD/MM/YYYY HH:mm")}
          </div>
        </div>
      ),
    },
    { 
      title: "Trạng thái", 
      dataIndex: "status",
      render: (status) => {
        const statusConfig = {
          scheduled: { color: "blue", text: "Sắp thi" },
          ongoing: { color: "orange", text: "Đang thi" },
          completed: { color: "green", text: "Hoàn thành" },
          cancelled: { color: "red", text: "Hủy" }
        };
        const config = statusConfig[status] || { color: "default", text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    { 
      title: "Số SV thi", 
      dataIndex: "total_students",
      render: (count) => (
        <Space>
          <UserOutlined />
          {count || 0}
        </Space>
      )
    },
    {
      title: "Điểm TB",
      dataIndex: "avg_score",
      render: (value) => (
        <Space>
          <TrophyOutlined />
          {value ? Number(value).toFixed(2) : "-"}
        </Space>
      ),
      sorter: (a, b) => (a.avg_score || 0) - (b.avg_score || 0)
    },
    {
      title: "Hành động",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/results/${record.session_id}`)}
            >
              Chi tiết
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) return <p style={{ padding: 24 }}>Đang tải...</p>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h2>Kết quả thi</h2>

        {/* Bộ lọc và tìm kiếm */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={8}>
              <Search
                placeholder="Tìm kiếm theo đề thi hoặc môn học..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="Lọc theo môn học"
                value={subjectFilter}
                onChange={setSubjectFilter}
                style={{ width: "100%" }}
                allowClear
              >
                {subjects.map(subject => (
                  <Option key={subject} value={subject}>{subject}</Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Select
                placeholder="Lọc theo trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: "100%" }}
                allowClear
              >
                <Option value="scheduled">Sắp thi</Option>
                <Option value="ongoing">Đang thi</Option>
                <Option value="completed">Hoàn thành</Option>
                <Option value="cancelled">Hủy</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Button 
                onClick={() => {
                  setSearchText("");
                  setSubjectFilter("");
                  setStatusFilter("");
                }}
              >
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Card>
      </div>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="session_id"
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} ca thi`
        }}
        loading={loading}
        scroll={{ x: 1200 }}
      />
    </div>
  );
}
