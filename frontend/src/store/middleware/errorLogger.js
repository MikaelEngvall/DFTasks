import { isRejectedWithValue } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';

export const rtkQueryErrorLogger = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    console.error('API Error:', action.payload);
    toast.error(action.payload.message || 'Ett fel uppstod');
  }

  return next(action);
}; 