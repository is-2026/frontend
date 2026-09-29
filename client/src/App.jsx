import { Routes, Route, Navigate } from "react-router-dom";
import AmistososPage from "./pages/AmistososPage";


export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <h1 className="text-3xl font-bold">Bot-ines</h1>
      <Routes>
        <Route path="/" element={<Navigate to="/amistosos" replace />} />
        <Route path="/amistosos" element={<AmistososPage />} /> //Esta es la página general de los amistosos.
      </Routes>
    </div>
  );
}

