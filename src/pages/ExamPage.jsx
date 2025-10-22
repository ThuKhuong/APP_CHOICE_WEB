import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Checkbox,
  Popconfirm,
} from "antd";
import axiosClient from "../api/axiosClient";

export default function ExamPage() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [form] = Form.useForm();

  // Load dữ liệu
  const loadData = async () => {
    const ex = await axiosClient.get("/exams");
    setExams(ex.data);
    const sub = await axiosClient.get("/subjects");
    setSubjects(sub.data);
  };

  const loadQuestionsBySubject = async (subjectId) => {
    const res = await axiosClient.get(`/questions/${subjectId}`);
    setQuestions(res.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🟢 Tạo mới
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        subject_id: values.subject_id,
        title: values.title,
        duration: values.duration,
        question_ids: selectedQuestions,
      };

      if (editingExam) {
        // 🔹 Nếu đang chỉnh sửa
        await axiosClient.put(`/exams/${editingExam.id}`, payload);
        message.success("Cập nhật đề thi thành công!");
      } else {
        // 🔹 Nếu đang tạo mới
        await axiosClient.post("/exams", payload);
        message.success("Tạo đề thi thành công!");
      }

      setOpen(false);
      setEditingExam(null);
      form.resetFields();
      setSelectedQuestions([]);
      loadData();
    } catch (err) {
      message.error("Lỗi khi lưu đề thi");
    }
  };

  // 🟢 Xóa
  const handleDelete = async (id) => {
    await axiosClient.delete(`/exams/${id}`);
    message.success("Xóa đề thi thành công!");
    loadData();
  };

  // 🟢 Chỉnh sửa
  const handleEdit = async (record) => {
    setEditingExam(record);
    form.setFieldsValue({
      subject_id: record.subject_id,
      title: record.title,
      duration: record.duration,
    });
    setOpen(true);

    // Tải danh sách câu hỏi thuộc môn học
    await loadQuestionsBySubject(record.subject_id);
    // Tải câu hỏi của đề (nếu có)
    const res = await axiosClient.get(`/exam-questions/${record.id}`);
    setSelectedQuestions(res.data.map((q) => q.question_id));
  };

  // Cấu hình bảng
  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "Tên đề thi", dataIndex: "title" },
    { title: "Môn học", dataIndex: "subject_name" },
    { title: "Thời gian (phút)", dataIndex: "duration" },
    {
      title: "Hành động",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa?"
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

  //  JSX
  return (
    <div style={{ padding: 24 }}>
      <h2>Danh sách đề thi</h2>

      <Button
        type="primary"
        onClick={() => {
          setOpen(true);
          setEditingExam(null);
          form.resetFields();
          setSelectedQuestions([]);
        }}
        style={{ marginBottom: 16 }}
      >
        + Tạo đề thi
      </Button>

      <Table dataSource={exams} columns={columns} rowKey="id" />

      <Modal
        title={editingExam ? "Chỉnh sửa đề thi" : "Tạo đề thi mới"}
        open={open}
        onOk={handleCreate}
        onCancel={() => {
          setOpen(false);
          setEditingExam(null);
        }}
        okText="Lưu"
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Môn học"
            name="subject_id"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Chọn môn học"
              onChange={(v) => {
                setSelectedQuestions([]);
                loadQuestionsBySubject(v);
              }}
            >
              {subjects.map((s) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Tên đề thi"
            name="title"
            rules={[{ required: true }]}
          >
            <Input placeholder="" />
          </Form.Item>

          <Form.Item
            label="Thời gian (phút)"
            name="duration"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={180} />
          </Form.Item>

          <Form.Item label="Chọn câu hỏi">
            <Checkbox.Group
              style={{ width: "100%" }}
              value={selectedQuestions}
              onChange={setSelectedQuestions}
            >
              {questions.map((q) => (
                <div key={q.id}>
                  <Checkbox value={q.id}>
                    {q.content.length > 80
                      ? q.content.slice(0, 80) + "..."
                      : q.content}
                  </Checkbox>
                </div>
              ))}
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
