import React from "react";
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BookOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  LogoutOutlined,
  SwapOutlined,
} from "@ant-design/icons";

const { Header, Content } = Layout;
export default function TeacherLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const items = [
    {
      key: "/subjects",
      icon: <BookOutlined style={{ color: "#40a9ff" }} />,
      label: "Môn học",
    },
    {
      key: "/questions",
      icon: <QuestionCircleOutlined style={{ color: "#faad14" }} />,
      label: "Câu hỏi",
    },
    {
      key: "/exams",
      icon: <FileTextOutlined style={{ color: "#13c2c2" }} />,
      label: "Đề thi",
    },
    {
      key: "/shuffle-exam",
      icon: <SwapOutlined style={{ color: "#f759ab" }} />,
      label: "Trộn đề thi",
    },
    {
      key: "/sessions",
      icon: <ClockCircleOutlined style={{ color: "#52c41a" }} />,
      label: "Ca thi",
    },
    {
      key: "/results",
      icon: <BarChartOutlined style={{ color: "#722ed1" }} />,
      label: "Kết quả thi",
    },
  ];

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#fff" }}>
      <Layout style={{ minHeight: "100vh", background: "#fff" }}>
        <Header
          style={{
            background: "#001529",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingInline: 32,
          }}
        >
          <div
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 18,
              whiteSpace: "nowrap",
            }}
          >
            Hệ thống thi trắc nghiệm
          </div>

          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={items}
            onClick={(e) => navigate(e.key)}
            style={{
              flex: 1,
              justifyContent: "center",
              background: "transparent",
              borderBottom: "none",
              fontSize: 16,
            }}
          />

          <div
            onClick={handleLogout}
            style={{
              backgroundColor: "#ff7875",
              color: "white",
              padding: "6px 14px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#ff4d4f")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#ff7875")
            }
          >
            <LogoutOutlined />
            <span>Đăng xuất</span>
          </div>
        </Header>

        <Content
          style={{
            padding: 24,
            width: "100%",
            minHeight: "calc(100vh - 64px)",
            background: "#fff",
          }}
        >
          {children}
        </Content>
      </Layout>
    </div>
  );
}
