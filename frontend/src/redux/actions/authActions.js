//redux/actions/authActions.js

import api from "../../api";
import {
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
  SAVE_PROFILE,
} from "./actionTypes";
import { toast } from "react-toastify";

export const postLoginData = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN_REQUEST });
    const { data } = await api.post("/auth/login", { email, password });
    dispatch({
      type: LOGIN_SUCCESS,
      payload: data,
    });
    localStorage.setItem("token", data.token);
    toast.success(data.msg);
  } catch (error) {
    const msg = error.response?.data?.msg || error.message;
    dispatch({
      type: LOGIN_FAILURE,
      payload: { msg },
    });
    toast.error(msg);
  }
};

export const saveProfile = (token) => async (dispatch) => {
  try {
    const { data } = await api.get("/profile", {
      headers: { Authorization: token },
    });
    dispatch({
      type: SAVE_PROFILE,
      payload: { user: data.user, token },
    });
  } catch (error) {
    const msg = error.response?.data?.msg || error.message;
    console.error("Error fetching profile:", msg);
    // Optionally, dispatch an error action or show a toast notification
  }
};

export const logout = () => (dispatch) => {
  localStorage.removeItem("token");
  dispatch({ type: LOGOUT });
  document.location.href = "/";
};
