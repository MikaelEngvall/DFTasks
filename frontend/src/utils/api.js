import axiosInstance from "./axios";

export const updateProfile = async (userData) => {
  try {
    const response = await axiosInstance.put("/api/profile", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
