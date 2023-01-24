import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

const AuthContext = React.createContext();

function AuthProvider(props) {
  const [contextState, setContextState] = useState({
    isLoading: false,
    isError: false,
    user: null,
    previousUrl: null,
  });
  const [contextAdminState, setContextAdminState] = useState({ user: null });

  const navigate = useNavigate();

  const register = async (data) => {
    try {
      let copiedData = Object.assign({}, data);
      // if education data is empty => turn it from empty string to null
      if (!copiedData.education) {
        copiedData.education = null;
      }
      const result = await axios.post(
        "http://localhost:4000/auth/register",
        copiedData
      );
      if (/success/g.test(result.data.message)) {
        return true;
      } else {
        return result.data.message;
      }
    } catch (error) {
      alert(`ERROR: Please try again later`);
    }
  };

  const login = async (data) => {
    try {
      const result = await axios.post("http://localhost:4000/auth/login", data);
      if (result.data.token) {
        const token = result.data.token;
        localStorage.setItem("token", token);
        const userDataFromToken = jwtDecode(token);
        setContextState({ ...contextState, user: userDataFromToken });
        if (contextState.previousUrl) {
          navigate(contextState.previousUrl);
        } else {
          navigate("/");
        }
      } else {
        return result.data.message;
      }
    } catch (error) {
      alert(`ERROR: Please try again later`);
    }
  };

  const isAuthenticated = Boolean(localStorage.getItem("token"));

  if (isAuthenticated && !contextState.user) {
    const token = localStorage.getItem("token");
    const userDataFromToken = jwtDecode(token);
    setContextState({ ...contextState, user: userDataFromToken });
  }

  const logout = () => {
    localStorage.removeItem("token");
    setContextState({ ...contextState, user: null });
    navigate("/");
  };
  // -------------------------------------Admin Login-------------------------------
  const loginAdmin = async (data) => {
    try {
      const result = await axios.post(
        "http://localhost:4000/auth/loginAdmin",
        data
      );
      if (result.data.token) {
        const adminToken = result.data.token;
        localStorage.setItem("adminToken", adminToken);
        const userDataFromToken = jwtDecode(adminToken);
        setContextAdminState({ ...contextAdminState, user: userDataFromToken });
        navigate("/admin");
      } else {
        return result.data.message;
      }
    } catch (error) {
      alert(`ERROR: Please try again later`);
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem("adminToken");
    setContextAdminState({ ...contextAdminState, user: null });
    navigate("/admin");
  };

  const isAdminAuthenticated = Boolean(localStorage.getItem("adminToken"));
  if (isAdminAuthenticated && !contextAdminState.user) {
    const adminToken = localStorage.getItem("adminToken");
    const userDataFromToken = jwtDecode(adminToken);
    setContextAdminState({ ...contextAdminState, user: userDataFromToken });
  }

  return (
    <AuthContext.Provider
      value={{
        contextState,
        setContextState,
        contextAdminState,
        login,
        logout,
        register,
        isAuthenticated,
        logoutAdmin,
        loginAdmin,
        isAdminAuthenticated,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

const useAuth = () => React.useContext(AuthContext);

export { AuthProvider, useAuth };
