import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SubjectPage from "./pages/SubjectPage";
import QuestionPage from "./pages/QuestionPage";
import ExamPage from "./pages/ExamPage";
import ExamSessionPage from "./pages/ExamSessionPage";
import ExamResultPage from "./pages/ExamResultPage";
import ExamResultDetailPage from "./pages/ExamResultDetailPage";
import StudentAttemptDetailPage from "./pages/StudentAttemptDetailPage";
import ProctorDashboard from "./pages/ProctorDashboard";
import ProctorSessionsPage from "./pages/ProctorSessionsPage";
import ProctorViolationsPage from "./pages/ProctorViolationsPage";
import ProctorIncidentsPage from "./pages/ProctorIncidentsPage";
import RegisterTeacherPage from "./pages/RegisterPage";
import UnifiedLayout from "./components/UnifiedLayout";
import RoleGuard from "./components/RoleGuard";
import ShuffleExamPage from "./pages/ShuffleExamPage";
import CreateExamPage from "./pages/CreateExamPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đăng nhập */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterTeacherPage />} />
        {/* Các trang của giáo viên có layout */}
        <Route
          path="/subjects"
          element={
            <RoleGuard allowedRoles={["teacher", "proctor"]}>
              <UnifiedLayout>
                <SubjectPage />
              </UnifiedLayout>
            </RoleGuard>
          }
        />
        <Route
          path="/questions"
          element={
            <RoleGuard allowedRoles={["teacher", "proctor"]}>
              <UnifiedLayout>
                <QuestionPage />
              </UnifiedLayout>
            </RoleGuard>
          }
        />
        <Route
          path="/sessions"
          element={
            <RoleGuard allowedRoles={["teacher", "proctor"]}>
              <UnifiedLayout>
                <ExamSessionPage />
              </UnifiedLayout>
            </RoleGuard>
          }
        />
        <Route
          path="/exams"
          element={
            <RoleGuard allowedRoles={["teacher", "proctor"]}>
              <UnifiedLayout>
                <ExamPage />
              </UnifiedLayout>
            </RoleGuard>
          }
        />
        <Route
          path="/results"
          element={
            <RoleGuard allowedRoles={["teacher", "proctor"]}>
              <UnifiedLayout>
                <ExamResultPage />
              </UnifiedLayout>
            </RoleGuard>
          }
        />
        <Route
          path="/results/:id"
          element={
            <RoleGuard allowedRoles={["teacher", "proctor"]}>
              <UnifiedLayout>
                <ExamResultDetailPage />
              </UnifiedLayout>
            </RoleGuard>
          }
        />
        <Route
          path="/results/:sessionId/student/:studentId"
          element={
            <RoleGuard allowedRoles={["teacher", "proctor"]}>
              <UnifiedLayout>
                <StudentAttemptDetailPage />
              </UnifiedLayout>
            </RoleGuard>
          }
        />
        <Route
          path="/shuffle-exam/:examId"
          element={
            <RoleGuard allowedRoles={["teacher", "proctor"]}>
              <UnifiedLayout>
                <ShuffleExamPage />
              </UnifiedLayout>
            </RoleGuard>
          }
        />
        <Route
          path="/create-exam"
          element={
            <RoleGuard allowedRoles={["teacher", "proctor"]}>
              <UnifiedLayout>
                <CreateExamPage />
              </UnifiedLayout>
            </RoleGuard>
          }
        />
        
        {/* Proctor Routes với UnifiedLayout */}
        <Route
          path="/proctor/dashboard"
          element={
            <RoleGuard allowedRoles={["proctor", "teacher"]}>
              <UnifiedLayout>
                <ProctorDashboard />
              </UnifiedLayout>
            </RoleGuard>
          }
        />
        <Route
          path="/proctor/sessions"
          element={
            <RoleGuard allowedRoles={["proctor", "teacher"]}>
              <UnifiedLayout>
                <ProctorSessionsPage />
              </UnifiedLayout>
            </RoleGuard>
          }
        />
        <Route
          path="/proctor/violations"
          element={
            <RoleGuard allowedRoles={["proctor", "teacher"]}>
              <UnifiedLayout>
                <ProctorViolationsPage />
              </UnifiedLayout>
            </RoleGuard>
          }
        />
        <Route
          path="/proctor/incidents"
          element={
            <RoleGuard allowedRoles={["proctor", "teacher"]}>
              <UnifiedLayout>
                <ProctorIncidentsPage />
              </UnifiedLayout>
            </RoleGuard>
          }
        />
        
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleGuard allowedRoles={["admin"]}>
              <UnifiedLayout>
                <div style={{ padding: 24 }}>
                  <h1>Admin Dashboard</h1>
                  <p>Chào mừng đến với trang quản trị viên!</p>
                </div>
              </UnifiedLayout>
            </RoleGuard>
          }
        />
      </Routes>
      
    </BrowserRouter>
  );
}
