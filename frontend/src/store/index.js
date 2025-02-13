import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import tasksReducer from "./slices/tasksSlice";

const rootReducer = combineReducers({
  tasks: tasksReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["tasks"], // Endast tasks kommer att persisteras
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Behövs för redux-persist
    }),
});

export const persistor = persistStore(store);
