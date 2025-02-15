import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { rootReducer } from './reducers';
import { rtkQueryErrorLogger } from './middleware/errorLogger';
import { setupListeners } from '@reduxjs/toolkit/query';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Endast auth-state persisteras
  blacklist: ['tasks', 'users'] // Dessa states persisteras inte
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    }).concat(rtkQueryErrorLogger),
  devTools: process.env.NODE_ENV !== 'production'
});

export const persistor = persistStore(store);

setupListeners(store.dispatch); 