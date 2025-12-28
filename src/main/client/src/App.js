import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import "./App.css";
import StartScreen from "./features/startScreen/StartScreen";
import MatchScreen from "./features/matchScreen/MatchScreen";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout/Layout";
function App() {
    return (_jsx(Routes, { children: _jsxs(Route, { path: "/", element: _jsx(Layout, {}), children: [_jsx(Route, { path: "", children: _jsx(Route, { index: true, element: _jsx(StartScreen, {}) }) }), _jsx(Route, { path: "match", children: _jsx(Route, { index: true, element: _jsx(MatchScreen, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }));
}
export default App;
