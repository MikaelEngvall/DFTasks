import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from './providers/AuthProvider';
import { TranslationProvider } from './providers/TranslationProvider';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppRoutes from './routes';

function App() {
  return (
    <ErrorBoundary>
      <TranslationProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </BrowserRouter>
        </AuthProvider>
      </TranslationProvider>
    </ErrorBoundary>
  );
}

export default App;
