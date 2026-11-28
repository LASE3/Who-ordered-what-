import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import { getRestaurants } from "../services/restaurantsService.js";

// Show restaurants and search by name or category.
export default function RestaurantsPage() {
  const { user, invalidateSession } = useAuth();
  const token = sessionStorage.getItem("meen-talab-sho.token");

  const [query, setQuery] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);

  const key = JSON.stringify([user?.id, token, attempt]);

  // Load the restaurants for the current session.
  useEffect(() => {
    let active = true;

    getRestaurants(token)
      // Keep the restaurants returned by the API.
      .then((restaurants) => {
        if (!active) return;

        setResult({
          key,
          status: "ready",
          restaurants,
        });
      })
      // Handle expired sessions and failed requests.
      .catch((error) => {
        if (!active) return;

        const httpStatus = error.response?.status;

        if (httpStatus === 401) {
          invalidateSession(token);
          return;
        }

        setResult({
          key,
          status: httpStatus === 403 ? "forbidden" : "error",
        });

        if (httpStatus !== 403) {
          console.error(
            "RESTAURANTS_LOAD_FAILED",
            error.response?.data?.error?.code ?? error.code ?? "UNKNOWN_ERROR",
          );
        }
      });

    // Ignore replies after leaving this page.
    return () => {
      active = false;
    };
  }, [token, key, invalidateSession]);

  // Update the search text.
  function handleSearchChange(e) {
    setQuery(e.target.value);
  }
  // Request a fresh restaurants list.
  function reloadRestaurants(e) {
    setAttempt((value) => value + 1);
  }

  if (result?.key !== key) {
    return <p role="status">Restaurant are loading...</p>;
  }

  if (result.status === "forbidden") {
    return (
      <section>
        <p>You cannot access the restaurants list.</p>
        <Link to="/orders">Back to Orders</Link>
      </section>
    );
  }

  if (result.status === "error") {
    return (
      <button type="button" onClick={reloadRestaurants}>
        Try Again
      </button>
    );
  }

  const searchTerm = query.trim().toLowerCase();

  // Filter the loaded list by name or category.
  const visibleRestaurants = result.restaurants.filter((restaurants) =>
    `${restaurants.name} ${restaurants.category}`
      .toLowerCase()
      .includes(searchTerm),
  );
  return (
    <section>
      <h2>Restaurants</h2>

      <div>
        <label htmlFor="restaurant-search">Search By name or category</label>

        <input
          id="restaurant-search"
          type="search"
          value={query}
          onChange={handleSearchChange}
        />
      </div>

      <button type="button" onClick={reloadRestaurants}>
        Update List
      </button>

      {result.restaurants.length === 0 ? (
        <p>No restaurants yet.</p>
      ) : visibleRestaurants.length === 0 ? (
        <p>No restaurants match your search,</p>
      ) : (
        <ul>
          {/* Show each restaurants and its available acrions. */}
          {visibleRestaurants.map((restaurant) => (
            <li key={restaurant.id}>
              <h3>{restaurant.name}</h3>
              <p>Category: {restaurant.category}</p>
              <p>{restaurant.description || "--"}</p>
              <p>Status: {restaurant.isOpen ? "Open" : "Closed"}</p>

              <Link
                to={`/restaurants/${encodeURIComponent(restaurant.id)}/menu`}
              >
                View Menu
              </Link>

              {restaurant.isOpen ? (
                <Link
                  to={`/orders/new?restaurantId=${encodeURIComponent(restaurant.id)}`}
                >
                  New Order
                </Link>
              ) : (
                <button type="button" disabled>
                  New Order
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
