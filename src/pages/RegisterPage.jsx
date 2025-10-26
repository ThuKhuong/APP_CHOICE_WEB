import React from "react";
import { Form, Input, Button, Card, Typography, message, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import {
  UserAddOutlined,
  MailOutlined,
  LockOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function RegisterTeacherPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [successModalVisible, setSuccessModalVisible] = React.useState(false);
  const [registeredUser, setRegisteredUser] = React.useState(null);

  const handleRegister = async () => {
    try {
      const values = await form.validateFields();
      const res = await axiosClient.post("/auth/register-teacher", values);
      setRegisteredUser(res.data.user);
      setSuccessModalVisible(true);
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Lỗi đăng ký");
    }
  };

  const handleModalOk = () => {
    setSuccessModalVisible(false);
    form.resetFields();
    navigate("/"); // quay lại login
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #e6f7ff, #f0f5ff)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          overflow: "hidden",
          width: 800,
          maxWidth: "90%",
          minHeight: 420,
        }}
      >
        {/* Cột trái: ảnh + mô tả */}
        <div
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #1677ff, #69c0ff)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            flexDirection: "column",
            padding: 24,
          }}
        >
          <img src="/exam.png" alt="Logo" style={{ width: 150 }} />
          <Title level={3} style={{ color: "white", marginBottom: 8 }}>
            Đăng ký tài khoản giáo viên
          </Title>
          <Text style={{ color: "#f0f5ff", textAlign: "center" }}>
            Tạo tài khoản giáo viên để quản lý ngân hàng đề thi và ca thi trực tuyến.
            <br />
            <strong>Tài khoản sẽ được kích hoạt sau khi quản trị viên duyệt.</strong>
          </Text>
        </div>

        {/* Cột phải: form đăng ký */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 32,
          }}
        >
          <Card
            bordered={false}
            style={{
              width: "100%",
              maxWidth: 320,
              boxShadow: "none",
            }}
          >
            <Title level={4} style={{ textAlign: "center", marginBottom: 24 }}>
              ĐĂNG KÝ
            </Title>

            <Form layout="vertical" form={form}>
              <Form.Item
                label="Họ và tên"
                name="full_name"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input
                  prefix={<UserAddOutlined />}
                  placeholder="Nhập họ và tên"
                />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Nhập email"
                />
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="••••••"
                />
              </Form.Item>

              <Button
                type="primary"
                block
                onClick={handleRegister}
                style={{
                  height: 40,
                  fontWeight: 500,
                  borderRadius: 6,
                  marginBottom: 12,
                }}
              >
                Đăng ký
              </Button>

              <Button
                type="default"
                block
                onClick={() => navigate("/")}
                style={{
                  height: 40,
                  borderRadius: 6,
                }}
              >
                Đã có tài khoản? Đăng nhập
              </Button>
            </Form>
          </Card>
        </div>
      </div>

      {/* Modal thông báo đăng ký thành công */}
      <Modal
        title={
          <div style={{ textAlign: "center" }}>
            <CheckCircleOutlined 
              style={{ 
                fontSize: "48px", 
                color: "#52c41a",
                marginBottom: "16px",
                display: "block"
              }} 
            />
            <Title level={4} style={{ margin: 0 }}>
              Đăng ký thành công!
            </Title>
          </div>
        }
        open={successModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalOk}
        footer={
          <Button type="primary" block onClick={handleModalOk}>
            Về trang đăng nhập
          </Button>
        }
        centered
        width={500}
      >
        <div style={{ padding: "20px 0", textAlign: "center" }}>
          <p style={{ fontSize: "16px", marginBottom: "20px" }}>
            Tài khoản của bạn đã được tạo thành công!
          </p>
          
          <div style={{ 
            background: "#fff7e6", 
            border: "1px solid #ffd591",
            padding: "16px", 
            borderRadius: "8px" 
          }}>
            <p style={{ margin: 0, color: "#d46b08" }}>
              <strong>Tài khoản đang chờ quản trị viên duyệt</strong>
            </p>
            <p style={{ margin: "8px 0 0 0", color: "#666", fontSize: "14px" }}>
              Bạn sẽ nhận được thông báo khi tài khoản được kích hoạt. 
              Sau đó bạn có thể đăng nhập để sử dụng hệ thống.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
