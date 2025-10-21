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
import ProctorPage from "./pages/ProctorPage";
import RegisterTeacherPage from "./pages/RegisterPage";
import TeacherLayout from "./components/TeacherLayout";
import ShuffleExamPage from "./pages/ShuffleExamPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đăng nhập */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterTeacherPage />} />
        {/* Các trang của giáo viên có layout */}
        <Route
          path="/subjects"
          element={
            <TeacherLayout>
              <SubjectPage />
            </TeacherLayout>
          }
        />
        <Route
          path="/questions"
          element={
            <TeacherLayout>
              <QuestionPage />
            </TeacherLayout>
          }
        />
        <Route
          path="/sessions"
          element={
            <TeacherLayout>
              <ExamSessionPage />
            </TeacherLayout>
          }
        />
        <Route
          path="/exams"
          element={
            <TeacherLayout>
              <ExamPage />
            </TeacherLayout>
          }
        />
        <Route
          path="/results"
          element={
            <TeacherLayout>
              <ExamResultPage />
            </TeacherLayout>
          }
        />
        <Route
          path="/results/:id"
          element={
            <TeacherLayout>
              <ExamResultDetailPage />
            </TeacherLayout>
          }
        />
        <Route
          path="/results/:sessionId/student/:studentId"
          element={
            <TeacherLayout>
              <StudentAttemptDetailPage />
            </TeacherLayout>
          }
        />
        <Route
          path="/shuffle-exam"
          element={
            <TeacherLayout>
              <ShuffleExamPage />
            </TeacherLayout>
          }
        />
       
        <Route path="/proctor" element={<ProctorPage />} />
      </Routes>
      
    </BrowserRouter>
  );
}
