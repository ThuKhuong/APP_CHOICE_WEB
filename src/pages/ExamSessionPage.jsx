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
} from "antd";
import axiosClient from "../api/axiosClient";
import ProctorSelector from "../components/ProctorSelector";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

export default function ExamSessionPage() {
  const [sessions, setSessions] = useState([]);
  const [exams, setExams] = useState([]);
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [selectedProctors, setSelectedProctors] = useState([]);

  // Tải dữ liệu
  const loadData = async () => {
    try {
      const ses = await axiosClient.get("/sessions");
      setSessions(ses.data);
      const ex = await axiosClient.get("/exams");
      setExams(ex.data);
    } catch (err) {
      message.error("Không tải được dữ liệu");
    }
  };

  useEffect(() => {
    loadData();

    // Cập nhật realtime
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

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
    let startTime = form.getFieldValue("time")?.[0];
    if (type === "exam" && value) examId = value;
    if (type === "time" && value && value[0]) startTime = value[0];
    const selectedExam = exams.find((e) => e.id === examId);
    if (selectedExam && selectedExam.duration && startTime) {
      const endTime = startTime.add(selectedExam.duration, "minutes");
      form.setFieldsValue({ time: [startTime, endTime] });
    }
  };

  // Tạo hoặc cập nhật ca thi
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Kiểm tra thời gian bắt đầu phải trước thời gian kết thúc
      if (values.time[0].isAfter(values.time[1])) {
        message.error("Thời gian bắt đầu phải trước thời gian kết thúc!");
        return;
      }
      // Kiểm tra thời gian thi tối thiểu 1 phút
      const duration = values.time[1].diff(values.time[0], "minutes");
      if (duration < 1) {
        message.error("Thời gian thi phải ít nhất 1 phút!");
        return;
      }

      // Tạo mã truy cập random nếu không nhập
      const randomCode = () =>
        Math.random().toString(36).substring(2, 8).toUpperCase();

      const payload = {
        exam_id: values.exam_id,
        start_at: values.time[0].toISOString(),
        end_at: values.time[1].toISOString(),
        access_code:
          values.access_code && values.access_code.trim()
            ? values.access_code
            : randomCode(),
      };

      if (editingSession) {
        await axiosClient.put(`/sessions/${editingSession.id}`, payload);
        message.success("Cập nhật ca thi thành công!");
      } else {
        const sessionResponse = await axiosClient.post("/sessions", payload);
        message.success("Tạo ca thi thành công!");
        
        // Phân công giám thị nếu có
        if (selectedProctors.length > 0) {
          try {
            await axiosClient.post(`/sessions/${sessionResponse.data.id}/proctors`, {
              proctorIds: selectedProctors.map(p => p.id)
            });
            message.success("Phân công giám thị thành công!");
          } catch (err) {
            console.error("Error assigning proctors:", err);
            message.warning("Ca thi đã tạo nhưng phân công giám thị thất bại");
          }
        }
      }
      
      setOpen(false);
      setEditingSession(null);
      form.resetFields();
      setSelectedProctors([]);
      loadData();
    } catch (err) {
      message.error("Lỗi khi lưu ca thi");
    }
  };

  //  Xóa ca thi
  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/sessions/${id}`);
      message.success("Xóa ca thi thành công!");
      loadData();
    } catch {
      message.error("Không thể xóa ca thi này");
    }
  };

  //  Sửa ca thi
  const handleEdit = (record) => {
    setEditingSession(record);
    setOpen(true);

    // Điền lại dữ liệu form
    form.setFieldsValue({
      exam_id: record.exam_id,
      time: [dayjs(record.start_at), dayjs(record.end_at)],
      access_code: record.access_code,
    });
  };

  //  Cột bảng
  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "Đề thi", dataIndex: "exam_title" },
    { title: "Môn học", dataIndex: "subject_name" },
    {
      title: "Thời gian",
      render: (r) =>
        `${dayjs(r.start_at).format("HH:mm DD/MM")} → ${dayjs(r.end_at).format(
          "HH:mm DD/MM"
        )}`,
    },
    { title: "Mã truy cập", dataIndex: "access_code" },
    {
      title: "Trạng thái",
      render: (record) => {
        const now = dayjs();
        const startTime = dayjs(record.start_at);
        const endTime = dayjs(record.end_at);

        if (now.isBefore(startTime)) {
          return <span style={{ color: "#faad14" }}>Sắp diễn ra</span>;
        } else if (now.isBetween(startTime, endTime)) {
          return <span style={{ color: "#52c41a" }}>Đang diễn ra</span>;
        } else {
          return <span style={{ color: "#d9d9d9" }}>Đã kết thúc</span>;
        }
      },
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa ca thi này?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Danh sách ca thi</h2>

      <Button
        type="primary"
        onClick={() => {
          setOpen(true);
          setEditingSession(null);
          form.resetFields();
        }}
        style={{ marginBottom: 16 }}
      >
        + Tạo ca thi
      </Button>

      <Table dataSource={sessions} columns={columns} rowKey="id" />

      <Modal
        title={editingSession ? "Chỉnh sửa ca thi" : "Tạo ca thi mới"}
        open={open}
        onOk={handleSave}
        onCancel={() => {
          setOpen(false);
          setEditingSession(null);
        }}
        okText="Lưu"
        cancelText="Hủy"
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
            label="Khoảng thời gian"
            name="time"
            rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
          >
            <DatePicker.RangePicker
              showTime={{ format: "HH:mm" }}
              format="YYYY-MM-DD HH:mm"
              disabledDate={disabledDate}
              disabledTime={disabledTime}
              placeholder={[
                "Thời gian bắt đầu",
                "Thời gian kết thúc (tự động)",
              ]}
              style={{ width: "100%" }}
              onChange={(v) => {
                handleAutoTime(v, "time");
              }}
            />
          </Form.Item>

          <Form.Item label="Mã truy cập" name="access_code">
            <Input placeholder="Bỏ trống để tự động tạo mã nhé Tlinh" />
          </Form.Item>

          <Form.Item label="Phân công giám thị">
            <ProctorSelector
              value={selectedProctors}
              onChange={setSelectedProctors}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
