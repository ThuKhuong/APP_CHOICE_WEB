import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Popconfirm } from "antd";
import axiosClient from "../api/axiosClient";

export default function SubjectPage() {
  const [subjects, setSubjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const loadSubjects = async () => {
    try {
      const res = await axiosClient.get("/subjects");
      setSubjects(res.data);
    } catch (err) {
      message.error("Không tải được danh sách môn học");
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleAddOrEdit = async () => {
    try {
      const values = await form.validateFields();

      if (editMode) {
        await axiosClient.put(`/subjects/${editingId}`, { name: values.name });
        message.success("Cập nhật môn học thành công!");
        form.resetFields();
        setOpen(false);
        setEditMode(false);
        setEditingId(null);
        loadSubjects();
      } else {
        // Thêm môn học mới và lấy ID trả về
        const res = await axiosClient.post("/subjects", { name: values.name });
        message.success("Thêm môn học thành công!");
        form.resetFields();
        setOpen(false);
        setEditMode(false);
        setEditingId(null);
        // Tải lại danh sách môn học
        loadSubjects();
        // Mở modal thêm chương cho môn học vừa tạo
        if (res.data && res.data.subject) {
          setSelectedSubject(res.data.subject);
          setChapterModalOpen(true);
          loadChapters(res.data.subject.id);
        }
      }
    } catch (err) {
      message.error("Lỗi khi lưu môn học");
    }
  };

  const handleEdit = (record) => {
    setEditMode(true);
    setEditingId(record.id);
    form.setFieldsValue({ name: record.name });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/subjects/${id}`);
      message.success("Xóa môn học thành công!");
      loadSubjects();
    } catch {
      message.error("Lỗi khi xóa môn học");
    }
  };

  // Quản lý chương
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [chapterForm] = Form.useForm();
  const [chapterEditMode, setChapterEditMode] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [chapterFormModalOpen, setChapterFormModalOpen] = useState(false);

  const loadChapters = async (subjectId) => {
    try {
      const res = await axiosClient.get(`/subjects/${subjectId}/chapters`);
      setChapters(res.data);
    } catch {
      message.error("Không tải được danh sách chương");
    }
  };

  const openChapterModal = (subject) => {
    setSelectedSubject(subject);
    setChapterModalOpen(true);
    loadChapters(subject.id);
  };

  const handleAddOrEditChapter = async () => {
    try {
      const values = await chapterForm.validateFields();
      if (chapterEditMode) {
        await axiosClient.put(`/chapters/${editingChapterId}`, values);
        message.success("Cập nhật chương thành công!");
      } else {
        await axiosClient.post(
          `/subjects/${selectedSubject.id}/chapters`,
          values
        );
        message.success("Thêm chương thành công!");
      }
      chapterForm.resetFields();
      setChapterEditMode(false);
      setEditingChapterId(null);
      setChapterFormModalOpen(false);
      loadChapters(selectedSubject.id);
    } catch {
      message.error("Lỗi khi lưu chương");
    }
  };

  const handleEditChapter = (record) => {
    setChapterEditMode(true);
    setEditingChapterId(record.id);
    chapterForm.setFieldsValue({
      name: record.name,
      chapter_number: record.chapter_number,
    });
    setChapterFormModalOpen(true);
  };

  const handleDeleteChapter = async (id) => {
    try {
      await axiosClient.delete(`/chapters/${id}`);
      message.success("Xóa chương thành công!");
      loadChapters(selectedSubject.id);
    } catch (err) {
      message.error("Lỗi khi xóa chương");
    }
  };

  const chapterColumns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "Tên chương", dataIndex: "name" },
    { title: "Số chương", dataIndex: "chapter_number" },
    {
      title: "Hành động",
      render: (_, record) => (
        <>
          <Button
            type="link"
            onClick={() => handleEditChapter(record)}
            style={{ paddingLeft: 0, color: "#1677ff" }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleDeleteChapter(record.id)}
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "Tên môn học", dataIndex: "name" },
    {
      title: "Hành động",
      render: (_, record) => (
        <>
          <Button
            type="link"
            onClick={() => handleEdit(record)}
            style={{ paddingLeft: 0, color: "#1677ff" }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
          <Button
            type="link"
            style={{ color: "#52c41a" }}
            onClick={() => openChapterModal(record)}
          >
            Xem chương
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Danh sách môn học</h2>
      <Button
        type="primary"
        onClick={() => {
          setEditMode(false);
          setEditingId(null);
          form.resetFields();
          setOpen(true);
        }}
        style={{ marginBottom: 16 }}
      >
        + Thêm môn học
      </Button>

      <Table dataSource={subjects} columns={columns} rowKey="id" />

      <Modal
        title={editMode ? "Chỉnh sửa môn học" : "Thêm môn học mới"}
        open={open}
        onOk={handleAddOrEdit}
        onCancel={() => setOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Tên môn học"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên môn học" }]}
          >
            <Input placeholder="Nhập tên môn học" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Chương của môn: ${selectedSubject?.name || ""}`}
        open={chapterModalOpen}
        onCancel={() => {
          setChapterModalOpen(false);
          setChapterEditMode(false);
          setEditingChapterId(null);
          setChapterFormModalOpen(false);
          chapterForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Button
          type="primary"
          onClick={() => {
            setChapterEditMode(false);
            setEditingChapterId(null);
            chapterForm.resetFields();
            setChapterFormModalOpen(true);
          }}
          style={{ marginBottom: 16 }}
        >
          + Thêm chương
        </Button>
        <Table
          dataSource={chapters}
          columns={chapterColumns}
          rowKey="id"
          pagination={false}
        />
        {chapterFormModalOpen && (
          <Modal
            title={chapterEditMode ? "Chỉnh sửa chương" : "Thêm chương mới"}
            open={chapterFormModalOpen}
            onOk={handleAddOrEditChapter}
            onCancel={() => {
              setChapterEditMode(false);
              setEditingChapterId(null);
              chapterForm.resetFields();
              setChapterFormModalOpen(false);
            }}
            okText="Lưu"
            cancelText="Hủy"
            destroyOnClose
          >
            <Form layout="vertical" form={chapterForm}>
              <Form.Item
                label="Tên chương"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên chương" },
                ]}
              >
                <Input placeholder="Nhập tên chương" />
              </Form.Item>
              <Form.Item
                label="Số chương"
                name="chapter_number"
                rules={[{ required: true, message: "Vui lòng nhập số chương" }]}
              >
                <Input type="number" placeholder="Nhập số chương" />
              </Form.Item>
            </Form>
          </Modal>
        )}
      </Modal>
    </div>
  );
}
