import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (typeof logout === "function") {
      logout();
    } else {
      localStorage.clear();
    }
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 text-sm font-bold tracking-wider transition-colors uppercase ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <nav className="bg-slate-950 border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo BOT-INES */}
          <div className="flex items-center">
            <NavLink to="/club" className="flex items-center">
              <span className="font-black text-3xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-indigo-500 select-none">
                BOT-INES
              </span>
            </NavLink>
          </div>

          {/* Menú Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink to="/club" end className={navLinkClass}>
              Mi Club
            </NavLink>
            <NavLink to="/club/players" className={navLinkClass}>
              Jugadores
            </NavLink>
            <NavLink to="/club/behaviors" className={navLinkClass}>
              Comportamientos
            </NavLink>
            <NavLink to="/friendlies" className={navLinkClass}>
              Amistosos
            </NavLink>
            <NavLink to="/leagues" className={navLinkClass}>
              Ligas
            </NavLink>
            <NavLink to="/ranking" className={navLinkClass}>
              Ranking
            </NavLink>
            

            <button
              type="button"
              onClick={handleLogout}
              className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-bold uppercase transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}