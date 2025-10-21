import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Select,
  message,
  Form,
  Popconfirm,
} from "antd";
import axiosClient from "../api/axiosClient";

export default function QuestionPage() {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form] = Form.useForm();

  // 🔹 Lấy danh sách câu hỏi
  const loadQuestions = async () => {
    try {
      const res = await axiosClient.get("/questions");
      setQuestions(res.data);
    } catch {
      message.error("Không tải được danh sách câu hỏi");
    }
  };

  // 🔹 Lấy danh sách môn học
  const loadSubjects = async () => {
    const res = await axiosClient.get("/subjects");
    setSubjects(res.data);
  };

  // Lấy danh sách chương theo môn học
  const loadChaptersBySubject = async (subjectId) => {
    const res = await axiosClient.get(`/subjects/${subjectId}/chapters`);
    setChapters(res.data);
  };

  useEffect(() => {
    loadQuestions();
    loadSubjects();
  }, []);

  // 🔹 Mở modal thêm mới
  const showModal = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
    form.resetFields();
    setChapters([]);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingQuestion(null);
  };

  // 🔹 Tạo hoặc cập nhật câu hỏi
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (editingQuestion) {
        // Nếu đang sửa
        await axiosClient.put(`/questions/${editingQuestion.id}`, values);
        message.success("Cập nhật câu hỏi thành công!");
      } else {
        // Nếu đang thêm mới
        await axiosClient.post("/questions", values);
        message.success("Thêm câu hỏi thành công!");
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingQuestion(null);
      loadQuestions();
    } catch (err) {
      message.error("Lỗi khi lưu câu hỏi");
    }
  };

  // 🔹 Xóa câu hỏi
  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/questions/${id}`);
      message.success("Xóa câu hỏi thành công!");
      loadQuestions();
    } catch {
      message.error("Không thể xóa câu hỏi này");
    }
  };

  // 🔹 Sửa câu hỏi
  const handleEdit = (record) => {
    setEditingQuestion(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
    // Tải chương theo môn học của câu hỏi
    if (record.subject_id) {
      loadChaptersBySubject(record.subject_id);
    }
  };

  // 🔹 Cấu hình cột bảng
  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "Môn học", dataIndex: "subject_name" },
    { title: "Chương", dataIndex: "chapter_name" },
    { title: "Nội dung", dataIndex: "text" },
    { title: "Đáp án đúng", dataIndex: "correct_choice" },
    {
      title: "Hành động",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa câu hỏi?"
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
      <h2>Ngân hàng câu hỏi</h2>

      <Button type="primary" onClick={showModal} style={{ marginBottom: 16 }}>
        + Thêm câu hỏi
      </Button>

      <Table dataSource={questions} columns={columns} rowKey="id" />

      <Modal
        title={editingQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Môn học"
            name="subject_id"
            rules={[{ required: true, message: "Chọn môn học" }]}
          >
            <Select
              onChange={(subjectId) => {
                form.setFieldsValue({ chapter_id: undefined });
                loadChaptersBySubject(subjectId);
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
            label="Chương"
            name="chapter_id"
            rules={[{ required: true, message: "Chọn chương" }]}
          >
            <Select placeholder="Chọn chương">
              {chapters.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.chapter_number}. {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Nội dung câu hỏi"
            name="text"
            rules={[{ required: true, message: "Nhập nội dung câu hỏi" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Đáp án A"
            name="choice_a"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Đáp án B"
            name="choice_b"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Đáp án C"
            name="choice_c"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Đáp án D"
            name="choice_d"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Đáp án đúng"
            name="correct_choice"
            rules={[{ required: true, message: "Chọn đáp án đúng" }]}
          >
            <Select>
              <Select.Option value="A">A</Select.Option>
              <Select.Option value="B">B</Select.Option>
              <Select.Option value="C">C</Select.Option>
              <Select.Option value="D">D</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
