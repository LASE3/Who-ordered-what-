import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService.js";

export default function RegisterPage() {
  // State for form data, errors, loading state, and API messages
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  // States for validation errors, loading state, and API messages
  const [errors, setErrors] = useState({});
  const [isLoading, setIsloading] = useState(false);
  const navigate = useNavigate();

  // Handle input changes, update form data state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validation function, Checks for name length, email format, password length, and password match
  const validate = () => {
    const newErrors = {};
    const name = formData.name.trim();
    const email = formData.email.trim();
    if (name.length < 2 || name.length > 60) {
      newErrors.name = "The name should be between 2 and 60 characters long.";
    }
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length < 5 ||
      email.length > 120
    ) {
      newErrors.email =
        "Please enter a valid email address, between 5 and 120 characters long.";
    }
    if (formData.password.length < 8 || formData.password.length > 72) {
      newErrors.password = "Password must be between 8 and 72 characters long.";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    return newErrors;
  };

  // Handle form submission, validate the form, and set errors or loading state accordingly
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return; // Prevent multiple submissions

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return; // If there are validation errors, do not proceed

    setIsloading(true);
    // Call the registerUser function from authService.js, handle success and error cases
    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate("/login", {
        state: { message: "Registration successful! Please log in." },
      });
    } catch (error) {
      // Handle API errors, set error messages accordingly
      const apiError = error.response?.data?.error;
      const fieldErrors = {};

      if (apiError?.fields?.name) {
        fieldErrors.name =
          "The name should be between 2 and 60 characters long.";
      }
      if (apiError?.fields?.email) {
        fieldErrors.email =
          "The email should be a valid email address, between 5 and 120 characters long.";
      }
      if (apiError?.fields?.password) {
        fieldErrors.password =
          "The password should be between 8 and 72 characters long.";
      }
      if (apiError?.code === "EMAIL_EXISTS") {
        fieldErrors.email =
          "This email is already registered. Please use a different email.";
      }

      setErrors(fieldErrors);

      if (Object.keys(fieldErrors).length === 0) {
        console.error(
          "REGISTER_FAILED",
          apiError?.code ?? error.code ?? "UNKNOWN_ERROR",
        );
      }
    } finally {
      setIsloading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>
      <div>
        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        {errors.confirmPassword && (
          <span className="error">{errors.confirmPassword}</span>
        )}
      </div>
      <div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </button>
      </div>
    </form>
  );
}
