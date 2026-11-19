import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function LoginPage() {
  const { state } = useLocation();
  const { status, login, retrySessionCheck } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((previoes) => ({
      ...previoes,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    const newErrors = {};
    const email = formData.email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid Email.";
    }

    if (!formData.password) {
      newErrors.password = "Enter a password.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      await login({
        email: email.toLowerCase(),
        password: formData.password,
      });
    } catch (error) {
      const apiError = error.response?.data?.error;

      if (apiError?.code === "INVALID_CREDENTIALS") {
        setErrors({
          password: "Invalid Email or password",
        });
      } else {
        console.error(
          "LOGIN_FAILED",
          apiError?.code ?? error.code ?? "UNKNOWN_ERROR",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "checking") {
    return <p role="status">Cheacking......</p>;
  }

  if (status === "error") {
    return (
      <button type="button" onClick={retrySessionCheck}>
        Try again!?
      </button>
    );
  }

  if (status === "authenticated") {
    return <Navigate to="/orders" replace />;
  }

  return (
    <section>
      <h2>Log in Page</h2>

      {state?.message && <p role="status">{state.message}</p>}

      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="login-email">Email:</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
          {errors.email && <p role="alert">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="login-password">Password:</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
          {errors.password && <p role="alert">{errors.password}</p>}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Loging in..." : "Log in"}
        </button>
      </form>
    </section>
  );
}
