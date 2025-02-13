import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { tasksAPI } from "../../services/api";
import { toast } from "react-hot-toast";

// Async thunks
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async ({ showInactive = false }, { rejectWithValue }) => {
    try {
      const response = await (showInactive
        ? tasksAPI.getAllTasks()
        : tasksAPI.getTasks());
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
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Kunde inte skapa uppgift"
      );
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
      return rejectWithValue(
        error.response?.data || "Kunde inte uppdatera status"
      );
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
      return rejectWithValue(
        error.response?.data || "Kunde inte ändra uppgiftsstatus"
      );
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
      return rejectWithValue(
        error.response?.data || "Kunde inte lägga till kommentar"
      );
    }
  }
);

const tasksSlice = createSlice({
  name: "tasks",
  initialState: {
    items: [],
    loading: false,
    error: null,
    selectedTask: null,
    cache: {
      timestamp: null,
      showInactive: false,
    },
  },
  reducers: {
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    optimisticUpdateTask: (state, action) => {
      const index = state.items.findIndex(
        (task) => task._id === action.payload._id
      );
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    optimisticAddComment: (state, action) => {
      const { taskId, comment } = action.payload;
      const task = state.items.find((task) => task._id === taskId);
      if (task) {
        if (!task.comments) task.comments = [];
        task.comments.unshift(comment);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.cache.timestamp = Date.now();
        state.cache.showInactive = action.meta.arg.showInactive;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Create task
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        toast.success("Uppgift skapad");
      })
      .addCase(createTask.rejected, (state, action) => {
        toast.error(action.payload);
      })
      // Update task status
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (task) => task._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        toast.success("Status uppdaterad");
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        toast.error(action.payload);
      })
      // Toggle task status
      .addCase(toggleTaskStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (task) => task._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        toast.success(
          action.payload.isActive ? "Uppgift aktiverad" : "Uppgift inaktiverad"
        );
      })
      .addCase(toggleTaskStatus.rejected, (state, action) => {
        toast.error(action.payload);
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (task) => task._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        toast.success("Kommentar tillagd");
      })
      .addCase(addComment.rejected, (state, action) => {
        toast.error(action.payload);
      });
  },
});

export const { setSelectedTask, optimisticUpdateTask, optimisticAddComment } =
  tasksSlice.actions;

export default tasksSlice.reducer;
