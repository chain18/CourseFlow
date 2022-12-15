import { Routes, Route } from "react-router-dom";
import LoginAdminPage from "./LoginAdminPage";
import ErrorPage from "../ErrorPage.js";

function UnauthenticatedAdmin() {
  return (
    <Routes>
      <Route path="/" element={<LoginAdminPage />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default UnauthenticatedAdmin;
