import React from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import {
  UserAddOutlined,
  MailOutlined,
  LockOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function RegisterTeacherPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const values = await form.validateFields();
      const res = await axiosClient.post("/auth/register", values);
      message.success("Đăng ký thành công!");
      localStorage.setItem("token", res.data.token);
      navigate("/"); // quay lại login
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Lỗi đăng ký");
    }
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
            Tạo tài khoản để quản lý ngân hàng đề thi và ca thi trực tuyến.
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
    </div>
  );
}
