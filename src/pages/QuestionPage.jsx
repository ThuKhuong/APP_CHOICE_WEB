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
  Card,
  Space,
  Row,
  Col,
} from "antd";
import axiosClient from "../api/axiosClient";

export default function QuestionPage() {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form] = Form.useForm();
  
  // Filter states
  const [filters, setFilters] = useState({
    subjectId: null,
    chapterId: null,
    searchText: '',
  });

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

  // Effect để lọc câu hỏi khi filters thay đổi
  useEffect(() => {
    applyFilters();
  }, [questions, filters]);

  // Function để lọc câu hỏi
  const applyFilters = () => {
    let filtered = [...questions];

    // Lọc theo môn học
    if (filters.subjectId) {
      filtered = filtered.filter(q => q.subject_id === filters.subjectId);
    }

    // Lọc theo chương
    if (filters.chapterId) {
      filtered = filtered.filter(q => q.chapter_id === filters.chapterId);
    }

    // Lọc theo text search
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(q => 
        q.content.toLowerCase().includes(searchLower) ||
        q.subject_name.toLowerCase().includes(searchLower) ||
        q.chapter_name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredQuestions(filtered);
  };

  // Xử lý thay đổi filter
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));

    // Reset chapter filter khi thay đổi subject
    if (key === 'subjectId') {
      setFilters(prev => ({
        ...prev,
        subjectId: value,
        chapterId: null
      }));
      // Load chapters cho subject mới
      if (value) {
        loadChaptersBySubject(value);
      } else {
        setChapters([]);
      }
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      subjectId: null,
      chapterId: null,
      searchText: '',
    });
    setChapters([]);
  };

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

      {/* Filter Section */}
      <Card title="Bộ lọc" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 'bold' }}>Tìm kiếm:</label>
            </div>
            <Input.Search
              placeholder="Tìm theo nội dung, môn học, chương..."
              value={filters.searchText}
              onChange={(e) => handleFilterChange('searchText', e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 'bold' }}>Môn học:</label>
            </div>
            <Select
              placeholder="Chọn môn học"
              style={{ width: '100%' }}
              value={filters.subjectId}
              onChange={(value) => handleFilterChange('subjectId', value)}
              allowClear
            >
              {subjects.map((subject) => (
                <Select.Option key={subject.id} value={subject.id}>
                  {subject.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 'bold' }}>Chương:</label>
            </div>
            <Select
              placeholder="Chọn chương"
              style={{ width: '100%' }}
              value={filters.chapterId}
              onChange={(value) => handleFilterChange('chapterId', value)}
              allowClear
              disabled={!filters.subjectId}
            >
              {chapters.map((chapter) => (
                <Select.Option key={chapter.id} value={chapter.id}>
                  {chapter.chapter_number}. {chapter.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 'bold' }}>Thao tác:</label>
            </div>
            <Space>
              <Button onClick={resetFilters}>
                Xóa bộ lọc
              </Button>
              <Button type="primary" onClick={showModal}>
        + Thêm câu hỏi
      </Button>
            </Space>
          </Col>
        </Row>
        
        {/* Filter Summary */}
        <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
          <Space>
            <span><strong>Kết quả:</strong> {filteredQuestions.length} câu hỏi</span>
            {filters.subjectId && (
              <span>• Môn: {subjects.find(s => s.id === filters.subjectId)?.name}</span>
            )}
            {filters.chapterId && (
              <span>• Chương: {chapters.find(c => c.id === filters.chapterId)?.name}</span>
            )}
            {filters.searchText && (
              <span>• Tìm kiếm: "{filters.searchText}"</span>
            )}
          </Space>
        </div>
      </Card>

      <Table 
        dataSource={filteredQuestions} 
        columns={columns} 
        rowKey="id"
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} câu hỏi`
        }}
      />

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
