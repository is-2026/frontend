import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center"><h1 className="text-3xl font-bold">Bot-ines Inicio</h1></div>} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/crear-club" element={<div className="text-white text-center mt-10">Pantalla de Club Provisoria</div>} />
      </Routes>
    </BrowserRouter>
  );
}