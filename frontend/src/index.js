//index.js

import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <ThemeProvider>
          <ToastContainer bodyStyle={{ fontFamily: "Roboto" }} />
          <App />
        </ThemeProvider>
      </AuthProvider>
    </I18nextProvider>
  </React.StrictMode>
);
