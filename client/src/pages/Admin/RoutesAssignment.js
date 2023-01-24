import { Routes, Route } from "react-router-dom";
import AdminAssignmentList from "./AdminAssignmentListPage";
import AdminAddAssignment from "./AdminAddAssignmentPage";
import AdminEditAssignment from "./AdminEditAssignmentPage";
import { useEffect } from "react";

function RoutesAssignment() {
  return (
    <Routes>
      <Route path="/" element={<AdminAssignmentList />} />
      <Route path="/*" element={<AdminAssignmentCRUD />} />
    </Routes>
  );
}

function AdminAssignmentCRUD() {
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
      <Route path="/add" element={<AdminAddAssignment />} />
      <Route path="/edit/:assignmentId" element={<AdminEditAssignment />} />
    </Routes>
  );
}

export default RoutesAssignment;
