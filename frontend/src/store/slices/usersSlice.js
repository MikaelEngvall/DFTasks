import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { UserService } from '../../services/UserService';

const initialState = {
  entities: {},
  ids: [],
  loading: 'idle',
  error: null
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async () => {
    const users = await UserService.getUsers();
    return users;
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = 'idle';
        state.entities = action.payload.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
        state.ids = action.payload.map(user => user.id);
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = 'idle';
        state.error = action.error.message;
      });
  }
});

export default usersSlice.reducer; 