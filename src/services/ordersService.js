import axios from "axios";

// Get one order for the signed-in user.
export async function getGroupOrder(orderId, token) {
    const response = await axios.get(
        `/api/group-orders/${encodeURIComponent(orderId)}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );
    return response.data.data;
}

// Get the organizer's order summary.
export async function getOrderSummary(orderId, token) {
    const response = await axios.get(
        `/api/group-orders/${encodeURIComponent(orderId)}/summary`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );
    return response.data.data;
}

// Create a group  order for the signed-in user. 
export async function createGroupOrder({ restaurantId,
    title,
    closesAt,
    expectedAt,
    pickupLocation,
    deliveryFeeFils,
    note = "", },
    token,
) {
    const response = await axios.post(
        "/api/group-orders", {
        restaurantId,
        title: title.trim(),
        closesAt,
        expectedAt,
        pickupLocation: pickupLocation.trim(),
        deliveryFeeFils,
        note: note.trim(),
    },
        {
            timeout: 10000,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );
    return response.data.data;
}