import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import React from "react";

export default function PagePlaceholder({ title }) {
  const { orderId, restaurantId } = useParams();

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
            <Link to={`/orders/${orderId}/summary`}>Order Summary</Link>
            <Link to={`/orders/${orderId}/billing`}>Billing</Link>
          </nav>
        </>
      )}
    </section>
  );
}
