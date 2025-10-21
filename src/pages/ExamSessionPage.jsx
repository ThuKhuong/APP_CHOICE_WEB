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
import dayjs from "dayjs";

export default function ExamSessionPage() {
  const [sessions, setSessions] = useState([]);
  const [exams, setExams] = useState([]);
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

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
  }, []);

  // Tạo hoặc Cập nhật ca thi
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
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
        await axiosClient.post("/sessions", payload);
        message.success("Tạo ca thi thành công!");
      }
      setOpen(false);
      setEditingSession(null);
      form.resetFields();
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

  // 🟢 Cột bảng
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
            <Select placeholder="Chọn đề thi">
              {exams.map((e) => (
                <Select.Option key={e.id} value={e.id}>
                  {e.title} ({e.subject_name})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Khoảng thời gian"
            name="time"
            rules={[{ required: true }]}
          >
            <DatePicker.RangePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>

          <Form.Item label="Mã truy cập (tùy chọn)" name="access_code">
            <Input placeholder="Ví dụ: ABC123" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
