import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
} from "../services/authService.js";

export const AuthContext = createContext(null);

const TOKEN_KEY = "meen-talab-sho.token";

// Share the current user and session with the app.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("checking");
  const [attempt, setAttempt] = useState(0);

  const requestVersion = useRef(0);

  // Clear the session if this token is still current.
  const invalidateSession = useCallback((expectedToken) => {
    if (sessionStorage.getItem(TOKEN_KEY) !== expectedToken) return;
    requestVersion.current += 1;
    sessionStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setStatus("anonymous");
  }, []);

  // Restore the saved session when the app opens or retries.
  useEffect(() => {
    const version = ++requestVersion.current;
    const token = sessionStorage.getItem(TOKEN_KEY);

    setUser(null);

    if (!token) {
      setStatus("anonymous");
    } else {
      setStatus("checking");

      getCurrentUser(token)
        // Save the user after the session is checked.
        .then((currentUser) => {
          if (version !== requestVersion.current) return;

          setUser(currentUser);
          setStatus("authenticated");
        })
        // Clear expired sessions or allow another check.
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

    // Stop old requests from changing the current session.
    return () => {
      requestVersion.current += 1;
    };
  }, [attempt]);

  // Log in and save the user's token and details.
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

  // Clear local login and end this API session.
  async function logout() {
    const token = sessionStorage.getItem(TOKEN_KEY);

    invalidateSession(token);

    if (!token) return;

    try {
      await logoutUser(token);
    } catch (error) {
      if (error.response?.status === 401) return;

      console.error(
        "LOGOUT_FAILED",
        error.response?.data?.error?.code ?? error.code ?? "UNKNOWN_ERROR",
      );
    }
  }

  // Check the saved session again.
  function retrySessionCheck() {
    requestVersion.current += 1;
    setStatus("checking");
    // Increase the retry count.
    setAttempt((value) => value + 1);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        login,
        logout,
        retrySessionCheck,
        invalidateSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
