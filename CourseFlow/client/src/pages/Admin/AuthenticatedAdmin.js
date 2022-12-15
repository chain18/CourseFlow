import { Routes, Route } from "react-router-dom";
import AdminViewCourses from "./AdminViewCoursesPage";
import RoutesAddCourse from "./RoutesAddCourse";
import RoutesEditCourse from "./RoutesEditCourse";
import RoutesAssignment from "./RoutesAssignment";
import ErrorPage from "../ErrorPage.js";

function AuthenticatedAdmin() {
  return (
    <Routes>
      <Route path="/" element={<AdminViewCourses />} />
      <Route path="/add-course/*" element={<RoutesAddCourse />} />
      <Route path="/edit-course/*" element={<RoutesEditCourse />} />
      <Route path="/assignment/*" element={<RoutesAssignment />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default AuthenticatedAdmin;
