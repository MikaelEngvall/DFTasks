import { combineReducers } from '@reduxjs/toolkit';
import tasksReducer from '../slices/tasksSlice';
import authReducer from '../slices/authSlice';
import usersReducer from '../slices/usersSlice';

export const rootReducer = combineReducers({
  tasks: tasksReducer,
  auth: authReducer,
  users: usersReducer
}); 