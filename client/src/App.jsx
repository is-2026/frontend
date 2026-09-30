import { Routes, Route, Navigate } from "react-router-dom";
import  ClubPage  from "./pages/ClubPage";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <header className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 tracking-wider uppercase drop-shadow-md">
        Bot-ines
        </h1>
      </header>

    <main className="w-full max-w-md">
      <Routes>
        <Route path="/" element={<Navigate to="/create-club" replace />} />
        <Route path="create-club" element={<ClubPage />} />
        <Route path="/club" 
          element={
          <div className="bg-slate-900 border border-slate-800 p-8 text-center shadow-xl">
            <h2 className="text-2xl font-semibold">Mi Club</h2>
            <p className="text-slate-400 mt-2">El club se creó correctamente.</p>
          </div>
          }
          />
      </Routes>
    </main>
    </div>
  );
}