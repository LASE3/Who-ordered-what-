import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import React, { useState } from "react";

// Show the shared header and the current page.
export default function Layout() {
  const { user, status, logout } = useAuth();
  const navigate = useNavigate();
  const [isLogginOut, setIsLogginOut] = useState(false);

  // Sign out and open the login page.
  async function handleLogout() {
    if (isLogginOut) return;

    setIsLogginOut(true);

    const logoutRequest = logout();
    navigate("/login", { replace: true });

    try {
      await logoutRequest;
    } finally {
      setIsLogginOut(false);
    }
  }

  return (
    <div>
      <header>
        <h1>Meen Talab Sho</h1>
        <nav>
          <NavLink to="/orders">My Orders</NavLink>
          <NavLink to="/restaurants">Restaurants</NavLink>
          <NavLink to="/orders/new">New Order</NavLink>
          <NavLink to="/orders/join">Join Order</NavLink>

          {status === "anonymous" && (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}

          {user?.role === "admin" && (
            <NavLink to="/admin/restaurants">Restaurants Management</NavLink>
          )}
        </nav>

        <p>{user ? `Welcome, ${user.name}!` : "Please log in."}</p>

        <button
          type="button"
          onClick={handleLogout}
          disabled={!user || isLogginOut}
        >
          {isLogginOut ? "Logging out..." : "Logout"}
        </button>
      </header>

      <hr />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
