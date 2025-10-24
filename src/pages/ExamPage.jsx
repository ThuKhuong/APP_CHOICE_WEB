import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Checkbox,
  message,
  Popconfirm,
} from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axiosTeacherClient from "../api/axiosTeacherClient";

export default function ExamPage() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Load dữ liệu
  const loadData = async () => {
    const ex = await axiosTeacherClient.get("/exams");
    setExams(ex.data);
    const sub = await axiosTeacherClient.get("/subjects");
    setSubjects(sub.data);
  };

  const loadQuestionsBySubject = async (subjectId) => {
    const res = await axiosTeacherClient.get(`/questions/${subjectId}`);
    setQuestions(res.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Tạo mới
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      
      if (selectedQuestions.length === 0) {
        message.error("Vui lòng chọn ít nhất một câu hỏi");
        return;
      }

      const payload = {
        subject_id: values.subject_id,
        title: values.title,
        duration: values.duration,
        question_ids: selectedQuestions,
      };

      if (editingExam) {
        await axiosTeacherClient.put(`/exams/${editingExam.id}`, payload);
        message.success("Cập nhật đề thi thành công!");
      } else {
        await axiosTeacherClient.post("/exams", payload);
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

  // Xóa
  const handleDelete = async (id) => {
    await axiosTeacherClient.delete(`/exams/${id}`);
    message.success("Xóa đề thi thành công!");
    loadData();
  };

  // Chỉnh sửa
  const handleEdit = async (record) => {
    setEditingExam(record);
    form.setFieldsValue({
      subject_id: record.subject_id,
      title: record.title,
      duration: record.duration,
    });
    
    // Load câu hỏi của môn học
    await loadQuestionsBySubject(record.subject_id);
    
    // Load câu hỏi đã chọn (cần implement API)
    setSelectedQuestions([]);
    
    setOpen(true);
  };

  // Cấu hình cột
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "Tên đề thi",
      dataIndex: "title",
    },
    {
      title: "Môn học",
      dataIndex: "subject_name",
    },
    {
      title: "Thời gian (phút)",
      dataIndex: "duration",
    },
    {
      title: "Thao tác",
      width: 300,
      render: (_, record) => (
        <>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => navigate(`/shuffle-exam/${record.id}`)}
          >
            Trộn đề
          </Button>
          <Button
            type="link"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa đề thi này?"
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
      <h2>Danh sách đề thi</h2>

      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/create-exam")}
        >
          Tạo đề thi mới
        </Button>
      </Space>

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
                  <br />
                </div>
              ))}
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}