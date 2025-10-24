import React from "react";
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  // Teacher icons
  BookOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  // Proctor icons
  DashboardOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  // Common icons
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Header, Content } = Layout;

export default function UnifiedLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Lấy thông tin user từ localStorage
  const getUserInfo = () => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  const user = getUserInfo();
  const userRole = user?.role;

  // Menu items cho Teacher
  const teacherItems = [
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

  // Menu items cho Proctor
  const proctorItems = [
    {
      key: "/proctor/dashboard",
      icon: <DashboardOutlined style={{ color: "#40a9ff" }} />,
      label: "Dashboard",
    },
    {
      key: "/proctor/sessions",
      icon: <EyeOutlined style={{ color: "#52c41a" }} />,
      label: "Ca thi được phân công",
    },
    {
      key: "/proctor/violations",
      icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
      label: "Vi phạm",
    },
    {
      key: "/proctor/incidents",
      icon: <WarningOutlined style={{ color: "#ff4d4f" }} />,
      label: "Sự cố",
    },
  ];

  // Xác định menu items dựa trên roles (multi-role support)
  const getMenuItems = () => {
    if (!user) {
      return [];
    }

    // Hỗ trợ cả single role và multi-role
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    
    const menuItems = [];

    // Thêm menu items dựa trên roles
    if (userRoles.includes("teacher")) {
      menuItems.push(...teacherItems);
    }
    if (userRoles.includes("proctor")) {
      menuItems.push(...proctorItems);
    }
    if (userRoles.includes("admin")) {
      // Admin có thể truy cập tất cả
      menuItems.push(...teacherItems, ...proctorItems);
    }

    // Loại bỏ duplicate items
    const uniqueItems = menuItems.filter((item, index, self) => 
      index === self.findIndex(t => t.key === item.key)
    );

    return uniqueItems;
  };

  // Xác định title dựa trên roles (multi-role support)
  const getTitle = () => {
    if (!user) {
      return "Hệ thống thi trắc nghiệm";
    }

    const userRoles = Array.isArray(user.role) ? user.role : [user.role];

    // Nếu có nhiều roles, hiển thị multi-role title
    if (userRoles.length > 1) {
      const roleNames = userRoles.map(role => {
        switch (role) {
          case "teacher": return "Giáo viên";
          case "proctor": return "Giám thị";
          case "admin": return "Quản trị viên";
          default: return role;
        }
      });
      return `Hệ thống thi trắc nghiệm`;
    }

    // Single role title
    switch (userRoles[0]) {
      case "teacher":
        return "Hệ thống thi trắc nghiệm";
      case "proctor":
        return "Dashboard Giám thị";
      case "admin":
        return "Hệ thống thi trắc nghiệm";
      default:
        return "Hệ thống thi trắc nghiệm";
    }
  };

  const items = getMenuItems();

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
            {getTitle()}
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

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* User info */}
            {user && (
              <div style={{ color: "white", display: "flex", alignItems: "center", gap: 8 }}>
                <UserOutlined />
                <span>{user.full_name}</span>
                <span style={{ fontSize: 12, opacity: 0.8 }}>({user.role})</span>
              </div>
            )}

            {/* Logout button */}
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
