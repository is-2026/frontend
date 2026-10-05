import { useNavigate } from "react-router-dom";

export function ClubDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 shadow-2xl w-full">
      {/* Encabezado centrado */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Panel de mi Club
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Gestioná la plantilla y los comportamientos de tu equipo
        </p>
      </div>

      {/* Botones de acción centrados y bordes rectos */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button 
          onClick={() => navigate("/club/players")}
          className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-3 px-6 transition-all duration-200 shadow-md"
        >
          Ver mi plantilla
        </button>

        <button 
          onClick={() => navigate("/club/behaviors")}
          className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold py-3 px-6 transition-all duration-200 shadow-md"
        >
          Ver mis comportamientos
        </button>
      </div>
    </div>
  );
}