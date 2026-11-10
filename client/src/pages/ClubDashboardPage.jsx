import { useNavigate, useParams } from "react-router-dom";
import ProfileBanner from "../components/ProfileBanner";

export function ClubDashboardPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 shadow-2xl w-full">
      {/* Encabezado centrado */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl py-4 font-extrabold text-white tracking-tight">
            {id ? "Perfil del club" : "Panel de mi Club"}
        </h1>
        <ProfileBanner clubId={id}/>
        <p className="text-slate-400 text-sm mt-2">
          Gestioná la plantilla y los comportamientos de tu equipo
        </p>
      </div>

      {/* Botones de acción centrados y bordes rectos */}
      {!id && (<div className="flex flex-col sm:flex-row justify-center gap-4">
        <button 
          onClick={() => navigate("/club/players")}
          className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-3 px-6 transition-all duration-200 shadow-md"
        >
          Ver mi plantilla
        </button>
        <button 
          onClick={() => navigate("/club/dt")}
          className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-3 px-6 transition-all duration-200 shadow-md"
        >
          Ver mi Dt
        </button>

        <button 
          onClick={() => navigate("/club/behaviors")}
          className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold py-3 px-6 transition-all duration-200 shadow-md"
        >
          Ver mis comportamientos
        </button>
      </div>)}
    </div>
  );
}