import React, { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import {
  getRestaurant,
  getRestaurantMenu,
} from "../services/restaurantsService.js";

// Show a restaurant menu directly or inside an order.
export default function MenuPage() {
  const { restaurantId: routeRestaurantId } = useParams();
  const context = useOutletContext();
  const order = context?.order;
  const restaurantId = order?.restaurantId ?? routeRestaurantId;

  const { user, invalidateSession } = useAuth();
  const token = sessionStorage.getItem("meen-talab-sho.token");

  const [category, setCategory] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);

  const key = JSON.stringify([
    restaurantId,
    order?.id,
    user?.id,
    token,
    attempt,
  ]);

  const backTo = order
    ? `/orders/${encodeURIComponent(order.id)}`
    : "/restaurants";

  // Reset the filter when the restaurant, order, or account changes.
  useEffect(() => {
    setCategory("");
  }, [restaurantId, order?.id, user?.id, token]);

  // Load the restaurant details and menu together.
  useEffect(() => {
    let active = true;

    Promise.all([
      getRestaurant(restaurantId, token),
      getRestaurantMenu(restaurantId, token),
    ])
      // Keep both replies for the current page.
      .then(([restaurant, items]) => {
        if (!active) return;

        setResult({
          key,
          status: "ready",
          restaurant,
          items,
        });
      })
      // Handle missing restaurants and failed requests.
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
            "MENU_LOAD_FAILED",
            error.response?.data?.error?.code ?? error.code ?? "UNKNOWN_ERROR",
          );
        }
      });

    // Ignore replies from the previous restaurant or session.
    return () => {
      active = false;
    };
  }, [restaurantId, token, key, invalidateSession]);

  //  Update the selected category .
  function handleCategoryChange(e) {
    setCategory(e.target.value);
  }

  // Request fresh restaurant detaild and menu items.
  function reloadMenu() {
    setAttempt((value) => value + 1);
  }

  if (result?.key !== key) {
    return <p role="status">Menu is loading..</p>;
  }

  if (result.status === "forbidden" || result.status === "notFound") {
    return (
      <section>
        <h2>
          {result.status === "forbidden"
            ? "You cannot access this restaurant."
            : "Restaurant not found"}
        </h2>

        <Link to={backTo}>Back</Link>
      </section>
    );
  }

  if (result.status === "error") {
    return (
      <button type="button" onClick={reloadMenu}>
        Try Again?!
      </button>
    );
  }

  // Collect each category once.
  const categories = [...new Set(result.items.map((item) => item.category))];

  const activeCategory = categories.includes(category) ? category : "";

  // Show all items or only the selected category.
  const visibleItems = activeCategory
    ? result.items.filter((item) => item.category === activeCategory)
    : result.items;

  return (
    <section>
      <h2>{result.restaurant.name}</h2>
      <p>Status : {result.restaurant.isOpen ? "Open" : " Closed"}</p>
      {order && <p>Order: {order.title}</p>}

      <Link to={backTo}>{order ? "Back to Order" : "Back to Restaurants"}</Link>
      <button type="button" onClick={reloadMenu}>
        Update List
      </button>

      <div>
        <label htmlFor="menu-category">Category</label>

        <select
          id="menu-category"
          value={activeCategory}
          onChange={handleCategoryChange}
          disabled={result.items.length === 0}
        >
          <option value="">All categories</option>
          {/* Show each category once  */}
          {categories.map((itemCategory) => (
            <option key={itemCategory} value={itemCategory}>
              {itemCategory}
            </option>
          ))}
        </select>
      </div>

      {result.items.length === 0 ? (
        <p>No Menu items yet.</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Category</th>
              <th scope="col">Price</th>
              <th scope="col">Availability</th>
            </tr>
          </thead>

          <tbody>
            {/* Show the items that match the category filter. */}
            {visibleItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td dir="ltr">{(item.priceFils / 1000).toFixed(3)} JOD</td>
                <td>{item.available ? "Available" : "Unavailable"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
