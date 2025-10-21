import React, { useEffect, useState } from "react";
import { Card, Table, Button, Modal, Form, Input, Select, message, Badge, Tabs } from "antd";
import { EyeOutlined, ExclamationCircleOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import StudentMonitorPage from "./StudentMonitorPage";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

export default function ProctorPage() {
  const [assignedSessions, setAssignedSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [violations, setViolations] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [violationModalOpen, setViolationModalOpen] = useState(false);
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [monitoringStudent, setMonitoringStudent] = useState(null);
  const [form] = Form.useForm();
  const [incidentForm] = Form.useForm();

  // Mock data - thay thế bằng API calls thực tế
  useEffect(() => {
    loadAssignedSessions();
  }, []);

  const loadAssignedSessions = () => {
    // Mock data cho ca thi được phân công
    const mockSessions = [
      {
        session_id: 1,
        exam_title: "Kiểm tra giữa kỳ - Lập trình Java",
        subject_name: "Lập trình Java",
        start_at: "2025-10-16T08:00:00Z",
        end_at: "2025-10-16T10:00:00Z",
        room: "A101",
        status: "ongoing"
      },
      {
        session_id: 2,
        exam_title: "Thi cuối kỳ - Cơ sở dữ liệu",
        subject_name: "Cơ sở dữ liệu",
        start_at: "2025-10-16T14:00:00Z",
        end_at: "2025-10-16T16:00:00Z",
        room: "B203",
        status: "upcoming"
      }
    ];
    setAssignedSessions(mockSessions);
  };

  const loadSessionDetails = (sessionId) => {
    // Mock data cho danh sách thí sinh
    const mockStudents = [
      {
        student_id: 1,
        student_name: "Nguyễn Văn A",
        student_code: "SV001",
        status: "taking", // taking, submitted, disconnected, absent
        start_time: "2025-10-16T08:05:00Z",
        last_activity: "2025-10-16T09:30:00Z",
        violations_count: 2
      },
      {
        student_id: 2,
        student_name: "Trần Thị B",
        student_code: "SV002",
        status: "submitted",
        start_time: "2025-10-16T08:02:00Z",
        submit_time: "2025-10-16T09:45:00Z",
        violations_count: 0
      },
      {
        student_id: 3,
        student_name: "Lê Văn C",
        student_code: "SV003",
        status: "disconnected",
        start_time: "2025-10-16T08:03:00Z",
        last_activity: "2025-10-16T09:15:00Z",
        violations_count: 1
      }
    ];

    // Mock data cho vi phạm
    const mockViolations = [
      {
        id: 1,
        student_id: 1,
        student_name: "Nguyễn Văn A",
        type: "tab_out",
        description: "Rời khỏi tab thi 3 lần",
        created_at: "2025-10-16T08:45:00Z"
      },
      {
        id: 2,
        student_id: 3,
        student_name: "Lê Văn C",
        type: "timeout",
        description: "Mất kết nối internet",
        created_at: "2025-10-16T09:15:00Z"
      }
    ];

    // Mock data cho sự cố
    const mockIncidents = [
      {
        id: 1,
        student_id: 1,
        student_name: "Nguyễn Văn A",
        description: "Máy tính bị treo, yêu cầu khởi động lại",
        resolved: false,
        created_at: "2025-10-16T08:30:00Z"
      }
    ];

    setStudents(mockStudents);
    setViolations(mockViolations);
    setIncidents(mockIncidents);
    setCurrentSession(assignedSessions.find(s => s.session_id === sessionId));
  };

  const handleRecordViolation = async () => {
    try {
      const values = await form.validateFields();
      const newViolation = {
        id: violations.length + 1,
        student_id: selectedStudent.student_id,
        student_name: selectedStudent.student_name,
        type: values.type,
        description: values.description,
        created_at: new Date().toISOString()
      };
      
      setViolations([...violations, newViolation]);
      
      // Cập nhật số lượng vi phạm của sinh viên
      setStudents(students.map(s => 
        s.student_id === selectedStudent.student_id 
          ? { ...s, violations_count: s.violations_count + 1 }
          : s
      ));
      
      message.success("Đã ghi nhận vi phạm");
      setViolationModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error("Lỗi khi ghi nhận vi phạm");
    }
  };

  const handleReportIncident = async () => {
    try {
      const values = await incidentForm.validateFields();
      const newIncident = {
        id: incidents.length + 1,
        student_id: values.student_id,
        student_name: students.find(s => s.student_id === values.student_id)?.student_name,
        description: values.description,
        resolved: false,
        created_at: new Date().toISOString()
      };
      
      setIncidents([...incidents, newIncident]);
      message.success("Đã báo cáo sự cố");
      setIncidentModalOpen(false);
      incidentForm.resetFields();
    } catch (err) {
      message.error("Lỗi khi báo cáo sự cố");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      taking: { color: "processing", text: "Đang thi" },
      submitted: { color: "success", text: "Đã nộp" },
      disconnected: { color: "error", text: "Mất kết nối" },
      absent: { color: "default", text: "Vắng mặt" }
    };
    
    const config = statusConfig[status] || { color: "default", text: status };
    return <Badge status={config.color} text={config.text} />;
  };

  const sessionColumns = [
    { title: "ID", dataIndex: "session_id", width: 60 },
    { title: "Đề thi", dataIndex: "exam_title" },
    { title: "Môn học", dataIndex: "subject_name" },
    { title: "Phòng", dataIndex: "room" },
    {
      title: "Thời gian",
      render: (record) => (
        <div>
          <div>{dayjs(record.start_at).format("HH:mm DD/MM/YYYY")}</div>
          <div>{dayjs(record.end_at).format("HH:mm DD/MM/YYYY")}</div>
        </div>
      )
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => {
        const config = {
          ongoing: { color: "processing", text: "Đang diễn ra" },
          upcoming: { color: "warning", text: "Sắp tới" },
          completed: { color: "success", text: "Hoàn thành" }
        };
        const statusConfig = config[status] || { color: "default", text: status };
        return <Badge status={statusConfig.color} text={statusConfig.text} />;
      }
    },
    {
      title: "Hành động",
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => loadSessionDetails(record.session_id)}
        >
          Giám sát
        </Button>
      )
    }
  ];

  const studentColumns = [
    { title: "Mã SV", dataIndex: "student_code", width: 80 },
    { title: "Họ tên", dataIndex: "student_name" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => getStatusBadge(status)
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "start_time",
      render: (time) => dayjs(time).format("HH:mm:ss")
    },
    {
      title: "Hoạt động cuối",
      dataIndex: "last_activity",
      render: (time) => time ? dayjs(time).format("HH:mm:ss") : "-"
    },
    {
      title: "Vi phạm",
      dataIndex: "violations_count",
      render: (count) => count > 0 ? <Badge count={count} /> : 0
    },
    {
      title: "Hành động",
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type="link"
            icon={<UserOutlined />}
            onClick={() => setMonitoringStudent(record.student_id)}
            size="small"
          >
            Chi tiết
          </Button>
          <Button
            type="link"
            icon={<ExclamationCircleOutlined />}
            onClick={() => {
              setSelectedStudent(record);
              setViolationModalOpen(true);
            }}
            size="small"
          >
            Ghi vi phạm
          </Button>
        </div>
      )
    }
  ];

  const violationColumns = [
    { title: "Sinh viên", dataIndex: "student_name" },
    {
      title: "Loại vi phạm",
      dataIndex: "type",
      render: (type) => {
        const typeLabels = {
          tab_out: "Rời tab",
          multi_device: "Nhiều thiết bị",
          timeout: "Mất kết nối",
          cheating: "Gian lận"
        };
        return typeLabels[type] || type;
      }
    },
    { title: "Mô tả", dataIndex: "description" },
    {
      title: "Thời gian",
      dataIndex: "created_at",
      render: (time) => dayjs(time).format("HH:mm:ss DD/MM")
    }
  ];

  const incidentColumns = [
    { title: "Sinh viên", dataIndex: "student_name" },
    { title: "Mô tả sự cố", dataIndex: "description" },
    {
      title: "Trạng thái",
      dataIndex: "resolved",
      render: (resolved) => (
        <Badge 
          status={resolved ? "success" : "error"} 
          text={resolved ? "Đã xử lý" : "Chưa xử lý"} 
        />
      )
    },
    {
      title: "Thời gian",
      dataIndex: "created_at",
      render: (time) => dayjs(time).format("HH:mm:ss DD/MM")
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      {monitoringStudent ? (
        <StudentMonitorPage
          studentId={monitoringStudent}
          sessionId={currentSession?.session_id}
          onBack={() => setMonitoringStudent(null)}
        />
      ) : (
        <>
          <h2>Giám sát thi</h2>
          
          {!currentSession ? (
            <Card title="Ca thi được phân công">
              <Table
                dataSource={assignedSessions}
                columns={sessionColumns}
                rowKey="session_id"
                pagination={false}
              />
            </Card>
          ) : (
            <div>
              <Card title={`Ca thi: ${currentSession.exam_title}`} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                  <div><strong>Môn:</strong> {currentSession.subject_name}</div>
                  <div><strong>Phòng:</strong> {currentSession.room}</div>
                  <div><strong>Thời gian:</strong> {dayjs(currentSession.start_at).format("HH:mm")} - {dayjs(currentSession.end_at).format("HH:mm DD/MM/YYYY")}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button onClick={() => setCurrentSession(null)}>← Trở về</Button>
                  <Button 
                    type="primary" 
                    icon={<ExclamationCircleOutlined />}
                    onClick={() => setIncidentModalOpen(true)}
                  >
                    Báo cáo sự cố
                  </Button>
                </div>
              </Card>

              <Tabs defaultActiveKey="students">
                <TabPane tab="Danh sách thí sinh" key="students">
                  <Table
                    dataSource={students}
                    columns={studentColumns}
                    rowKey="student_id"
                    pagination={false}
                  />
                </TabPane>
                
                <TabPane tab={`Vi phạm (${violations.length})`} key="violations">
                  <Table
                    dataSource={violations}
                    columns={violationColumns}
                    rowKey="id"
                    pagination={false}
                  />
                </TabPane>
                
                <TabPane tab={`Sự cố (${incidents.length})`} key="incidents">
                  <Table
                    dataSource={incidents}
                    columns={incidentColumns}
                    rowKey="id"
                    pagination={false}
                  />
                </TabPane>
              </Tabs>
            </div>
          )}
        </>
      )}

      {/* Modal ghi nhận vi phạm */}
      <Modal
        title="Ghi nhận vi phạm"
        open={violationModalOpen}
        onOk={handleRecordViolation}
        onCancel={() => setViolationModalOpen(false)}
        okText="Ghi nhận"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Sinh viên">
            <Input value={selectedStudent?.student_name} disabled />
          </Form.Item>
          
          <Form.Item
            label="Loại vi phạm"
            name="type"
            rules={[{ required: true, message: "Chọn loại vi phạm" }]}
          >
            <Select>
              <Option value="tab_out">Rời khỏi tab thi</Option>
              <Option value="multi_device">Sử dụng nhiều thiết bị</Option>
              <Option value="timeout">Mất kết nối</Option>
              <Option value="cheating">Nghi ngờ gian lận</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="Mô tả chi tiết"
            name="description"
            rules={[{ required: true, message: "Nhập mô tả vi phạm" }]}
          >
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal báo cáo sự cố */}
      <Modal
        title="Báo cáo sự cố"
        open={incidentModalOpen}
        onOk={handleReportIncident}
        onCancel={() => setIncidentModalOpen(false)}
        okText="Báo cáo"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={incidentForm}>
          <Form.Item
            label="Sinh viên"
            name="student_id"
            rules={[{ required: true, message: "Chọn sinh viên" }]}
          >
            <Select>
              {students.map(student => (
                <Option key={student.student_id} value={student.student_id}>
                  {student.student_code} - {student.student_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="Mô tả sự cố"
            name="description"
            rules={[{ required: true, message: "Nhập mô tả sự cố" }]}
          >
            <TextArea rows={4} placeholder="Mô tả chi tiết sự cố xảy ra..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}