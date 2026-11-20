import React from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { all } from "axios";

// Check login and any required account role.
export default function ProtectedRoute({ allowedRoles }) {
  const { user, status, retrySessionCheck } = useAuth();
  const location = useLocation();

  if (status === "checking") {
    return <p role="status">Checking...</p>;
  }

  if (status === "error") {
    return (
      <button type="button" onClick={retrySessionCheck}>
        Try Again!?
      </button>
    );
  }

  if (status !== "authenticated") {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname + location.search + location.hash,
        }}
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <section>
        <h2>You don't have permission to show this page</h2>
        <Link to="/orders">Back to My Orders</Link>
      </section>
    );
  }

  return <Outlet />;
}
