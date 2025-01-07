import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ApiProvider } from "@reduxjs/toolkit/query/react";
import { apiSlice } from "./features/api/apiSlice";
createRoot(document.getElementById("root")).render(_jsx(StrictMode, { children: _jsx(ApiProvider, { api: apiSlice, children: _jsx(App, {}) }) }));
