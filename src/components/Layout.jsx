import { NavLink, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import React from "react";

// Show the shared header and the current page.
export default function Layout({ onLogout }) {
  const { user, status } = useAuth();
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

        <button onClick={onLogout} disabled={!user || !onLogout}>
          Logout
        </button>
      </header>

      <hr />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
