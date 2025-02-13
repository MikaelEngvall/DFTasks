import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { tasksAPI } from "../../services/api";
import { toast } from "react-hot-toast";

// Async thunks
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async ({ showInactive = false }, { rejectWithValue }) => {
    try {
      const response = await tasksAPI.getTasks(showInactive);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Kunde inte hämta uppgifter"
      );
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await tasksAPI.createTask(taskData);
      toast.success("Uppgift skapad");
      return response.data;
    } catch (error) {
      toast.error("Kunde inte skapa uppgift");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  "tasks/updateStatus",
  async ({ taskId, status }, { rejectWithValue }) => {
    try {
      const response = await tasksAPI.updateTaskStatus(taskId, status);
      return response.data;
    } catch (error) {
      toast.error("Kunde inte uppdatera status");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const toggleTaskStatus = createAsyncThunk(
  "tasks/toggleStatus",
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await tasksAPI.toggleTaskStatus(taskId);
      return response.data;
    } catch (error) {
      toast.error("Kunde inte ändra uppgiftsstatus");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const addComment = createAsyncThunk(
  "tasks/addComment",
  async ({ taskId, content }, { rejectWithValue }) => {
    try {
      const response = await tasksAPI.addComment(taskId, content);
      return response.data;
    } catch (error) {
      toast.error("Kunde inte lägga till kommentar");
      return rejectWithValue(error.response?.data);
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  selectedTask: null,
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.items = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    addTask: (state, action) => {
      state.items.push(action.payload);
    },
    updateTask: (state, action) => {
      const index = state.items.findIndex(
        (task) => task._id === action.payload._id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeTask: (state, action) => {
      state.items = state.items.filter((task) => task._id !== action.payload);
    },
    optimisticUpdateTask: (state, action) => {
      const updatedTask = action.payload;
      const index = state.items.findIndex(
        (task) => task._id === updatedTask._id
      );
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updatedTask };
      }
    },
    optimisticAddComment: (state, action) => {
      const { taskId, comment } = action.payload;
      const task = state.items.find((task) => task._id === taskId);
      if (task) {
        if (!task.comments) task.comments = [];
        task.comments.unshift(comment);
      }
      if (state.selectedTask?._id === taskId) {
        if (!state.selectedTask.comments) state.selectedTask.comments = [];
        state.selectedTask.comments.unshift(comment);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createTask
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // updateTaskStatus
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        const index = state.items.findIndex(
          (task) => task._id === updatedTask._id
        );
        if (index !== -1) {
          state.items[index] = updatedTask;
        }
        if (state.selectedTask?._id === updatedTask._id) {
          state.selectedTask = updatedTask;
        }
      })
      // toggleTaskStatus
      .addCase(toggleTaskStatus.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        const index = state.items.findIndex(
          (task) => task._id === updatedTask._id
        );
        if (index !== -1) {
          state.items[index] = updatedTask;
        }
        if (state.selectedTask?._id === updatedTask._id) {
          state.selectedTask = updatedTask;
        }
      })
      // addComment
      .addCase(addComment.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        const index = state.items.findIndex(
          (task) => task._id === updatedTask._id
        );
        if (index !== -1) {
          state.items[index] = updatedTask;
        }
        if (state.selectedTask?._id === updatedTask._id) {
          state.selectedTask = updatedTask;
        }
      });
  },
});

export const {
  setTasks,
  setLoading,
  setError,
  setSelectedTask,
  addTask,
  updateTask,
  removeTask,
  optimisticUpdateTask,
  optimisticAddComment,
} = tasksSlice.actions;

export const selectTasks = (state) => state.tasks.items;
export const selectLoading = (state) => state.tasks.loading;
export const selectError = (state) => state.tasks.error;
export const selectSelectedTask = (state) => state.tasks.selectedTask;

export default tasksSlice.reducer;
