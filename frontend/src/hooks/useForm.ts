import { useState } from "react";

interface FormErrors {
  [key: string]: string;
}

export const useForm = <T extends Record<string, any>>(
  initialState: T,
  onSubmit: (data: T) => Promise<void>
) => {
  const [formData, setFormData] = useState<T>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error: any) {
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