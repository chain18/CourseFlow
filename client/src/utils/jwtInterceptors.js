import axios from "axios";

export default function jwtInterceptor() {
  axios.interceptors.request.use((req) => {
    const hasToken = Boolean(window.localStorage.getItem("token"));
    const hasAdminToken = Boolean(window.localStorage.getItem("adminToken"));
    if (/admin/i.test(req.url) && hasAdminToken) {
      req.headers = {
        ...req.headers,
        Authorization: `Bearer ${window.localStorage.getItem("adminToken")}`,
      };
    } else if (!/admin/i.test(req.url) && hasToken) {
      req.headers = {
        ...req.headers,
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      };
    }
    return req;
  });

  axios.interceptors.response.use(
    (res) => {
      return res;
    },
    (error) => {
      const hasToken = Boolean(window.localStorage.getItem("token"));
      const hasAdminToken = Boolean(window.localStorage.getItem("adminToken"));
      if (
        error.response.status === 401 &&
        error.response.statusText === "Unauthorized"
      ) {
        if (/admin/i.test(error.config.url) && hasAdminToken) {
          window.localStorage.removeItem("adminToken");
          window.location.replace("/admin");
        } else if (!/admin/i.test(error.config.url) && hasToken) {
          window.localStorage.removeItem("token");
          window.location.replace("/login");
        }
      } else if (error.response.status === 403) {
        window.history.back();
      }
    }
  );
}
