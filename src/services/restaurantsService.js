import axios from "axios";

const restaurantsApi = axios.create({

    baseURL: "/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Get the restaurants list.
export async function getRestaurants(token) {
    const response = await restaurantsApi.get("/restaurants", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
}

// Add a closed restaurant. 
export async function createRestaurant(
    { name, category, description = "" },
    token,
) {
    const response = await restaurantsApi.post(
        "/admin/restaurants", {
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        isOpen: false,
    },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );
    return response.data.data;
}

// Update the selected restaurant fields.
export async function updateRestaurant(restaurentId, changes, token) {
    const response = await restaurantsApi.patch(
        `/admin/restaurants/${encodeURIComponent(restaurentId)}`,
        changes, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    },
    );
    return response.data.data;
}

// Get all menu items for one restaurant.
export async function getRestaurantMenu(restaurantId, token) {

    const response = await restaurantsApi.get(
        `restaurants/${encodeURIComponent(restaurantId)}/menu`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );
    return response.data.data;
}

// Add a menu item to the selected restaurant.
export async function createMenuItem(
    restaurantId,
    { name, category, priceFils, available = true },
    token,
) {
    const response = await restaurantsApi.post(
        `/admin/restaurants/${encodeURIComponent(restaurantId)}/menu`,
        {
            name: name.trim(),
            category: category.trim(),
            priceFils,
            available,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );
    return response.data.data;
}

// Update a menu item in the selected restaurant.
export async function updateMenuItem(
    restaurantId,
    itemId,
    changes,
    token,
) {
    const response = await restaurantsApi.patch(
        `/admin/restaurants/${encodeURIComponent(restaurantId)}/menu/${encodeURIComponent(itemId)}`,
        changes, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    },
    );
    return response.data.data;
}

// Get the selected restaurasnt details
export async function getRestaurant(restaurantId, token) {
    const response = await restaurantsApi.get(
        `/restaurants/${encodeURIComponent(restaurantId)}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    return response.data.data;
}