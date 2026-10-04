import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import { ClubPage } from "./pages/ClubPage";
import { CreateFriendlyPage } from "./pages/CreateFriendlyPage";
import { FriendliesPage } from "./pages/FriendliesPage";
import { LoginPage } from "./pages/LoginPage";
import { JoinFriendlyPage } from "./pages/JoinFriendlyPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LobbyPage } from "./pages/LobbyPage";
import { MatchPage } from "./pages/MatchPage";
import { BehaviorsPage } from "./pages/BehaviorsPage";
import { CreatePlayerPage } from "./pages/CreatePlayerPage";
import { PlayersPage } from "./pages/PlayersPage"; 
import { ClubDashboardPage } from "./pages/ClubDashboardPage";
import { BehaviorDetail } from "./pages/BehaviorDetail";

//layout para vistas autenticadas / protegidas con Navbar
function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}

// layout para vistas públicas (Login, Register, Crear Club) sin Navbar
function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 tracking-wider uppercase drop-shadow-md">
          Bot-ines
        </h1>
      </header>

      <main className="w-full max-w-md">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Rutas Públicas: Muestran "Bot-ines" centrado */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create-club" element={<ClubPage />} />
      </Route>

      {/* Rutas Protegidas / Internas: Tienen el Navbar arriba */}
      <Route element={<MainLayout />}>
        <Route path="/club" element={<ClubDashboardPage />} />
        <Route path="/club/players" element={<PlayersPage />} />
        <Route path="/club/players/create" element={<CreatePlayerPage />} />
        <Route path="/club/behaviors" element={<BehaviorsPage />} />
        <Route path="/club/behaviors/:id" element={<BehaviorDetail />} />

        <Route path="/friendlies" element={<FriendliesPage />} />
        <Route path="/friendlies/create" element={<CreateFriendlyPage />} />
        <Route path="/friendlies/:friendlyId/join" element={<JoinFriendlyPage />} />
        <Route path="/friendlies/:friendlyId/lobby" element={<LobbyPage />} />
        <Route path="/match/:matchId" element={<MatchPage />} />
      </Route>
    </Routes>
  );
}