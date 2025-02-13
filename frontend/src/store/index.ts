import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import tasksReducer from "./slices/tasksSlice";
import authReducer from "./slices/authSlice";

const tasksPersistConfig = {
  key: "tasks",
  storage,
  whitelist: ["tasks", "selectedTask"],
};

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "token"],
};

export const store = configureStore({
  reducer: {
    tasks: persistReducer(tasksPersistConfig, tasksReducer),
    auth: persistReducer(authPersistConfig, authReducer),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store; 