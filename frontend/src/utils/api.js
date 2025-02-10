import axiosInstance from "./axios";

export const updateProfile = async (userData) => {
  try {
    const response = await axiosInstance.patch("/profile", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
