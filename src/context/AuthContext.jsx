import React, { createContext, useState, useEffect, useRef } from "react";
import {
  getCurrentUser,
  loginUser,
} from "../services/authService.js";

export const AuthContext = createContext(null);

const TOKEN_KEY = "meen-talab-sho.token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("checking");
  const [attempt, setAttempt] = useState(0);

  const requestVersion = useRef(0);

  useEffect(() => {
    const version = ++requestVersion.current;
    const token = sessionStorage.getItem(TOKEN_KEY);

    setUser(null);

    if (!token) {
      setStatus("anonymous");
    } else {
      setStatus("checking");

      getCurrentUser(token)
        .then((currentUser) => {
          if (version !== requestVersion.current) return;

          setUser(currentUser);
          setStatus("authenticated");
        })
        .catch((error) => {
          if (version !== requestVersion.current) return;

          if (error.response?.status === 401) {
            sessionStorage.removeItem(TOKEN_KEY);
            setStatus("anonymous");
          } else {
            setStatus("error");

            console.error(
              "SESSION_CHECK_FAILED",
              error.response?.data?.error?.code ??
                error.code ??
                "UNKNOWN_ERROR",
            );
          }
        });
    }

    return () => {
      requestVersion.current += 1;
    };
  }, [attempt]);

  async function login(credentials) {
    const version = ++requestVersion.current;

    sessionStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setStatus("anonymous");

    try {
      const result = await loginUser(credentials);

      if (version !== requestVersion.current) return null;

      sessionStorage.setItem(TOKEN_KEY, result.token);
      setUser(result.user);
      setStatus("authenticated");

      return result.user;
    } catch (error) {
      if (version !== requestVersion.current) return null;

      throw error;
    }
  }

  function retrySessionCheck() {
    requestVersion.current += 1;
    setStatus("checking");
    setAttempt((value) => value + 1);
  }

  return (
    <AuthContext.Provider value={{ user, status, login, retrySessionCheck }}>
      {children}
    </AuthContext.Provider>
  );
}
