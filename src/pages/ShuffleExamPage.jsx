import React, { useEffect, useState } from "react";
import { Card, Form, Select, Button, message, Table, Tag } from "antd";
import axiosClient from "../api/axiosClient";

const { Option } = Select;

export default function ShuffleExamPage() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const res = await axiosClient.get("/exams");
      setExams(res.data);
    } catch (err) {
      message.error("Không tải được danh sách đề thi");
    }
  };

  const loadExamQuestions = async (examId) => {
    try {
      const res = await axiosClient.get(`/exams/${examId}`);
      setExamQuestions(res.data.questions || []);
      setSelectedExam(res.data);
    } catch (err) {
      message.error("Không tải được câu hỏi của đề thi");
    }
  };

  const handleShuffleExam = async () => {
    if (!selectedExam) {
      message.warning("Vui lòng chọn đề thi");
      return;
    }

    setLoading(true);
    try {
      // Trộn thứ tự câu hỏi
      const shuffledQuestions = [...examQuestions].sort(
        () => Math.random() - 0.5
      );
      const questionIds = shuffledQuestions.map((q) => q.id);

      await axiosClient.put(`/exams/${selectedExam.id}`, {
        title: selectedExam.title,
        duration: selectedExam.duration,
        question_ids: questionIds,
      });

      message.success("Trộn đề thi thành công!");
      loadExamQuestions(selectedExam.id); // Reload để hiển thị thứ tự mới
    } catch (err) {
      message.error("Lỗi khi trộn đề thi");
    } finally {
      setLoading(false);
    }
  };

  const handleExamChange = (examId) => {
    if (examId) {
      loadExamQuestions(examId);
    } else {
      setSelectedExam(null);
      setExamQuestions([]);
    }
  };

  const questionColumns = [
    {
      title: "STT",
      dataIndex: "order_index",
      width: 60,
    },
    {
      title: "Câu hỏi",
      dataIndex: "content",
      ellipsis: true,
    },
    {
      title: "Đáp án A",
      render: (_, record) =>
        record.answers?.find((a) => a.label === "A")?.content || "",
      width: 120,
      ellipsis: true,
    },
    {
      title: "Đáp án B",
      render: (_, record) =>
        record.answers?.find((a) => a.label === "B")?.content || "",
      width: 120,
      ellipsis: true,
    },
    {
      title: "Đáp án C",
      render: (_, record) =>
        record.answers?.find((a) => a.label === "C")?.content || "",
      width: 120,
      ellipsis: true,
    },
    {
      title: "Đáp án D",
      render: (_, record) =>
        record.answers?.find((a) => a.label === "D")?.content || "",
      width: 120,
      ellipsis: true,
    },
    {
      title: "Đáp án đúng",
      render: (_, record) => {
        const correctAnswer = record.answers?.find((a) => a.is_correct);
        return correctAnswer ? (
          <Tag color="green">{correctAnswer.label}</Tag>
        ) : (
          <Tag>N/A</Tag>
        );
      },
      width: 100,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2> Trộn đề thi</h2>

      <Card title="Chọn đề thi để trộn" style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical">
          <Form.Item label="Đề thi" name="exam_id">
            <Select
              placeholder="Chọn đề thi cần trộn"
              onChange={handleExamChange}
              showSearch
              optionFilterProp="children"
            >
              {exams.map((exam) => (
                <Option key={exam.id} value={exam.id}>
                  {exam.title} - {exam.subject_name} ({exam.duration} phút)
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedExam && (
            <div
              style={{
                marginBottom: 16,
                padding: 16,
                background: "#f5f5f5",
                borderRadius: 8,
              }}
            >
              <div>
                <strong>Tiêu đề:</strong> {selectedExam.title}
              </div>
              <div>
                <strong>Thời gian:</strong> {selectedExam.duration} phút
              </div>
              <div>
                <strong>Số câu hỏi:</strong> {examQuestions.length}
              </div>
            </div>
          )}

          <Button
            type="primary"
            onClick={handleShuffleExam}
            loading={loading}
            disabled={!selectedExam}
            style={{ marginTop: 16 }}
          >
            Trộn thứ tự câu hỏi
          </Button>
        </Form>
      </Card>

      {examQuestions.length > 0 && (
        <Card title={` Danh sách câu hỏi (${examQuestions.length} câu)`}>
          <Table
            dataSource={examQuestions}
            columns={questionColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        </Card>
      )}
    </div>
  );
}
