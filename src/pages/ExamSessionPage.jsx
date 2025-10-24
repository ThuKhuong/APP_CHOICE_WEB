import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  message,
  Popconfirm,
  Space,
  Descriptions,
  Tag,
  Card,
  Row,
  Col,
} from "antd";
import { ReloadOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FilterOutlined } from "@ant-design/icons";
import axiosTeacherClient from "../api/axiosTeacherClient";
import ProctorSelector from "../components/ProctorSelector";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

export default function ExamSessionPage() {
  const [sessions, setSessions] = useState([]);
  const [exams, setExams] = useState([]);
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [viewingSession, setViewingSession] = useState(null);
  const [selectedProctor, setSelectedProctor] = useState(null);
  const [sessionProctor, setSessionProctor] = useState(null);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Tải dữ liệu
  const loadData = async () => {
    try {
      const ses = await axiosTeacherClient.get("/sessions");
      setSessions(ses.data);
      setFilteredSessions(ses.data); // Khởi tạo filtered data
      const ex = await axiosTeacherClient.get("/exams");
      setExams(ex.data);
    } catch (err) {
      message.error("Không tải được dữ liệu");
    }
  };

  useEffect(() => {
    loadData();

    // Cập nhật realtime mỗi 30s (chỉ load data, không gọi API update status)
    const interval = setInterval(loadData, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Áp dụng filter khi có thay đổi
  useEffect(() => {
    applyFilters();
  }, [selectedSubject, selectedStatus, searchText, sessions]);

  // Hàm vô hiệu hóa các ngày trước hôm nay
  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  // Hàm vô hiệu hóa các giờ đã qua trong ngày hhiện tại hôm nay
  const disabledTime = (current, type) => {
    if (!current) return {};

    const now = dayjs();
    const isToday = current.isSame(now, "day");

    if (!isToday) return {};

    return {
      disabledHours: () => {
        const hours = [];
        for (let i = 0; i < now.hour(); i++) {
          hours.push(i);
        }
        return hours;
      },
      disabledMinutes: (selectedHour) => {
        if (selectedHour !== now.hour()) return [];
        const minutes = [];
        for (let i = 0; i <= now.minute(); i++) {
          minutes.push(i);
        }
        return minutes;
      },
    };
  };

  // Tự động cập nhật thời gian kết thúc khi chọn đề thi hoặc thời gian bắt đầu
  const handleAutoTime = (value, type) => {
    let examId = form.getFieldValue("exam_id");
    let startTime = form.getFieldValue("start_time");
    if (type === "exam" && value) examId = value;
    if (type === "time" && value) startTime = value;
    const selectedExam = exams.find((e) => e.id === examId);
    if (selectedExam && selectedExam.duration && startTime) {
      const endTime = startTime.add(selectedExam.duration, "minutes");
      form.setFieldsValue({ 
        start_time: startTime,
        end_time: endTime 
      });
    }
  };

  // Tạo mã truy cập ngẫu nhiên
  const generateRandomCode = () => {
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    form.setFieldsValue({ access_code: randomCode });
  };

  // Tạo hoặc cập nhật ca thi
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Kiểm tra thời gian bắt đầu phải trước thời gian kết thúc
      if (values.start_time.isAfter(values.end_time)) {
        message.error("Thời gian bắt đầu phải trước thời gian kết thúc!");
        return;
      }
      // Kiểm tra thời gian thi tối thiểu 1 phút
      const duration = values.end_time.diff(values.start_time, "minutes");
      if (duration < 1) {
        message.error("Thời gian thi phải ít nhất 1 phút!");
        return;
      }

      // Tạo mã truy cập random nếu không nhập
      const randomCode = () =>
        Math.random().toString(36).substring(2, 8).toUpperCase();

      const payload = {
        exam_id: values.exam_id,
        start_at: values.start_time.toISOString(),
        end_at: values.end_time.toISOString(),
        access_code:
          values.access_code && values.access_code.trim()
            ? values.access_code
            : randomCode(),
      };

      if (editingSession) {
        await axiosTeacherClient.put(`/sessions/${editingSession.id}`, payload);
        message.success("Cập nhật ca thi thành công!");
      } else {
        const sessionResponse = await axiosTeacherClient.post("/sessions", payload);
        message.success("Tạo ca thi thành công!");
        
        // Phân công giám thị nếu có
        if (selectedProctor) {
          try {
            await axiosTeacherClient.post(`/sessions/${sessionResponse.data.id}/proctors`, {
              proctorIds: [selectedProctor.id]
            });
            message.success("Phân công giám thị thành công!");
          } catch (err) {
            console.error("Error assigning proctor:", err);
            message.warning("Ca thi đã tạo nhưng phân công giám thị thất bại");
          }
        }
      }
      
      setOpen(false);
      setEditingSession(null);
      form.resetFields();
      setSelectedProctor(null);
      loadData();
    } catch (err) {
      message.error("Lỗi khi lưu ca thi");
    }
  };

  //  Xóa ca thi
  const handleDelete = async (id) => {
    try {
      // Kiểm tra xem ca thi có đang diễn ra không
      const session = sessions.find(s => s.id === id);
      if (session) {
        const now = dayjs();
        const startTime = dayjs(session.start_at);
        const endTime = dayjs(session.end_at);
        
        if (now.isBetween(startTime, endTime)) {
          message.error("Không thể xóa ca thi đang diễn ra!");
          return;
        }
      }

      await axiosTeacherClient.delete(`/sessions/${id}`);
      message.success("Xóa ca thi thành công!");
      loadData();
    } catch (err) {
      console.error("Error deleting session:", err);
      if (err.response?.status === 409) {
        message.error("Không thể xóa ca thi đang có thí sinh tham gia!");
      } else {
      message.error("Không thể xóa ca thi này");
      }
    }
  };

  // Filter và search sessions
  const applyFilters = () => {
    let filtered = [...sessions];

    // Filter theo môn học
    if (selectedSubject) {
      filtered = filtered.filter(session => session.subject_name === selectedSubject);
    }

    // Filter theo trạng thái
    if (selectedStatus) {
      filtered = filtered.filter(session => {
        const now = dayjs();
        const startTime = dayjs(session.start_at);
        const endTime = dayjs(session.end_at);

        // Ưu tiên status từ database, fallback về tính toán thời gian
        if (session.status === 'cancelled') {
          return selectedStatus === 'cancelled';
        } else if (session.status === 'completed') {
          return selectedStatus === 'completed';
        } else if (session.status === 'ongoing') {
          return selectedStatus === 'ongoing';
        } else if (session.status === 'scheduled') {
          return selectedStatus === 'scheduled';
        } else {
          // Fallback: Tính toán dựa trên thời gian
          if (now.isBefore(startTime)) {
            return selectedStatus === 'scheduled';
          } else if (now.isBetween(startTime, endTime)) {
            return selectedStatus === 'ongoing';
          } else {
            return selectedStatus === 'completed';
          }
        }
      });
    }

    // Search theo mã truy cập, giám thị, đề thi
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(session => {
        return (
          session.access_code.toLowerCase().includes(searchLower) ||
          session.exam_title.toLowerCase().includes(searchLower) ||
          session.subject_name.toLowerCase().includes(searchLower)
        );
      });
    }

    setFilteredSessions(filtered);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedSubject(null);
    setSelectedStatus(null);
    setSearchText("");
    setFilteredSessions(sessions);
  };

  // Hủy ca thi
  const handleCancelSession = async (sessionId) => {
    try {
      await axiosTeacherClient.put(`/sessions/${sessionId}/cancel`);
      message.success("Hủy ca thi thành công!");
      loadData();
    } catch (err) {
      console.error("Error cancelling session:", err);
      if (err.response?.status === 409) {
        message.error("Không thể hủy ca thi đang diễn ra!");
      } else {
        message.error("Không thể hủy ca thi này");
      }
    }
  };

  // Load thông tin giám thị của ca thi
  const loadSessionProctor = async (sessionId) => {
    try {
      const response = await axiosTeacherClient.get(`/sessions/${sessionId}/proctor`);
      setSessionProctor(response.data);
      return response.data;
    } catch (err) {
      console.log("Không có giám thị được phân công cho ca thi này");
      setSessionProctor(null);
      return null;
    }
  };

  // Xem chi tiết ca thi
  const handleView = async (record) => {
    setViewingSession(record);
    setViewModalOpen(true);
    // Load thông tin giám thị
    await loadSessionProctor(record.id);
  };

  //  Sửa ca thi
  const handleEdit = async (record) => {
    setEditingSession(record);
    setOpen(true);

    // Điền lại dữ liệu form
    form.setFieldsValue({
      exam_id: record.exam_id,
      start_time: dayjs(record.start_at),
      end_time: dayjs(record.end_at),
      access_code: record.access_code,
    });

    // Load thông tin giám thị đã được phân công
    const proctor = await loadSessionProctor(record.id);
    setSelectedProctor(proctor);
  };

  //  Cột bảng
  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { 
      title: "Đề thi", 
      dataIndex: "exam_title",
      ellipsis: true,
      width: 200
    },
    { 
      title: "Môn học", 
      dataIndex: "subject_name",
      width: 150
    },
    {
      title: "Thời gian",
      width: 300,
      render: (r) => (
        <div>
          <div><strong>Bắt đầu:</strong> {dayjs(r.start_at).format("HH:mm DD/MM/YYYY")}</div>
          <div><strong>Thời gian:</strong> {dayjs(r.end_at).diff(dayjs(r.start_at), 'minutes')} phút</div>
        </div>
      ),
    },
    { 
      title: "Mã truy cập", 
      dataIndex: "access_code",
      width: 120,
      render: (code) => <Tag color="blue">{code}</Tag>
    },
    {
      title: "Trạng thái",
      render: (record) => {
        const now = dayjs();
        const startTime = dayjs(record.start_at);
        const endTime = dayjs(record.end_at);

        // Ưu tiên status từ database, fallback về tính toán thời gian
        if (record.status === 'cancelled') {
          return <span style={{ color: "#ff4d4f" }}>Đã hủy</span>;
        } else if (record.status === 'completed') {
          return <span style={{ color: "#d9d9d9" }}>Hoàn thành</span>;
        } else if (record.status === 'ongoing') {
          return <span style={{ color: "#52c41a" }}>Đang diễn ra</span>;
        } else if (record.status === 'scheduled') {
          return <span style={{ color: "#faad14" }}>Chờ bắt đầu</span>;
        } else {
          // Fallback: Tính toán dựa trên thời gian
          if (now.isBefore(startTime)) {
            return <span style={{ color: "#faad14" }}>Chờ bắt đầu</span>;
          } else if (now.isBetween(startTime, endTime)) {
            return <span style={{ color: "#52c41a" }}>Đang diễn ra</span>;
          } else {
            return <span style={{ color: "#d9d9d9" }}>Hoàn thành</span>;
          }
        }
      },
    },
    {
      title: "Hành động",
      width: 400,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            title="Xem chi tiết"
          >
            Xem
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Chỉnh sửa"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa ca thi này?"
            description="Hành động này không thể hoàn tác!"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              title="Xóa ca thi"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Danh sách ca thi</h2>
      </div>

      {/* Filter và Search */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={5}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <FilterOutlined />
                <span>Môn học:</span>
              </Space>
              <Select
                placeholder="Chọn môn học"
                style={{ width: '100%' }}
                value={selectedSubject}
                onChange={setSelectedSubject}
                allowClear
              >
                {[...new Set(sessions.map(s => s.subject_name))].map(subject => (
                  <Select.Option key={subject} value={subject}>
                    {subject}
                  </Select.Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <FilterOutlined />
                <span>Trạng thái:</span>
              </Space>
              <Select
                placeholder="Chọn trạng thái"
                style={{ width: '100%' }}
                value={selectedStatus}
                onChange={setSelectedStatus}
                allowClear
              >
                <Select.Option value="scheduled">Chờ bắt đầu</Select.Option>
                <Select.Option value="ongoing">Đang diễn ra</Select.Option>
                <Select.Option value="completed">Hoàn thành</Select.Option>
                <Select.Option value="cancelled">Đã hủy</Select.Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <SearchOutlined />
                <span>Tìm kiếm:</span>
              </Space>
              <Input
                placeholder="Mã, đề thi, môn học..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
                allowClear
              />
            </Space>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={resetFilters}>
                Xóa bộ lọc
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  setOpen(true);
                  setEditingSession(null);
                  form.resetFields();
                  setSelectedProctor(null);
                }}
              >
                + Tạo ca thi
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Table 
        dataSource={filteredSessions} 
        columns={columns} 
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} ca thi`,
        }}
      />

      <Modal
        title={editingSession ? "Chỉnh sửa ca thi" : "Tạo ca thi mới"}
        open={open}
        onOk={handleSave}
        onCancel={() => {
          setOpen(false);
          setEditingSession(null);
          setSelectedProctor(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => setOpen(false)}>
            Hủy
          </Button>,
          <Button 
            key="cancel-session" 
            danger 
            onClick={() => {
              handleCancelSession(editingSession.id);
              setOpen(false);
            }}
            disabled={editingSession?.status === 'cancelled'}
          >
            Hủy ca thi
          </Button>,
          <Button key="save" type="primary" onClick={handleSave}>
            Lưu
          </Button>
        ]}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Chọn đề thi"
            name="exam_id"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Chọn đề thi"
              onChange={(v) => {
                handleAutoTime(v, "exam");
              }}
            >
              {exams.map((e) => (
                <Select.Option key={e.id} value={e.id}>
                  {e.title} ({e.subject_name}) - {e.duration} phút
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Thời gian bắt đầu"
            name="start_time"
            rules={[{ required: true, message: "Vui lòng chọn thời gian bắt đầu" }]}
          >
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format="YYYY-MM-DD HH:mm"
              disabledDate={disabledDate}
              disabledTime={disabledTime}
              placeholder="Chọn thời gian bắt đầu"
              style={{ width: "100%" }}
              onChange={(v) => {
                handleAutoTime(v, "time");
              }}
            />
          </Form.Item>

          <Form.Item
            label="Thời gian kết thúc"
            name="end_time"
          >
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format="YYYY-MM-DD HH:mm"
              disabled
              placeholder="Sẽ tự động tính theo thời gian làm bài"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item label="Mã truy cập">
            <Space.Compact style={{ width: "100%" }}>
              <Form.Item name="access_code" noStyle>
                <Input />
              </Form.Item>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={generateRandomCode}
                title="Tạo mã mới"
              >
                Tạo lại
              </Button>
            </Space.Compact>
          </Form.Item>

          <Form.Item label="Phân công giám thị">
            <ProctorSelector
              value={selectedProctor}
              onChange={setSelectedProctor}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem chi tiết ca thi */}
      <Modal
        title="Chi tiết ca thi"
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setViewingSession(null);
          setSessionProctor(null);
        }}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Đóng
          </Button>,
          <Button 
            key="edit" 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => {
              setViewModalOpen(false);
              handleEdit(viewingSession);
            }}
          >
            Chỉnh sửa
          </Button>
        ]}
        width={800}
      >
        {viewingSession && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="ID ca thi" span={1}>
                {viewingSession.id}
              </Descriptions.Item>
              <Descriptions.Item label="Mã truy cập" span={1}>
                <Tag color="blue">{viewingSession.access_code}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Đề thi" span={2}>
                {viewingSession.exam_title}
              </Descriptions.Item>
              <Descriptions.Item label="Môn học" span={2}>
                {viewingSession.subject_name}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian bắt đầu" span={1}>
                {dayjs(viewingSession.start_at).format("HH:mm DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian kết thúc" span={1}>
                {dayjs(viewingSession.end_at).format("HH:mm DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian làm bài" span={1}>
                {dayjs(viewingSession.end_at).diff(dayjs(viewingSession.start_at), 'minutes')} phút
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                {(() => {
                  const now = dayjs();
                  const startTime = dayjs(viewingSession.start_at);
                  const endTime = dayjs(viewingSession.end_at);

                  // Ưu tiên status từ database
                  if (viewingSession.status === 'cancelled') {
                    return <Tag color="red">Đã hủy</Tag>;
                  } else if (viewingSession.status === 'completed') {
                    return <Tag color="default">Hoàn thành</Tag>;
                  } else if (viewingSession.status === 'ongoing') {
                    return <Tag color="green">Đang diễn ra</Tag>;
                  } else if (viewingSession.status === 'scheduled') {
                    return <Tag color="orange">Chờ bắt đầu</Tag>;
                  } else {
                    // Fallback: Tính toán dựa trên thời gian
                    if (now.isBefore(startTime)) {
                      return <Tag color="orange">Chờ bắt đầu</Tag>;
                    } else if (now.isBetween(startTime, endTime)) {
                      return <Tag color="green">Đang diễn ra</Tag>;
                    } else {
                      return <Tag color="default">Hoàn thành</Tag>;
                    }
                  }
                })()}
              </Descriptions.Item>
            </Descriptions>

            <Card 
              title="Thông tin giám thị" 
              style={{ marginTop: 16 }}
              size="small"
            >
              {sessionProctor ? (
                <div>
                  <Descriptions column={2}>
                    <Descriptions.Item label="Tên giám thị">
                      <strong>{sessionProctor.full_name}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {sessionProctor.email}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#999" }}>
                  <p>Chưa có giám thị được phân công cho ca thi này</p>
                </div>
              )}
            </Card>

            <Card 
              title="Thống kê" 
              style={{ marginTop: 16 }}
              size="small"
            >
              <Descriptions column={3}>
                <Descriptions.Item label="Số thí sinh tham gia">
                  <Tag color="blue">0</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Số thí sinh hoàn thành">
                  <Tag color="green">0</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tỷ lệ hoàn thành">
                  <Tag color="purple">0%</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}
