import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Popconfirm,
  Drawer,
  Badge,
  Checkbox,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  StopOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  PlusOutlined,
  SaveOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axiosAdminClient from "../api/axiosAdminClient";
import axiosClient from "../api/axiosClient";

const { Option } = Select;

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [approveForm] = Form.useForm();
  
  // Modal create/edit user
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm] = Form.useForm();
  
  // Search and filter states
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
    fetchPendingTeachers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosAdminClient.get("/users");
      setUsers(response.data.users || []);
    } catch (error) {
      message.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingTeachers = async () => {
    try {
      const response = await axiosAdminClient.get("/pending-teachers");
      setPendingTeachers(response.data.pendingTeachers || []);
    } catch (error) {
      console.error("Lỗi lấy giáo viên chờ duyệt:", error);
    }
  };

  const handleApproveTeacher = async (teacherId) => {
    try {
      await axiosAdminClient.put(`/approve-teacher/${teacherId}`);
      message.success("Duyệt giáo viên thành công!");
      fetchUsers();
      fetchPendingTeachers();
    } catch (error) {
      message.error("Không thể duyệt giáo viên");
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await axiosAdminClient.put(`/users/${userId}/role`, { role: newRole });
      message.success("Cập nhật quyền thành công!");
      fetchUsers();
    } catch (error) {
      message.error("Không thể cập nhật quyền");
    }
  };

  const handleUpdateStatus = async (userId, status) => {
    try {
      await axiosAdminClient.put(`/users/${userId}/status`, { status });
      message.success("Cập nhật trạng thái thành công!");
      fetchUsers();
    } catch (error) {
      message.error("Không thể cập nhật trạng thái");
    }
  };

  const showUserDetails = (user) => {
    setSelectedUser(user);
    setDrawerVisible(true);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    userForm.resetFields();
    setUserModalVisible(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    userForm.setFieldsValue({
      full_name: user.full_name,
      email: user.email,
      status: user.status,
    });
    
    // Parse role (có thể là string hoặc array)
    let roles = user.role;
    if (typeof roles === 'string') {
      try {
        roles = JSON.parse(roles);
      } catch {
        roles = [roles];
      }
    }
    if (!Array.isArray(roles)) {
      roles = [roles];
    }
    userForm.setFieldValue('roles', roles);
    setUserModalVisible(true);
  };

  const handleSaveUser = async () => {
    try {
      const values = await userForm.validateFields();
      const { full_name, email, password, status, roles } = values;
      
      if (editingUser) {
        // Update existing user
        await axiosAdminClient.put(`/users/${editingUser.id}/role`, { 
          role: Array.isArray(roles) ? roles : [roles] 
        });
        if (status !== undefined) {
          await axiosAdminClient.put(`/users/${editingUser.id}/status`, { status });
        }
        message.success("Cập nhật user thành công!");
      } else {
        // Create new user using admin API
        await axiosAdminClient.post("/users", {
          full_name,
          email,
          password,
          role: Array.isArray(roles) ? roles : [roles],
          status: status !== undefined ? status : 1
        });
        message.success("Tạo user thành công!");
      }
      
      setUserModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error("Không thể lưu user");
    }
  };

  // Filter users based on search and filters
  const getFilteredUsers = () => {
    let filtered = users;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
          user.email.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => {
        let roles = user.role;
        if (typeof roles === "string" && roles.startsWith("[")) {
          try {
            roles = JSON.parse(roles);
          } catch {
            roles = [roles];
          }
        }
        if (!Array.isArray(roles)) {
          roles = [roles];
        }
        return roles.includes(roleFilter);
      });
    }

    // Filter by status
    if (statusFilter !== "all") {
      const statusValue = statusFilter === "active" ? 1 : 0;
      filtered = filtered.filter((user) => user.status === statusValue);
    }

    return filtered;
  };

  const userColumns = [
    {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 80,
      },
    {
      title: "Họ Tên",
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Vai Trò",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const colors = {
          admin: "red",
          teacher: "blue",
          student: "green",
          proctor: "orange",
        };
        
        // Parse role (có thể là string hoặc array hoặc JSON string)
        let roles = role;
        if (typeof roles === 'string' && roles.startsWith('[')) {
          try {
            roles = JSON.parse(roles);
          } catch {
            roles = [roles];
          }
        }
        if (!Array.isArray(roles)) {
          roles = [roles];
        }
        
        return (
          <Space>
            {roles.map((r, index) => (
              <Tag key={index} color={colors[r] || "default"}>
                {r}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          status={status === 1 ? "success" : "default"}
          text={status === 1 ? "Hoạt động" : "Không hoạt động"}
        />
      ),
    },
   
    {
      title: "Hành Động",
      key: "actions",
      width: 250,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditUser(record)}
          >
            Sửa
          </Button>
          <Button
            icon={record.status === 1 ? <StopOutlined /> : <PlayCircleOutlined />}
            size="small"
            danger={record.status === 1}
            onClick={() => handleUpdateStatus(record.id, record.status === 1 ? 0 : 1)}
          >
            {record.status === 1 ? "Vô Hiệu" : "Kích Hoạt"}
          </Button>
        </Space>
      ),
    },
  ];

  const pendingColumns = [
    {
      title: "Họ Tên",
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Hành Động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => handleApproveTeacher(record.id)}
          >
            Duyệt
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn từ chối?"
            onConfirm={() => handleUpdateStatus(record.id, 0)}
          >
            <Button danger icon={<CloseCircleOutlined />}>
              Từ Chối
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <h2>
          <UserOutlined /> Quản Trị Người Dùng
        </h2>
      </div>

      {/* Pending Teachers */}
      {pendingTeachers.length > 0 && (
        <Card
          title={`Giáo Viên Chờ Duyệt (${pendingTeachers.length})`}
          style={{ marginBottom: 24 }}
          extra={
            <Tag color="orange">Cần hành động</Tag>
          }
        >
          <Table
            columns={pendingColumns}
            dataSource={pendingTeachers}
            rowKey="id"
            pagination={false}
          />
        </Card>
      )}

      {/* All Users */}
      <Card 
        title="Danh Sách Người Dùng"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateUser}>
            Tạo User
          </Button>
        }
      >
        {/* Search and Filter Bar */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Lọc theo vai trò"
              value={roleFilter}
              onChange={setRoleFilter}
              allowClear
            >
              <Option value="all">Tất cả vai trò</Option>
              <Option value="student">Sinh Viên</Option>
              <Option value="teacher">Giáo Viên</Option>
              <Option value="proctor">Giám Thị</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Lọc theo trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              style={{ width: "100%" }}
              onClick={() => {
                setSearchText("");
                setRoleFilter("all");
                setStatusFilter("all");
              }}
            >
              Xóa lọc
            </Button>
          </Col>
        </Row>

        <Table
          columns={userColumns}
          dataSource={getFilteredUsers()}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* User Details Drawer */}
      <Drawer
        title="Chi Tiết Người Dùng"
        placement="right"
        width={400}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedUser && (
          <div>
            <p><strong>ID:</strong> {selectedUser.id}</p>
            <p><strong>Họ Tên:</strong> {selectedUser.full_name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Vai Trò:</strong> <Tag>{selectedUser.role}</Tag></p>
            <p><strong>Trạng Thái:</strong>{" "}
              <Badge
                status={selectedUser.status === 1 ? "success" : "default"}
                text={selectedUser.status === 1 ? "Hoạt động" : "Không hoạt động"}
              />
            </p>
          </div>
        )}
      </Drawer>

      {/* Modal Create/Edit User */}
      <Modal
        title={editingUser ? "Sửa User" : "Tạo User Mới"}
        open={userModalVisible}
        onOk={handleSaveUser}
        onCancel={() => {
          setUserModalVisible(false);
          setEditingUser(null);
          userForm.resetFields();
        }}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        <Form form={userForm} layout="vertical">
          <Form.Item
            name="full_name"
            label="Họ Tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" }
            ]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật Khẩu"
              rules={[{ required: !editingUser, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            name="roles"
            label="Vai Trò (có thể chọn nhiều)"
            rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 vai trò" }]}
          >
            <Checkbox.Group>
              <Space direction="vertical">
                <Checkbox value="student">Sinh Viên</Checkbox>
                <Checkbox value="teacher">Giáo Viên</Checkbox>
                <Checkbox value="proctor">Giám Thị</Checkbox>
                <Checkbox value="admin">Admin</Checkbox>
              </Space>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng Thái"
          >
            <Select>
              <Option value={1}>Hoạt động</Option>
              <Option value={0}>Không hoạt động</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

