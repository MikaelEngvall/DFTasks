import axiosInstance from "./axios";

export const updateProfile = async (userData) => {
  try {
    const response = await axiosInstance.patch("/profile", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await axiosInstance.patch(
      "/profile/change-password",
      passwordData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
