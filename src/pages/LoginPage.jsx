import React, { useState } from "react";
import { Input, Button, Card, Typography, message, Alert } from "antd";
import { MailOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import axiosClient from "../api/axiosClient";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      message.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    setError(""); // Clear previous error
    try {
      const res = await axiosClient.post("/auth/login", { email, password });
      
      // Lưu token và user data vào localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      message.success("Đăng nhập thành công!");
      
      // Redirect dựa trên roles (multi-role support)
      const user = res.data.user;
      const userRoles = Array.isArray(user.role) ? user.role : [user.role];
      
      // Ưu tiên redirect theo thứ tự: admin > proctor > teacher
      if (userRoles.includes("admin")) {
        window.location.href = "/admin/dashboard";
      } else if (userRoles.includes("proctor")) {
        window.location.href = "/proctor/dashboard";
      } else if (userRoles.includes("teacher")) {
        window.location.href = "/subjects";
      } else {
        window.location.href = "/subjects";
      }
    } catch (err) {
      console.error("Login error:", err);
      
      // Hiển thị lỗi nhanh chóng
      let errorMessage = "Đăng nhập thất bại";
      
      if (err.response) {
        // Lỗi từ server (401, 403, 404, 500, etc.)
        errorMessage = err.response.data?.message || "Đăng nhập thất bại";
      } else if (err.request) {
        // Lỗi network
        errorMessage = "Không thể kết nối đến server";
      } else {
        // Lỗi khác
        errorMessage = "Có lỗi xảy ra";
      }
      
      // Hiển thị lỗi ngay lập tức
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
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
          minHeight: 400,
        }}
      >
        {/* Cột trái: ảnh minh họa */}
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
            Hệ thống thi trắc nghiệm
          </Title>
          <Text style={{ color: "#f0f5ff", textAlign: "center" }}>
            Giúp quản lý đề thi, ca thi và kết quả nhanh chóng, tiện lợi.
          </Text>
        </div>

        {/* Cột phải: form đăng nhập */}
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
              ĐĂNG NHẬP
            </Title>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(""); // Clear error when typing
              }}
              style={{ marginBottom: 12 }}
            />
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(""); // Clear error when typing
              }}
              style={{ marginBottom: 20 }}
            />
            <Button
              type="primary"
              block
              icon={<LoginOutlined />}
              loading={loading}
              onClick={handleLogin}
              style={{
                height: 40,
                fontWeight: 500,
                borderRadius: 6,
                marginBottom: 12,
              }}
            >
              Đăng nhập
            </Button>
            <Button
              type="default"
              block
              onClick={() => (window.location.href = "/register")}
              style={{
                height: 40,
                borderRadius: 6,
              }}
            >
              Đăng ký
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
