import { Routes, Route } from "react-router-dom";
import AdminEditCourse from "./AdminEditCoursesPage";
import AdminAddLesson from "./AdminAddLessonPage";
import AdminEditLesson from "./AdminEditLessonPage";
import { useEffect } from "react";
import { useAdmin } from "../../contexts/admin.js";
import { useAuth } from "../../contexts/authentication";
import { useParams } from "react-router-dom";
import axios from "axios";

function RoutesEditCourse() {
  const {
    setEditCourseFields,
    setAddLesson,
    setFilesEditCourse,
    setIsLoading,
  } = useAdmin();
  const { contextAdminState } = useAuth();
  const adminId = contextAdminState.user.admin_id;
  const params = useParams();
  const courseId = params["*"].split("/")[0];

  useEffect(() => {
    getCourseData();
    /* Prompt a pop-up message to warn the users if they are trying to refresh to web page */
    const unloadCallback = (event) => {
      event.preventDefault();
      return (event.returnValue = "Changes you made may not be saved.");
    };
    window.addEventListener("beforeunload", unloadCallback);
    return () => {
      window.removeEventListener("beforeunload", unloadCallback);
      /* reset state after the component was unmounted */
      setEditCourseFields({});
      setAddLesson([]);
    };
  }, []);

  const getCourseData = async () => {
    setIsLoading(true);
    const result = await axios.get(
      `http://localhost:4000/admin/courses/${courseId}?byAdmin=${adminId}`
    );
    setEditCourseFields(result.data.data);
    setFilesEditCourse(result.data);
    setAddLesson(result.data.lessonsAndSubCount);
  };

  return (
    <Routes>
      <Route path="/:courseId" element={<AdminEditCourse />} />
      <Route path="/:courseId/add-lesson" element={<AdminAddLesson />} />
      <Route
        path="/:courseId/edit-lesson/:lessonId"
        element={<AdminEditLesson />}
      />
    </Routes>
  );
}

export default RoutesEditCourse;
