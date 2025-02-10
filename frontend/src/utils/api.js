import axiosInstance from "./axios";

export const updateProfile = async (userData) => {
  try {
    const response = await axiosInstance.patch(
      `/users/${userData.id}`,
      userData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
