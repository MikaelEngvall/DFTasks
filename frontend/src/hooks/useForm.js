import { useState } from "react";

export const useForm = (initialState = {}, onSubmit = () => {}) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
      setErrors(error.response?.data || { general: "Ett fel uppstod" });
    }
  };

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  return {
    formData,
    setFormData,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
  };
};
