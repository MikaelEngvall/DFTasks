import { createSlice, createAsyncThunk, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { tasksAPI } from "../../services/api";
import { toast } from "react-hot-toast";
import { TaskService } from '../../services/TaskService';
import { ErrorHandler } from '../../utils/errorHandler';

// Skapa en entity adapter för normaliserad state
const tasksAdapter = createEntityAdapter({
  selectId: (task) => task.id,
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
});

// Initial state med adapter
const initialState = tasksAdapter.getInitialState({
  loading: 'idle',
  error: null,
  filters: {
    status: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  selectedTaskId: null,
  cache: {
    timestamp: null,
    ttl: 5 * 60 * 1000, // 5 minuter
  },
});

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (filters, { getState, rejectWithValue }) => {
    try {
      const state = getState().tasks;
      const now = Date.now();

      // Kontrollera cache
      if (
        state.cache.timestamp &&
        now - state.cache.timestamp < state.cache.ttl &&
        !filters?.forceRefresh
      ) {
        return null; // Använd cachad data
      }

      const tasks = await TaskService.getTasks(filters);
      return tasks;
    } catch (error) {
      return rejectWithValue(ErrorHandler.handle(error));
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

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, changes }, { dispatch, rejectWithValue }) => {
    try {
      // Optimistisk uppdatering
      dispatch(tasksSlice.actions.updateOneOptimistic({ id, changes }));

      const updatedTask = await TaskService.updateTask(id, changes);
      return updatedTask;
    } catch (error) {
      // Återställ vid fel
      dispatch(tasksSlice.actions.undoOptimisticUpdate({ id }));
      return rejectWithValue(ErrorHandler.handle(error));
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

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    updateOneOptimistic: tasksAdapter.updateOne,
    undoOptimisticUpdate: (state, action) => {
      const { id } = action.payload;
      const original = state.backup?.[id];
      if (original) {
        tasksAdapter.updateOne(state, { id, changes: original });
        delete state.backup[id];
      }
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    selectTask: (state, action) => {
      state.selectedTaskId = action.payload;
    },
    invalidateCache: (state) => {
      state.cache.timestamp = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        if (action.payload) {
          tasksAdapter.setAll(state, action.payload);
          state.cache.timestamp = Date.now();
        }
        state.loading = 'idle';
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = 'idle';
        state.error = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        tasksAdapter.addOne(state, action.payload);
      })
      .addCase(updateTask.pending, (state, action) => {
        const { id, changes } = action.meta.arg;
        // Spara original för eventuell återställning
        state.backup = state.backup || {};
        state.backup[id] = state.entities[id];
      })
      .addCase(toggleTaskStatus.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        tasksAdapter.updateOne(state, { id: updatedTask._id, changes: updatedTask });
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        tasksAdapter.updateOne(state, { id: updatedTask._id, changes: updatedTask });
      });
  },
});

// Selectors
export const {
  selectAll: selectAllTasks,
  selectById: selectTaskById,
  selectIds: selectTaskIds,
} = tasksAdapter.getSelectors((state) => state.tasks);

// Memoized selectors
export const selectFilteredTasks = createSelector(
  [selectAllTasks, (state) => state.tasks.filters],
  (tasks, filters) => {
    let result = [...tasks];

    // Filtrera efter status
    if (filters.status !== 'all') {
      result = result.filter((task) => task.status === filters.status);
    }

    // Sök
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower)
      );
    }

    // Sortering
    result.sort((a, b) => {
      const aValue = a[filters.sortBy];
      const bValue = b[filters.sortBy];
      return filters.sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    return result;
  }
);

export const selectSelectedTask = createSelector(
  [selectTaskById, (state) => state.tasks.selectedTaskId],
  (tasks, selectedId) => selectedId ? tasks[selectedId] : null
);

export const selectShouldFetchTasks = createSelector(
  [selectTaskById, (state) => state.tasks.cache],
  (tasks, cache) => {
    if (!cache.timestamp) return true;
    
    const now = Date.now();
    return now - cache.timestamp > cache.ttl;
  }
);

export const { setFilters, selectTask, invalidateCache } = tasksSlice.actions;

export default tasksSlice.reducer;
