import { Routes, Route } from "react-router-dom";
import AdminAddCoursesPage from "./AdminAddCoursesPage";
import AdminAddLesson from "./AdminAddLessonPage";
import AdminEditLesson from "./AdminEditLessonPage";
import { useEffect } from "react";
import { useAdmin } from "../../contexts/admin.js";

function RoutesAddCourse() {
  const { setAddCourseFields, setAddLesson } = useAdmin();

  useEffect(() => {
    /* reset state after the component was unmounted */
    return () => {
      setAddCourseFields({});
      setAddLesson([]);
    };
  }, []);

  useEffect(() => {
    /* Prompt a pop-up message to warn the users if they are trying to refresh to web page */
    const unloadCallback = (event) => {
      event.preventDefault();
      return (event.returnValue = "Changes you made may not be saved.");
    };
    window.addEventListener("beforeunload", unloadCallback);
    return () => window.removeEventListener("beforeunload", unloadCallback);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<AdminAddCoursesPage />} />
      <Route path="/add-lesson" element={<AdminAddLesson />} />
      <Route path="/edit-lesson/:lessonId" element={<AdminEditLesson />} />
    </Routes>
  );
}

export default RoutesAddCourse;
