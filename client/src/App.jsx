import { Routes, Route, Navigate } from "react-router-dom";
import ClubPage from "./pages/ClubPage";
import FriendliesPage from "./pages/FriendliesPage";
import LoginPage from "./pages/LoginPage";
import JoinFriendlyPage from "./pages/JoinFriendlyPage";
import RegisterPage from "./pages/RegisterPage";
import BehavioursPage from "./pages/Behaviors";
import BehaviorDetail from "./pages/BehaviorDetail";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <header className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 tracking-wider uppercase drop-shadow-md">
          Bot-ines
        </h1>
      </header>

      <main className="w-full max-w-2xl">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/friendlies" element={<FriendliesPage />} />
          <Route path="/friendlies/:friendlyId/join" element={<JoinFriendlyPage />} />
          <Route path="/create-club" element={<ClubPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/club"
            element={
              <div className="bg-slate-900 border border-slate-800 p-8 text-center shadow-xl">
                <h2 className="text-2xl font-semibold">Mi Club</h2>
                <p className="text-slate-400 mt-2">El club se creó correctamente.</p>
              </div>
            }
          />
          <Route path="/club/behaviors" element={<BehavioursPage />} />
          <Route path="/club/behaviors/:id" element={<BehaviorDetail />} />
        </Routes>
      </main>
    </div>
  );
}