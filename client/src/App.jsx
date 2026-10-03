import { Routes, Route, Navigate } from "react-router-dom";
import ClubPage from "./pages/ClubPage";
import FriendliesPage from "./pages/FriendliesPage";
import LoginPage from "./pages/LoginPage";
import JoinFriendlyPage from "./pages/JoinFriendlyPage";
import RegisterPage from "./pages/RegisterPage";
import BehaviorsPage from "./pages/BehaviorsPage";
import CreatePlayerPage from "./pages/CreatePlayerPage";
import PlayersPage from "./pages/PlayersPage"; 
import ClubDashboardPage from "./pages/ClubDashboardPage";
import CreateFriendlyPage from "./pages/CreateFriendlyPage";

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
          <Route path="/" element={<Navigate to="/register" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/friendlies" element={<FriendliesPage />} />
          <Route path="/friendlies/create" element={<CreateFriendlyPage />} />
          <Route path="/friendlies/:friendlyId/join" element={<JoinFriendlyPage />} />
          <Route path="/create-club" element={<ClubPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/club/players/create" element={<CreatePlayerPage />} />
          <Route path="/club/players" element={<PlayersPage />} />

          <Route path="/club" element={<ClubDashboardPage />} />
          <Route path="/club/behaviors" element={<BehaviorsPage />} />
        </Routes>
      </main>
    </div>
  );
}