import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  broadcastSessionLogout,
  isTokenExpired,
  SESSION_CHECK_INTERVAL_MS,
  SESSION_IDLE_TIMEOUT_MS,
  subscribeToSessionLogout
} from "../utils/session";

const activityEvents = ["click", "keydown", "mousemove", "scroll", "touchstart"];

const SessionManager = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let lastActivity = Date.now();

    const markActivity = () => {
      lastActivity = Date.now();
    };

    activityEvents.forEach((event) => window.addEventListener(event, markActivity));

    const redirectToLogin = () => {
      if (location.pathname !== "/login") {
        navigate("/login", { replace: true });
      }
    };

    const enforceSessionState = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      if (isTokenExpired(token)) {
        broadcastSessionLogout();
        redirectToLogin();
        return;
      }

      if (Date.now() - lastActivity > SESSION_IDLE_TIMEOUT_MS) {
        broadcastSessionLogout();
        redirectToLogin();
      }
    };

    const intervalId = window.setInterval(enforceSessionState, SESSION_CHECK_INTERVAL_MS);
    enforceSessionState();

    const unsubscribe = subscribeToSessionLogout(() => {
      redirectToLogin();
    });

    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          broadcastSessionLogout();
          redirectToLogin();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      window.clearInterval(intervalId);
      activityEvents.forEach((event) => window.removeEventListener(event, markActivity));
      unsubscribe();
      axios.interceptors.response.eject(interceptorId);
    };
  }, [navigate, location.pathname]);

  return null;
};

export default SessionManager;
