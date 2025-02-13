import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { tasksAPI } from "../../services/api";
import { toast } from "react-hot-toast";
import {
  Task,
  TasksState,
  FetchTasksParams,
  UpdateTaskStatusParams,
  AddCommentParams,
  OptimisticAddCommentParams,
  APIResponse,
} from "../../types/task";
import { RootState } from "../index";

// Async thunks
export const fetchTasks = createAsyncThunk<
  Task[],
  FetchTasksParams,
  { rejectValue: string }
>("tasks/fetchTasks", async ({ showInactive = false }, { rejectWithValue }) => {
  try {
    const response = await tasksAPI.getTasks(showInactive);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Error fetching tasks");
  }
});

export const createTask = createAsyncThunk<
  Task,
  Partial<Task>,
  { rejectValue: string }
>("tasks/createTask", async (taskData, { rejectWithValue }) => {
  try {
    const response = await tasksAPI.createTask(taskData);
    toast.success("Uppgift skapad");
    return response.data;
  } catch (error: any) {
    toast.error("Kunde inte skapa uppgift");
    return rejectWithValue(error.response?.data?.message || "Error creating task");
  }
});

export const updateTaskStatus = createAsyncThunk<
  Task,
  UpdateTaskStatusParams,
  { rejectValue: string }
>("tasks/updateTaskStatus", async ({ taskId, status }, { rejectWithValue }) => {
  try {
    const response = await tasksAPI.updateTaskStatus(taskId, status);
    return response.data;
  } catch (error: any) {
    toast.error("Kunde inte uppdatera status");
    return rejectWithValue(error.response?.data?.message || "Error updating task status");
  }
});

export const toggleTaskStatus = createAsyncThunk<
  Task,
  string,
  { rejectValue: string }
>("tasks/toggleStatus", async (taskId, { rejectWithValue }) => {
  try {
    const response = await tasksAPI.toggleTaskStatus(taskId);
    return response.data;
  } catch (error: any) {
    toast.error("Kunde inte ändra uppgiftsstatus");
    return rejectWithValue(error.response?.data);
  }
});

export const addComment = createAsyncThunk<
  Task,
  AddCommentParams,
  { rejectValue: string }
>("tasks/addComment", async ({ taskId, content }, { rejectWithValue }) => {
  try {
    const response = await tasksAPI.addComment(taskId, content);
    return response.data;
  } catch (error: any) {
    toast.error("Kunde inte lägga till kommentar");
    return rejectWithValue(error.response?.data?.message || "Error adding comment");
  }
});

export const archiveTask = createAsyncThunk(
  "tasks/archiveTask",
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await tasksAPI.archiveTask(taskId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error archiving task");
    }
  }
);

export const toggleCommentStatus = createAsyncThunk(
  "tasks/toggleCommentStatus",
  async ({ taskId, commentId }: { taskId: string; commentId: string }, { rejectWithValue }) => {
    try {
      const response = await tasksAPI.toggleCommentStatus(taskId, commentId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error toggling comment status");
    }
  }
);

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
  selectedTask: null,
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },
    optimisticUpdateTask: (state, action: PayloadAction<Partial<Task>>) => {
      const updatedTask = action.payload;
      const index = state.items.findIndex(
        (task) => task._id === updatedTask._id
      );
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updatedTask };
      }
    },
    optimisticAddComment: (
      state,
      action: PayloadAction<OptimisticAddCommentParams>
    ) => {
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
        state.error = action.payload as string;
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
      })
      // archiveTask
      .addCase(archiveTask.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        const index = state.items.findIndex(
          (task) => task._id === updatedTask._id
        );
        if (index !== -1) {
          state.items[index] = updatedTask;
        }
      })
      // toggleCommentStatus
      .addCase(toggleCommentStatus.fulfilled, (state, action) => {
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

export const { setSelectedTask, optimisticUpdateTask, optimisticAddComment } =
  tasksSlice.actions;

// Selectors
export const selectTasks = (state: RootState) => state.tasks.items;
export const selectLoading = (state: RootState) => state.tasks.loading;
export const selectError = (state: RootState) => state.tasks.error;
export const selectSelectedTask = (state: RootState) => state.tasks.selectedTask;

export default tasksSlice.reducer; 