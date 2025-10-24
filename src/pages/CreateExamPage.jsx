import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  Input,
  InputNumber,
  Button,
  Steps,
  message,
  Table,
  Tag,
  Divider,
  Space,
  Typography,
  Modal,
} from "antd";
import { useNavigate } from "react-router-dom";
import { ReloadOutlined } from "@ant-design/icons";
import axiosTeacherClient from "../api/axiosTeacherClient";

const { Step } = Steps;
const { Title, Text } = Typography;

export default function CreateExamPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalDistributed, setTotalDistributed] = useState(0);
  const [formValues, setFormValues] = useState(null);
  const [createdExam, setCreatedExam] = useState(null);
  const [replacementModal, setReplacementModal] = useState({
    visible: false,
    questionIndex: null,
    chapterId: null,
    availableQuestions: [],
    loading: false
  });

  // Load danh sách môn học
  const loadSubjects = async () => {
    try {
      const res = await axiosTeacherClient.get("/subjects");
      setSubjects(res.data);
    } catch (error) {
      message.error("Không thể tải danh sách môn học");
    }
  };

  // Load danh sách chương theo môn học
  const loadChapters = async (subjectId) => {
    if (!subjectId) return;
    try {
      const res = await axiosTeacherClient.get(`/subjects/${subjectId}/chapters`);
      setChapters(res.data);
    } catch (error) {
      message.error("Không thể tải danh sách chương");
    }
  };

  // Sinh danh sách câu hỏi preview
  const generatePreviewQuestions = async (values) => {
    setLoading(true);
    try {
      const res = await axiosTeacherClient.post("/exams/generate-preview", {
        subject_id: values.subject_id,
        total_questions: values.total_questions,
        time_limit: values.time_limit,
        chapter_distribution: values.chapter_distribution,
      });
      // Kiểm tra nếu số câu hỏi không khớp
      if (res.data.length !== values.total_questions) {
        message.warning(
          `Chỉ tìm thấy ${res.data.length} câu hỏi trong ngân hàng, ít hơn ${values.total_questions} câu yêu cầu. Có thể do không đủ câu hỏi trong các chương đã chọn.`
        );
      }
      
      setPreviewQuestions(res.data);
      setCurrentStep(1);
    } catch (error) {
      console.error("Error generating preview:", error);
      message.error("Không thể sinh danh sách câu hỏi preview");
    } finally {
      setLoading(false);
    }
  };

  // Lưu đề thi
  const saveExam = async (values) => {
    setLoading(true);
    try {
      const response = await axiosTeacherClient.post("/exams", {
        subject_id: values.subject_id,
        title: values.title,
        duration: values.time_limit,
        description: values.description || "",
        questions: previewQuestions,
      });
      
      // Lưu thông tin đề thi đã tạo
      setCreatedExam({
        ...response.data,
        subject_name: subjects.find(s => s.id === values.subject_id)?.name,
        question_count: previewQuestions.length
      });
      
      message.success("Tạo đề thi thành công!");
      setCurrentStep(2); // Chuyển sang step thành công
    } catch (error) {
      console.error("Error saving exam:", error);
      message.error("Không thể lưu đề thi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleSubjectChange = (subjectId) => {
    form.setFieldsValue({ chapter_distribution: [] });
    setTotalDistributed(0);
    loadChapters(subjectId);
  };

  // Tính tổng số câu hỏi đã phân bố
  const calculateTotalDistributed = (chapterDistribution) => {
    if (!chapterDistribution || chapterDistribution.length === 0) return 0;
    return chapterDistribution.reduce(
      (sum, chapter) => sum + (chapter.question_count || 0), 
      0
    );
  };

  // Cập nhật tổng số câu hỏi khi có thay đổi
  const handleChapterDistributionChange = () => {
    const values = form.getFieldsValue();
    const total = calculateTotalDistributed(values.chapter_distribution);
    setTotalDistributed(total);
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setFormValues(values); // Lưu form values
      await generatePreviewQuestions(values);
    } catch (error) {
      message.error("Vui lòng điền đầy đủ thông tin");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = formValues || await form.validateFields();
      await saveExam(values);
    } catch (error) {
      message.error("Vui lòng kiểm tra lại thông tin");
    }
  };

  // Reset form và quay lại step 0
  const resetForm = () => {
    form.resetFields();
    setPreviewQuestions([]);
    setFormValues(null);
    setCreatedExam(null);
    setCurrentStep(0);
  };

  // Mở modal chọn câu hỏi thay thế
  const openReplacementModal = async (questionIndex, chapterId) => {
    setReplacementModal({
      visible: true,
      questionIndex,
      chapterId,
      availableQuestions: [],
      loading: true
    });

    try {
      console.log("Loading questions for chapter:", chapterId);
      // Lấy danh sách câu hỏi cùng chương
      const res = await axiosTeacherClient.get(`/chapters/${chapterId}/questions`);
      console.log("API response:", res.data);
      const allQuestions = res.data;
      
      // Lọc bỏ các câu hỏi đã được chọn
      const usedQuestionIds = previewQuestions.map(q => q.id);
      console.log("Used question IDs:", usedQuestionIds);
      const availableQuestions = allQuestions.filter(q => !usedQuestionIds.includes(q.id));
      console.log("Available questions:", availableQuestions);
      
      setReplacementModal(prev => ({
        ...prev,
        availableQuestions,
        loading: false
      }));
    } catch (error) {
      console.error("Error loading replacement questions:", error);
      console.error("Error response:", error.response?.data);
      message.error(`Không thể tải câu hỏi thay thế: ${error.response?.data?.message || error.message}`);
      setReplacementModal(prev => ({
        ...prev,
        visible: false,
        loading: false
      }));
    }
  };

  // Thay thế câu hỏi
  const replaceQuestion = (newQuestion) => {
    const newPreviewQuestions = [...previewQuestions];
    newPreviewQuestions[replacementModal.questionIndex] = newQuestion;
    setPreviewQuestions(newPreviewQuestions);
    
    setReplacementModal({
      visible: false,
      questionIndex: null,
      chapterId: null,
      availableQuestions: [],
      loading: false
    });
    
    message.success("Đã thay thế câu hỏi thành công!");
  };

  // Cấu hình cột bảng preview
  const previewColumns = [
    {
      title: "STT",
      dataIndex: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nội dung câu hỏi",
      dataIndex: "content",
      ellipsis: true,
    },
    {
      title: "Chương",
      dataIndex: "chapter_name",
      width: 200,
    },
    {
      title: "Thao tác",
      width: 100,
      render: (_, record, index) => (
        <Button
          size="small"
          onClick={() => openReplacementModal(index, record.chapter_id)}
        >
          Đổi
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Title level={2}>Tạo đề thi mới</Title>
      
      <Steps current={currentStep} style={{ marginBottom: 32 }}>
        <Step title="Cấu hình đề thi" description="Thiết lập thông tin cơ bản" />
        <Step title="Xem trước" description="Kiểm tra danh sách câu hỏi" />
        <Step title="Hoàn thành" description="Lưu đề thi" />
      </Steps>

      <Card>
        {currentStep === 0 && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleNext}
            initialValues={{
              total_questions: 20,
              time_limit: 60,
            }}
          >
            <Form.Item
              label="Môn học"
              name="subject_id"
              rules={[{ required: true, message: "Chọn môn học" }]}
            >
              <Select
                placeholder="Chọn môn học"
                onChange={handleSubjectChange}
                showSearch
                optionFilterProp="children"
              >
                {subjects.map((subject) => (
                  <Select.Option key={subject.id} value={subject.id}>
                    {subject.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Tên đề thi"
              name="title"
              rules={[{ required: true, message: "Nhập tên đề thi" }]}
            >
              <Input placeholder="Nhập tên đề thi" />
            </Form.Item>

            <Form.Item
              label="Mô tả"
              name="description"
            >
              <Input.TextArea rows={3} placeholder="Mô tả đề thi (tùy chọn)" />
            </Form.Item>

            <Space size="large" style={{ width: "100%" }}>
              <Form.Item
                label="Số câu hỏi"
                name="total_questions"
                rules={[{ required: true, message: "Nhập số câu hỏi" }]}
                style={{ flex: 1 }}
              >
                <InputNumber
                  min={1}
                  max={100}
                  style={{ width: "100%" }}
                  placeholder="Số câu hỏi"
                  onChange={() => {
                    setTimeout(handleChapterDistributionChange, 100);
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Thời gian (phút)"
                name="time_limit"
                rules={[{ required: true, message: "Nhập thời gian" }]}
                style={{ flex: 1 }}
              >
                <InputNumber
                  min={1}
                  max={300}
                  style={{ width: "100%" }}
                  placeholder="Thời gian"
                />
              </Form.Item>
            </Space>

            <Form.Item
              label={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Phân bố câu hỏi theo chương</span>
                  <Text type="secondary">
                    Đã phân bố: <Text strong style={{ color: totalDistributed === form.getFieldValue('total_questions') ? '#52c41a' : '#ff4d4f' }}>
                      {totalDistributed}
                    </Text> / {form.getFieldValue('total_questions') || 0}
                  </Text>
                </div>
              }
              name="chapter_distribution"
              rules={[
                { required: true, message: "Cấu hình phân bố chương" },
                {
                  validator: (_, value) => {
                    const totalQuestions = form.getFieldValue('total_questions');
                    const totalDistributed = calculateTotalDistributed(value);
                    
                    if (totalDistributed !== totalQuestions) {
                      return Promise.reject(
                        new Error(`Tổng số câu hỏi trong phân bố (${totalDistributed}) phải bằng số câu hỏi (${totalQuestions})`)
                      );
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Form.List name="chapter_distribution">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div
                        key={key}
                        style={{
                          display: "flex",
                          marginBottom: 8,
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "question_count"]}
                          rules={[{ required: true, message: "Số câu" }]}
                          style={{ width: 120 }}
                        >
                          <InputNumber
                            min={1}
                            placeholder="Số câu"
                            style={{ width: "100%" }}
                            onChange={handleChapterDistributionChange}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "chapter_id"]}
                          rules={[{ required: true, message: "Chọn chương" }]}
                          style={{ flex: 1 }}
                        >
                          <Select placeholder="Chọn chương">
                            {chapters.map((chapter) => (
                              <Select.Option key={chapter.id} value={chapter.id}>
                                {chapter.chapter_number}. {chapter.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                     
                        {fields.length > 1 && (
                          <Button 
                            type="link" 
                            danger 
                            onClick={() => {
                              remove(name);
                              setTimeout(handleChapterDistributionChange, 100);
                            }}
                          >
                            Xóa
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => {
                        add();
                        setTimeout(handleChapterDistributionChange, 100);
                      }}
                      block
                      disabled={chapters.length === 0}
                    >
                      + Thêm chương
                    </Button>
                  </>
                )}
              </Form.List>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Xem trước đề thi
              </Button>
            </Form.Item>
          </Form>
        )}

        {currentStep === 1 && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>Xem trước danh sách câu hỏi</Title>
              <Space direction="vertical" size="small">
                <Text type="secondary">
                  Tổng cộng: <Text strong>{previewQuestions.length}</Text> câu hỏi
                </Text>
                <Text type="secondary">
                  Yêu cầu: <Text strong>{form.getFieldValue('total_questions')}</Text> câu hỏi
                </Text>
                {previewQuestions.length !== form.getFieldValue('total_questions') && (
                  <Text type="warning">
                    Số câu hỏi không đủ với yêu cầu
                  </Text>
                )}
              </Space>
            </div>

            <Table
              dataSource={previewQuestions}
              columns={previewColumns}
              rowKey={(record, index) => `${record.id}-${index}`}
              pagination={{ pageSize: 10 }}
              size="small"
            />

            <Divider />

            <Space>
              <Button onClick={() => {
                setCurrentStep(0);
                setFormValues(null);
              }}>
                Quay lại
              </Button>
              <Button type="primary" onClick={handleSubmit} loading={loading}>
                Tạo đề thi
              </Button>
            </Space>
          </div>
        )}

        {currentStep === 2 && createdExam && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ marginBottom: 32 }}>
              <Title level={2} style={{ color: "#52c41a", marginBottom: 8 }}>
                Tạo đề thi thành công!
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Đề thi đã được lưu vào hệ thống
              </Text>
            </div>

            <Card style={{ marginBottom: 32, textAlign: "left" }}>
              <Title level={4}>Thông tin đề thi</Title>
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong>Tên đề thi:</Text>
                  <Text>{createdExam.title}</Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong>Môn học:</Text>
                  <Text>{createdExam.subject_name}</Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong>Thời gian:</Text>
                  <Text>{createdExam.duration} phút</Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong>Số câu hỏi:</Text>
                  <Text>{createdExam.question_count} câu</Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong>Mã đề thi:</Text>
                  <Text>{createdExam.id}</Text>
                </div>
              </Space>
            </Card>

            <Space size="large">
              <Button size="large" onClick={resetForm}>
                Tạo đề thi mới
              </Button>
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate("/exams")}
              >
                Xem danh sách đề thi
              </Button>
              <Button 
                type="default" 
                size="large"
                icon={<ReloadOutlined />}
                onClick={() => navigate(`/shuffle-exam/${createdExam.id}`)}
              >
                Trộn đề thi
              </Button>
            </Space>
          </div>
        )}
      </Card>

      {/* Modal chọn câu hỏi thay thế */}
      <Modal
        title="Chọn câu hỏi thay thế"
        open={replacementModal.visible}
        onCancel={() => setReplacementModal(prev => ({ ...prev, visible: false }))}
        footer={null}
        width={800}
      >
        {replacementModal.loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Text>Đang tải câu hỏi...</Text>
          </div>
        ) : replacementModal.availableQuestions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Text type="secondary">Không có câu hỏi khác trong chương này</Text>
          </div>
        ) : (
          <div>
            <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
              Chọn câu hỏi thay thế từ cùng chương:
            </Text>
            <Table
              dataSource={replacementModal.availableQuestions}
              columns={[
                {
                  title: "Nội dung",
                  dataIndex: "content",
                  ellipsis: true,
                },
                {
                  title: "Thao tác",
                  width: 100,
                  render: (_, record) => (
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => replaceQuestion(record)}
                    >
                      Chọn
                    </Button>
                  ),
                },
              ]}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
