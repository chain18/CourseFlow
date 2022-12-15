import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import AppAdmin from "./AppAdmin.js";
import reportWebVitals from "./reportWebVitals";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "./contexts/authentication.js";
import { AdminProvider } from "./contexts/admin.js";
import theme from "./configs/theme.js";
import jwtInterceptor from "./utils/jwtInterceptors.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";
const root = ReactDOM.createRoot(document.getElementById("root"));

jwtInterceptor();
root.render(
  // <React.StrictMode>
  <BrowserRouter>
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <AdminProvider>
          <Routes>
            <Route path="/*" element={<App />} />
            <Route path="/admin/*" element={<AppAdmin />} />
          </Routes>
        </AdminProvider>
      </AuthProvider>
    </ChakraProvider>
  </BrowserRouter>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
