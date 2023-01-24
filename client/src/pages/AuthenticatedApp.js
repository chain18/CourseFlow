import { Routes, Route } from "react-router-dom";
import HomePage from "./HomePage.js";
import OurCourses from "./OurCoursesPage.js";
import CourseDetail from "./CourseDetailPage.js";
import UserProfile from "./UserProfilePage";
import MyHomework from "./MyHomeworkPage.js";
import MyCourses from "./MyCoursesPage.js";
import LearningPage from "./LearningPage.js";
import DesireCourse from "./DesireCoursePage.js";
import LearningHome from "./LearningHomePage.js";
import ErrorPage from "./ErrorPage.js";

function AuthenticatedApp() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/courses" element={<OurCourses />} />
      <Route path="/courses/:courseId" element={<CourseDetail />} />
      <Route path="/subscription" element={<MyCourses />} />
      <Route path="/homework" element={<MyHomework />} />
      <Route path="/desire" element={<DesireCourse />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/courses/:courseId/learning" element={<LearningHome />} />
      <Route
        path="/courses/:courseId/learning/:subLessonId"
        element={<LearningPage />}
      />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default AuthenticatedApp;
