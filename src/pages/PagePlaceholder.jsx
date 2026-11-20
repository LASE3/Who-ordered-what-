import { Link, useParams, useOutletContext } from "react-router-dom";
import { useState } from "react";
import React from "react";

// Show a temporary page while its features are built.
export default function PagePlaceholder({ title }) {
  const { orderId, restaurantId } = useParams();
  const context = useOutletContext();

  return (
    <section>
      <h2>{title}</h2>

      {restaurantId && (
        <p>
          Restaurant ID: {restaurantId} <br />
        </p>
      )}

      {orderId && (
        <>
          <p>
            Order ID: {orderId} <br />
          </p>

          <nav>
            <Link to={`/orders/${orderId}`}>Orders</Link>
            <Link to={`/orders/${orderId}/cart`}>My Cart</Link>
            {context?.order?.isOrganizer && (
              <Link to={`/orders/${orderId}/summary`}>Order Summary</Link>
            )}
            <Link to={`/orders/${orderId}/billing`}>Billing</Link>
          </nav>
        </>
      )}
    </section>
  );
}
