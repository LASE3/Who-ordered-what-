import React, { useEffect, useReducer, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
  getRestaurant,
  getRestaurantMenu,
} from "../services/restaurantsService";
import { createGroupOrder } from "../services/ordersService";
import {
  createInitialOrderState,
  orderFormReducer,
} from "../reducers/orderFormReducer";
import {
  validateOrderForm,
  getOrderFieldErrors,
  orderMessages,
} from "../utils/orderFromValidation.js";
