import "./App.css";
import StartScreen from "./features/startScreen/StartScreen";
import MatchScreen from "./features/matchScreen/MatchScreen";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout/Layout";

function App() {

  return (
    <Routes>
    <Route path="/" element={<Layout />}>

      <Route path="">
        <Route index element={<StartScreen />} />
      </Route>

      <Route path="match">
        <Route index element={<MatchScreen />} />
      </Route>

      {/* Catch all - replace with 404 component if you want */}
        <Route path="*" element={<Navigate to="/" replace />} />

    </Route>
  </Routes>
  );
}

export default App;
