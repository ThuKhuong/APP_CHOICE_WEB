import React, { useState } from "react";
import { Input, Button, Card, Typography, message } from "antd";
import { MailOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import axiosClient from "../api/axiosClient";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      message.success("Đăng nhập thành công!");
      window.location.href = "/subjects";
    } catch (err) {
      message.error("Sai email hoặc mật khẩu");
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

            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
