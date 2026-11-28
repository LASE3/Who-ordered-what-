import React, { useRef, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
  getRestaurantMenu,
  createMenuItem,
  updateMenuItem,
} from "../services/restaurantsService";

const emptyMenuForm = {
  name: "",
  category: "",
  priceFils: "",
  available: true,
};

// Show the menu itmes for the selected restaurant.
export default function AdminMenuPage() {
  const { restaurantId } = useParams();
  const { user, invalidateSession } = useAuth();
  const token = sessionStorage.getItem("meen-talab-sho.token");

  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);

  const key = JSON.stringify([restaurantId, user?.id, token, attempt]);

  const [formData, setFormData] = useState(emptyMenuForm);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fromOwnerRef = useRef(null);
  const savingRef = useRef(false);

  // Start a fresh from when the restaurant or account changes.
  useEffect(() => {
    fromOwnerRef.current = {};
    setEditingId(null);
    savingRef.current = false;
    setFormData(emptyMenuForm);
    setErrors({});
    setIsSaving(false);

    // Ignore saves from the previous page context.
    return () => {
      fromOwnerRef.current = null;
    };
  }, [restaurantId, user?.id, token]);

  const meneMessages = {
    name: "Name must be between 2 and 80 characters.",
    category: "Category must be between 2 and 40 characters.",
    priceFils: "Price must be a whole number from 1 to 1000000 fils.",
  };

  // Check the menu item before saving.
  function validateMenuItem(values) {
    const errors = {};

    if (values.name.length < 2 || values.name.length > 80) {
      errors.name = meneMessages.name;
    }
    if (values.category.length < 2 || values.category.length > 40) {
      errors.category = meneMessages.category;
    }
    if (
      !Number.isSafeInteger(values.priceFils) ||
      values.priceFils < 1 ||
      values.priceFils > 1000000
    ) {
      errors.priceFils = meneMessages.priceFils;
    }

    return errors;
  }

  // Load the menu for this restaurant and session.
  useEffect(() => {
    let active = true;

    getRestaurantMenu(restaurantId, token)
      // keep the items returned by the API.
      .then((items) => {
        if (!active) return;

        setResult({
          key,
          status: "ready",
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

    return () => {
      active = false;
    };
  }, [restaurantId, token, key, invalidateSession]);

  //Request a fresh menu list.
  function reloadMenu() {
    setAttempt((value) => value + 1);
  }

  // Check the form and return to addin.
  function resetMenuForm() {
    setEditingId(null);
    setFormData(emptyMenuForm);
    setErrors({});
  }

  // Copy the selected item into the form.
  function handleEditMenuItem(item) {
    if (savingRef.current) return;

    setEditingId(item.id);

    setFormData({
      name: item.name,
      category: item.category,
      priceFils: String(item.priceFils),
      available: item.available,
    });

    setErrors({});
  }

  // Update the text fiels or checkbox
  function handleFormChange(e) {
    const { name, type, value, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // Save the item and refresh this restaurant's menu.
  async function handleSaveMenuItem(e) {
    e.preventDefault();

    if (savingRef.current) return;

    const values = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      priceFils: Number(formData.priceFils),
      available: formData.available,
    };
    const validateionErrors = validateMenuItem(values);
    setErrors(validateionErrors);

    if (Object.keys(validateionErrors).length > 0) return;

    const requestOwner = fromOwnerRef.current;
    const requestToken = token;

    // Check that the reply still belongs to this form and session.
    const isCurrrentRequset = () =>
      requestOwner !== null &&
      fromOwnerRef.current === requestOwner &&
      sessionStorage.getItem("meen-talab-sho.token") === requestToken;

    if (!isCurrrentRequset()) return;

    savingRef.current = true;
    setIsSaving(true);

    try {
      if (editingId !== null) {
        if (!values.available) {
          const latestItems = await getRestaurantMenu(
            restaurantId,
            requestToken,
          );

          if (!isCurrrentRequset()) return;

          const currentItem = latestItems.find((item) => item.id === editingId);

          const availableCount = latestItems.filter(
            (item) => item.available,
          ).length;

          if (currentItem?.available && availableCount === 1) {
            const confirmed = window.confirm(
              "This is the last available item. " +
                "Disabling it does not close the restaurant, Continue?",
            );

            if (!confirmed) return;
          }
        }

        if (!isCurrrentRequset()) return;

        await updateMenuItem(restaurantId, editingId, values, requestToken);
      } else {
        await createMenuItem(restaurantId, values, requestToken);
      }

      if (!isCurrrentRequset()) return;

      resetMenuForm();
      reloadMenu();
    } catch (error) {
      if (!isCurrrentRequset()) return;

      const httpStatus = error.response?.status;
      const apiError = error.response?.data?.error;

      if (httpStatus === 401) {
        invalidateSession(requestToken);
        return;
      }

      const fieldErrors = {};

      if (apiError?.code === "VALIDATION_ERROR") {
        for (const field of Object.keys(meneMessages)) {
          if (apiError.fields?.[field]) {
            fieldErrors[field] = meneMessages[field];
          }
        }
      }

      if (apiError?.code === "INVALID_PRICE") {
        fieldErrors.priceFils = meneMessages.priceFils;
      }

      if (httpStatus === 403) {
        fieldErrors.form = "Your account cannot save menu items.";
      }

      if (httpStatus === 404) {
        fieldErrors.form =
          "Restaurant or menu item not found. Cancel editing and refresh.";
        reloadMenu();
      }

      setErrors(fieldErrors);

      if (Object.keys(fieldErrors).length === 0) {
        console.error(
          "MENU_ITEM_SAVE_FAILED",
          apiError?.code ?? error.code ?? "UNKNOWN_ERROR",
        );
      }
    } finally {
      if (fromOwnerRef.current === requestOwner) {
        savingRef.current = false;
        setIsSaving(false);
      }
    }
  }
  if (result?.key !== key) {
    return <p role="status">Menu items are loading...</p>;
  }

  if (result.status === "forbidden" || result.status === "notFound") {
    return (
      <section>
        <h2>
          {result.status === "forbidden"
            ? "You cannot access this restaurant."
            : "Restaurant not found."}
        </h2>

        <Link to="/admin/restaurants">Back to Restaurants</Link>
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

  return (
    <section>
      <h2>Menu Management</h2>

      <Link to="/admin/restaurants">Back to Restaurant</Link>

      <button type="button" onClick={reloadMenu} disabled={isSaving}>
        Update List!
      </button>

      <form onSubmit={handleSaveMenuItem} noValidate>
        <h3>{editingId !== null ? "Edit Menu" : "Add Menu Items"}</h3>

        <fieldset disabled={isSaving}>
          {/* Show the name and catogory field.*/}
          {["name", "category"].map((field) => (
            <div key={field}>
              <label htmlFor={`menu-${field}`}>
                {field === "name" ? "Name" : "Category"}
              </label>

              <input
                id={`menu-${field}`}
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
            <label htmlFor="menu-price">Price (fils)</label>
            <input
              id="menu-price"
              name="priceFils"
              type="number"
              min="1"
              max="1000000"
              step="1"
              value={formData.priceFils}
              onChange={handleFormChange}
              required
            />

            {errors.priceFils && <p role="alert">{errors.priceFils}</p>}
          </div>

          <label htmlFor="menu-available">
            <input
              id="menu-available"
              name="available"
              type="checkbox"
              checked={formData.available}
              onChange={handleFormChange}
            />
            Available
          </label>

          {errors.form && <p role="alert">{errors.form}</p>}

          <button type="submit">
            {isSaving
              ? "Saving.."
              : editingId !== null
                ? "Save Changes"
                : "Add Item"}
          </button>
          {editingId !== null && (
            <button type="button" onClick={resetMenuForm} disabled={isSaving}>
              Cancel
            </button>
          )}
        </fieldset>
      </form>

      {result.items.length === 0 ? (
        <p>No menu items yet.</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Category</th>
              <th scope="col">Price</th>
              <th scope="col">Availability</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* Show one row for each menu item. */}
            {result.items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td dir="ltr">{(item.priceFils / 1000).toFixed(3)} JOD</td>
                <td>{item.available ? "Available" : "Unavailable"}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleEditMenuItem(item)}
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
