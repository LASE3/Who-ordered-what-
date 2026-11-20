import React from "react";
import { Link, Outlet, useOutletContext } from "react-router-dom";

// Show pages that beling ti this order's organizer
export default function OrganizerRoute() {
  const context = useOutletContext();

  if (!context?.order?.isOrganizer) {
    return (
      <section>
        <h2>This Page for the Organizer ONLY!</h2>
        <Link to="/orders">Back To My Orders</Link>
      </section>
    );
  }

  return <Outlet context={context} />;
}
