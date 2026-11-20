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
export async function getOrderSummary(orderId,token){
    const response = await axios.get(
        `/api/group-orders/${encodeURIComponent(orderId)}/summary`,
        {
            headers:{
                Authorization: `Bearer ${token}`,
            },
        },
    );
    return response.data.data;
}
