import React from "react";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import PagePlaceholder from "./pages/PagePlaceholder";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import OrderRoute from "./components/OrderRoute.jsx";
import OrganizerRoute from "./components/OrganizerRoute.jsx";

// Connect the app pages and route guards.
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/orders" replace />} />

            <Route path="register" element={<RegisterPage />} />
            <Route path="login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route
                path="orders"
                element={<PagePlaceholder title="My Orders Page" />}
              />
              <Route
                path="orders/new"
                element={<PagePlaceholder title="New Order Page" />}
              />
              <Route
                path="orders/join"
                element={<PagePlaceholder title="Join Order Page" />}
              />
              <Route path="orders/:orderId" element={<OrderRoute />}>
                <Route
                  index
                  element={<PagePlaceholder title="Order Details Page" />}
                />
                <Route
                  path="cart"
                  element={<PagePlaceholder title="My Cart Page" />}
                />
                <Route
                  path="billing"
                  element={<PagePlaceholder title="Billing Page" />}
                />
                <Route element={<OrganizerRoute />}>
                  <Route
                    path="summary"
                    element={<PagePlaceholder title="Order Summary Page" />}
                  />
                </Route>
              </Route>

              <Route
                path="restaurants"
                element={<PagePlaceholder title="Restaurants Page" />}
              />
              <Route
                path="restaurants/:restaurantId/menu"
                element={<PagePlaceholder title="Restaurant Details Page" />}
              />

              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route
                  path="admin/restaurants"
                  element={
                    <PagePlaceholder title="Restaurants Management Page" />
                  }
                />
                <Route
                  path="admin/restaurants/:restaurantId/menu"
                  element={
                    <PagePlaceholder title="Restaurant Management Page" />
                  }
                />
              </Route>
            </Route>
            <Route
              path="*"
              element={
                <section>
                  <h2>404 - Page Not Found</h2>
                  <Link to="/orders">Go back to Orders</Link>
                </section>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
