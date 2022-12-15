import { Routes, Route } from "react-router-dom";
import HomePage from "./HomePage.js";
import LoginPage from "./LoginPage.js";
import RegisterPage from "./RegisterPage.js";
import OurCourses from "./OurCoursesPage.js";
import CourseDetail from "./CourseDetailPage.js";
import ErrorPage from "./ErrorPage.js";

function UnauthenticatedApp() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/courses" element={<OurCourses />} />
      <Route path="/courses/:courseId" element={<CourseDetail />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default UnauthenticatedApp;
