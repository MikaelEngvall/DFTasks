import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { tasksAPI } from "../../services/api";
import { toast } from "react-hot-toast";
import TaskService from "../../services/TaskService";
import { normalize, schema } from 'normalizr';

// Normalizr schemas
const taskSchema = new schema.Entity('tasks');
const taskListSchema = [taskSchema];

// Async thunks
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (filters, { rejectWithValue }) => {
    try {
      const tasks = await TaskService.getTasks(filters);
      return normalize(tasks, taskListSchema);
    } catch (error) {
      return rejectWithValue(error.message);
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
  async ({ id, status }, { dispatch, rejectWithValue }) => {
    try {
      // Optimistisk uppdatering
      dispatch(optimisticUpdateStatus({ id, status }));
      
      const updatedTask = await TaskService.updateStatus(id, status);
      return normalize(updatedTask, taskSchema);
    } catch (error) {
      // Återställ vid fel
      dispatch(optimisticUpdateStatus({ id, status: error.originalStatus }));
      return rejectWithValue(error.message);
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
  entities: {},
  ids: [],
  loading: 'idle',
  error: null,
  filters: {
    status: 'all',
    search: '',
    sortBy: 'dueDate',
    sortOrder: 'asc'
  },
  selectedTaskId: null,
  cache: {
    timestamp: null,
    ttl: 5 * 60 * 1000 // 5 minuter
  }
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    optimisticUpdateStatus: (state, action) => {
      const { id, status } = action.payload;
      if (state.entities[id]) {
        state.entities[id].status = status;
      }
    },
    selectTask: (state, action) => {
      state.selectedTaskId = action.payload;
    },
    invalidateCache: (state) => {
      state.cache.timestamp = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = 'idle';
        state.entities = action.payload.entities.tasks;
        state.ids = action.payload.result;
        state.cache.timestamp = Date.now();
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = 'idle';
        state.error = action.payload;
      })
      // createTask
      .addCase(createTask.fulfilled, (state, action) => {
        state.entities[action.payload._id] = action.payload;
      })
      // updateTaskStatus
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const { tasks } = action.payload.entities;
        Object.assign(state.entities, tasks);
      })
      // toggleTaskStatus
      .addCase(toggleTaskStatus.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        state.entities[updatedTask._id] = updatedTask;
      })
      // addComment
      .addCase(addComment.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        state.entities[updatedTask._id] = updatedTask;
      });
  },
});

// Selectors
export const selectTasksState = (state) => state.tasks;

export const selectAllTasks = createSelector(
  [selectTasksState],
  (tasksState) => tasksState.ids.map(id => tasksState.entities[id])
);

export const selectFilteredTasks = createSelector(
  [selectAllTasks, (state) => state.tasks.filters],
  (tasks, filters) => {
    let result = [...tasks];
    
    // Filtrera efter status
    if (filters.status !== 'all') {
      result = result.filter(task => task.status === filters.status);
    }
    
    // Sök
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Sortering
    result.sort((a, b) => {
      const aValue = a[filters.sortBy];
      const bValue = b[filters.sortBy];
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
    
    return result;
  }
);

export const selectSelectedTask = createSelector(
  [selectTasksState],
  (tasksState) => tasksState.selectedTaskId ? 
    tasksState.entities[tasksState.selectedTaskId] : 
    null
);

export const selectShouldFetchTasks = createSelector(
  [selectTasksState],
  (tasksState) => {
    if (!tasksState.cache.timestamp) return true;
    
    const now = Date.now();
    return now - tasksState.cache.timestamp > tasksState.cache.ttl;
  }
);

export const { 
  setFilters, 
  optimisticUpdateStatus, 
  selectTask,
  invalidateCache 
} = tasksSlice.actions;

export default tasksSlice.reducer;
