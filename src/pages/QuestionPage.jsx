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
  Checkbox,
} from "antd";
import axiosClient from "../api/axiosClient";

export default function QuestionPage() {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form] = Form.useForm();

  //  Lấy danh sách câu hỏi
  const loadQuestions = async () => {
    try {
      const res = await axiosClient.get("/questions");
      setQuestions(res.data);
    } catch {
      message.error("Không tải được danh sách câu hỏi");
    }
  };

  //  Lấy danh sách môn học
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

  // Mở modal thêm mới
  const showModal = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
    form.resetFields();
    // Khởi tạo 4 đáp án mặc định A, B, C, D có thể thêm E, F
    form.setFieldsValue({
      answers: [
        { label: "A", content: "", is_correct: false },
        { label: "B", content: "", is_correct: false },
        { label: "C", content: "", is_correct: false },
        { label: "D", content: "", is_correct: false },
      ],
    });
    setChapters([]);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingQuestion(null);
  };

  //  Tạo hoặc cập nhật câu hỏi
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Đảm bảo tất cả đáp án có label đúng 
      if (values.answers) {
        values.answers = values.answers.map((answer, index) => ({
          ...answer,
          label: String.fromCharCode(65 + index), 
        }));
      }

      // Validation: Kiểm tra có ít nhất 1 đáp án đúng
      const hasCorrectAnswer = values.answers?.some(
        (answer) => answer.is_correct === true
      );
      if (!hasCorrectAnswer) {
        message.error("Phải có ít nhất 1 đáp án đúng!");
        return;
      }

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
      if (err.response?.data?.message) {
        message.error(err.response.data.message);
      } else {
        message.error("Lỗi khi lưu câu hỏi");
      }
    }
  };

  //  Xóa câu hỏi
  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/questions/${id}`);
      message.success("Xóa câu hỏi thành công!");
      loadQuestions();
    } catch {
      message.error("Không thể xóa câu hỏi này");
    }
  };

  // Sửa câu hỏi
  const handleEdit = (record) => {
    setEditingQuestion(record);
    // Format lại dữ liệu để phù hợp với form mới
    const formData = {
      subject_id: record.subject_id,
      chapter_id: record.chapter_id,
      content: record.content,
      answers: record.answers || [
        { label: "A", content: "", is_correct: false },
        { label: "B", content: "", is_correct: false },
        { label: "C", content: "", is_correct: false },
        { label: "D", content: "", is_correct: false },
      ],
    };
    form.setFieldsValue(formData);
    setIsModalOpen(true);
    // Tải chương theo môn học của câu hỏi
    if (record.subject_id) {
      loadChaptersBySubject(record.subject_id);
    }
  };

  // Cấu hình cột bảng
  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "Môn học", dataIndex: "subject_name" },
    { title: "Chương", dataIndex: "chapter_name" },
    { title: "Nội dung", dataIndex: "content" },
    {
      title: "Đáp án đúng",
      render: (_, record) => {
        const correctAnswers =
          record.answers?.filter((a) => a.is_correct) || [];
        if (correctAnswers.length === 0) return "N/A";
        return correctAnswers.map((a) => a.label).join(", ");
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
            name="content"
            rules={[{ required: true, message: "Nhập nội dung câu hỏi" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Đáp án (có thể chọn nhiều đáp án đúng)"
            name="answers"
            rules={[{ required: true, message: "Nhập các đáp án" }]}
          >
            <Form.List name="answers">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => {
                    // Tạo nhãn đáp án
                    const label = String.fromCharCode(65 + name); 
                    return (
                      <div
                        key={key}
                        style={{
                          display: "flex",
                          marginBottom: 8,
                          alignItems: "center",
                        }}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "label"]}
                          style={{ marginRight: 8, width: 60 }}
                          initialValue={label}
                        >
                          <Input
                            value={label}
                            disabled
                            style={{ textAlign: "center" }}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "content"]}
                          style={{ marginRight: 8, flex: 1 }}
                          rules={[
                            { required: true, message: "Nhập nội dung đáp án" },
                          ]}
                        >
                          <Input placeholder="Nội dung đáp án" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "is_correct"]}
                          valuePropName="checked"
                          style={{ marginRight: 8 }}
                          initialValue={false}
                        >
                          <Checkbox>Đúng</Checkbox>
                        </Form.Item>
                        {fields.length > 2 && (
                          <Button type="link" onClick={() => remove(name)}>
                            Xóa
                          </Button>
                        )}
                      </div>
                    );
                  })}
                  {fields.length < 6 && (
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => {
                          const newIndex = fields.length;
                          const newLabel = String.fromCharCode(65 + newIndex);
                          add({
                            label: newLabel,
                            content: "",
                            is_correct: false,
                          });
                        }}
                        block
                      >
                        + Thêm đáp án
                      </Button>
                    </Form.Item>
                  )}
                </>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
