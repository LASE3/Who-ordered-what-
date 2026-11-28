import React, { useEffect, useState } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getGroupOrder } from "../services/ordersService";

// Load an order before showing its pages.
export default function OrderRoute() {
  const { orderId } = useParams();
  const { user, invalidateSession } = useAuth();

  const token = sessionStorage.getItem("meen-talab-sho.token");

  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);

  const key = JSON.stringify([orderId, user?.id, token, attempt]);

  // Load this order and check the user's membership.
  useEffect(() => {
    let active = true;

    getGroupOrder(orderId, token)
      // Keep the order returned by the API.
      .then((order) => {
        if (!active) return;

        setResult({
          key,
          status: "ready",
          order,
        });
      })
      // Handle access errors and failed requests.
      .catch((error) => {
        if (!active) return;

        const httpStatus = error.response?.status;

        if (httpStatus === 401) {
          invalidateSession(token);
          return;
        }

        const problem =
          httpStatus === 403
            ? "forbidden"
            : httpStatus === 404
              ? "notFound"
              : "error";

        setResult({ key, status: problem });

        if (problem === "error") {
          console.error(
            "ORDER_CHECK_FAILED",
            error.response?.data?.error?.code ?? error.code ?? "UNKNOWN_ERROR",
          );
        }
      });

    // Ignore old replies after leaving this order.
    return () => {
      active = false;
    };
  }, [orderId, token, key, invalidateSession]);

  if (result?.key !== key) {
    return <p role="status">The order is loading..</p>;
  }

  if (result.status === "forbidden" || result.status === "notFound") {
    return (
      <section>
        <h2>
          {result.status === "forbidden"
            ? "You arn't a member in this order"
            : "The order not found"}
        </h2>
        <Link to="/orders">Back To My Orders</Link>
      </section>
    );
  }
  if (result.status === "error") {
    return (
      // Try loading the order again.
      <button type="button" onClick={() => setAttempt((value) => value + 1)}>
        Try Again
      </button>
    );
  }

  return <Outlet context={{ order: result.order }} />;
}
