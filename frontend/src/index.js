//index.js

import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import store from "./redux/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <ToastContainer bodyStyle={{ fontFamily: "Roboto" }} />
        <App />
      </Provider>
    </I18nextProvider>
  </React.StrictMode>
);
