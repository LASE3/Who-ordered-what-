// Crete fresh state for the new order form.
export function createInitialOrderState(restaurantId = "") {
    return {
        values: {
            restaurantId,
            title: "",
            closesAt: "",
            expectedAt: "",
            pickupLocation: "",
            deliveryFee: "0",
            note: "",
        },
        errors: {},
        submitting: false,
    };
}

// Update the form values, erros and submission state.
export function orderFormReducer(state, action) {
    switch (action.type) {
        case "CHANGE_FIELD": {
            if (
                state.submitting ||
                !Object.hasOwn(state.values, action.field)
            ) {
                return state;
            }

            const errors = { ...state.errors };
            delete errors[action.field];
            delete errors.form;

            return {
                ...state,
                values: {
                    ...state.values, [action.field]: action.value,
                },
                errors,
            };
        }
        case "SET_ERRORS":
            return {
                ...state,
                errors: {
                    ...action.errors
                },
            };
        case "SET_SUBMITTING":
            return {
                ...state,
                submitting: Boolean(action.value),
            };
        case "RESET":
            return createInitialOrderState(action.restaurantId ?? "");

        default:
            return state;
    }
}