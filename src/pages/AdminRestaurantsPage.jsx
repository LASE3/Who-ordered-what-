import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import {
  getRestaurants,
  createRestaurant,
  updateRestaurant,
} from "../services/restaurantsService.js";

// Show the restaurants available for admin management.
export default function AdminRestaurantsPage() {
  const { user, invalidateSession } = useAuth();
  const token = sessionStorage.getItem("meen-talab-sho.token");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    isOpen: false,
  });

  const [editingId, setEditingId] = useState(null);

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const mountedRef = useRef(false);
  const savinfRef = useRef(false);

  // Track whether this page is still open.
  useEffect(() => {
    mountedRef.current = true;

    // Ignore save replies after leavinf the page.
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);

  const key = JSON.stringify([user?.id, token, attempt]);

  const restaurantMessages = {
    name: "Name must be between 2 and 80 characters.",
    category: "Category must be between 2 and 40 characters.",
    description: "Description must not exceed 200 characters.",
  };

  // Check the restaurant fields before saving.
  function validateRestaurant(values) {
    const errors = {};

    if (values.name.length < 2 || values.name.length > 80) {
      errors.name = restaurantMessages.name;
    }

    if (values.category.length < 2 || values.category.length > 40) {
      errors.category = restaurantMessages.category;
    }

    if (values.description.length > 200) {
      errors.description = restaurantMessages.description;
    }

    return errors;
  }

  // Load the list for the current session.
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

        if (error.response?.status === 401) {
          invalidateSession(token);
          return;
        }

        setResult({ key, status: "error" });

        console.error(
          "RESTAURANTS_LOAD_FAILED",
          error.response?.data?.error?.code ?? error.code ?? "UNKNOWN_ERROR",
        );
      });

    // Ignore replies after leaving this page.
    return () => {
      active = false;
    };
  }, [token, key, invalidateSession]);

  // Request a fresh restaurants list.
  function reloadRestaurants() {
    setAttempt((value) => value + 1);
  }

  if (result?.key !== key) {
    return <p role="status">Restaurant are loading</p>;
  }

  if (result.status === "error") {
    return (
      <button type="button" onClick={reloadRestaurants}>
        Try Again!
      </button>
    );
  }

  // Clear the form and return to adding.
  function resetRestaurantForm() {
    setEditingId(null);

    setFormData({
      name: "",
      category: "",
      description: "",
      isOpen: false,
    });

    setErrors({});
  }

  // Copy the selected restaurant into the form.
  function handleEditRestaurant(restaurant) {
    if (savinfRef.current) return;

    setEditingId(restaurant.id);

    setFormData({
      name: restaurant.name,
      category: restaurant.category,
      description: restaurant.description ?? "",
      isOpen: restaurant.isOpen,
    });

    setErrors({});
  }
  // Update the fiels the user changed.
  function handleFormChange(e) {
    const { name, type, value, checked } = e.target;

    setFormData((previos) => ({
      ...previos,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // Add a restaurant, then refresh the list.
  async function handleSaveRestaurant(e) {
    e.preventDefault();

    if (savinfRef.current) return;

    const value = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      description: formData.description.trim(),
    };

    const validationErrors = validateRestaurant(value);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const requestToken = token;

    // Check that the reply belongs to this page and session.
    const isCurrentRequest = () =>
      mountedRef.current &&
      sessionStorage.getItem("meen-talab-sho.token") === requestToken;

    if (!isCurrentRequest()) return;

    savinfRef.current = true;
    setIsSaving(true);

    try {
      if (editingId !== null) {
        await updateRestaurant(
          editingId,
          { ...value, isOpen: formData.isOpen },
          requestToken,
        );
      } else {
        await createRestaurant(value, requestToken);
      }

      if (!isCurrentRequest()) return;

      resetRestaurantForm();
      reloadRestaurants();
    } catch (error) {
      if (!isCurrentRequest()) return;

      if (error.response?.status === 401) {
        invalidateSession(requestToken);
        return;
      }

      const apiError = error.response?.data?.error;
      const fieldErrors = {};

      if (apiError?.code === "RESTAURANT_EXISTS") {
        fieldErrors.name = "This restaurant name is already used.";
      }
      if (apiError?.code === "VALIDATION_ERROR") {
        for (const field of Object.keys(restaurantMessages)) {
          if (apiError.fields?.[field]) {
            fieldErrors[field] = restaurantMessages[field];
          }
        }
      }

      if (apiError?.code === "MENU_EMPTY") {
        fieldErrors.form =
          "Add an available menu item, or uncheck Open before saving.";
      }

      if (editingId !== null && error.response?.status === 404) {
        fieldErrors.form =
          "This restaurant no longer exists. Cancel editing to continue.";

        reloadRestaurants();
      }

      if (error.response?.status === 403) {
        fieldErrors.form = "Your account cannot save restaurants.";
      }

      setErrors(fieldErrors);

      if (Object.keys(fieldErrors).length === 0) {
        console.error(
          "RESTAURANT_SAVE_FAILED",
          apiError?.code ?? error.code ?? "UNKNOWN_ERROR",
        );
      }
    } finally {
      savinfRef.current = false;

      if (mountedRef.current) {
        setIsSaving(false);
      }
    }
  }

  return (
    <section>
      <h2>Restaurant Management</h2>

      <button type="button" onClick={reloadRestaurants} disabled={isSaving}>
        Update List
      </button>
      <form onSubmit={handleSaveRestaurant} noValidate>
        <h3>{editingId !== null ? "Edit Restaurant" : "Add Restaurant"}</h3>
        <fieldset disabled={isSaving}>
          {/* Show the name and category fields. */}
          {["name", "category"].map((field) => (
            <div key={field}>
              <label htmlFor={`restaurant-${field}`}>
                {field === "name" ? "Name :" : "Category :"}
              </label>
              <input
                id={`restaurant-${field}`}
                name={field}
                type="text"
                value={formData[field]}
                onChange={handleFormChange}
                required
              />

              {errors[field] && <p role="alert">{errors[field]}</p>}
            </div>
          ))}

          <div>
            <label htmlFor="restaurant-description">Description</label>

            <textarea
              id="restaurant-description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
            />

            {errors.description && <p role="alert">{errors.description}</p>}
          </div>

          {editingId !== null && (
            <div>
              <label htmlFor="restaurant-open">
                <input
                  id="restaurant-open"
                  name="isOpen"
                  type="checkbox"
                  checked={formData.isOpen}
                  onChange={handleFormChange}
                />
                Open
              </label>
            </div>
          )}

          {errors.form && <p role="alert">{errors.form}</p>}

          <button type="submit">
            {isSaving
              ? "Saving.."
              : editingId !== null
                ? "Save Changes"
                : "Add Restaurant"}
          </button>
          {editingId !== null && (
            <button
              type="button"
              onClick={resetRestaurantForm}
              disabled={isSaving}
            >
              Cancel
            </button>
          )}
        </fieldset>
      </form>
      <br />
      <br />

      {result.restaurants.length === 0 ? (
        <p>No restaurant yet..</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Category</th>
              <th scope="col">Description</th>
              <th scope="col">Status</th>
              <th scope="col">Items</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* Show one row for each restaurant. */}
            {result.restaurants.map((restaurant) => (
              <tr key={restaurant.id}>
                <td>{restaurant.name}</td>
                <td>{restaurant.category}</td>
                <td>{restaurant.description || "—"}</td>
                <td>{restaurant.isOpen ? "Open" : "Closed"}</td>
                <td>
                  <Link
                    to={`/admin/restaurants/${encodeURIComponent(restaurant.id)}/menu`}
                  >
                    Restaurant Management
                  </Link>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleEditRestaurant(restaurant)}
                    disabled={isSaving}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
