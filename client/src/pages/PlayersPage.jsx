import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlayers } from "../services/club";

export default function PlayersPage() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true); // Corregido: decía 'loadign'
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                setLoading(true);
                const data = await getPlayers();
                setPlayers(Array.isArray(data) ? data : data.players || []);
            } catch (err) {
                setError(err.message || "No se pudo cargar la plantilla de jugadores.");
            } finally {
                setLoading(false);
            }
        };

        fetchPlayers();
    }, []);

    if (loading) {
        return (
            <div className="bg-slate-900 border border-slate-800 p-8 shadow-2xl w-full text-center flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-300 text-sm">Cargando plantilla del equipo...</p>
            </div>
        );
    }

    return (
    <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl w-full max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Plantilla del Club
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Revisá la lista de jugadores y sus estadísticas PACSS.
          </p>
        </div>
        <button
          onClick={() => navigate("/club/players/create")}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md self-start sm:self-auto"
        >
          + Agregar Jugador
        </button>
      </div>

      {/* Cartel de error */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/40 border border-red-500/50 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Si la plantilla está vacía */}
      {!error && players.length === 0 && (
        <div className="text-center py-12 bg-slate-950 border border-slate-800 p-6">
          <p className="text-slate-400 text-base mb-4">
            Aún no tenés jugadores en tu plantilla.
          </p>
          <button
            onClick={() => navigate("/club/players/create")}
            className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md"
          >
            Crear el primer jugador
          </button>
        </div>
      )}

      {/* Tarjetas de Jugadores */}
      {players.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => {
            const totalPacss =
              (player.power || 0) +
              (player.agility || 0) +
              (player.control || 0) +
              (player.speed || 0) +
              (player.strength || 0);

            return (
              <div
                key={player.id || player._id || player.number}
                className="bg-slate-950 border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                {/* Camiseta y Nombre */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 text-white font-black text-xl flex items-center justify-center shrink-0 border border-blue-400">
                    #{player.number}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-lg font-bold text-white truncate">
                      {player.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Total PACSS: <span className="text-emerald-400 font-bold">{totalPacss} pts</span>
                    </p>
                  </div>
                </div>

                {/* Desglose PACSS */}
                <div className="grid grid-cols-5 gap-1 bg-slate-900 p-2.5 border border-slate-800/80 text-center text-xs">
                  <div>
                    <span className="block text-slate-500 font-medium">POW</span>
                    <span className="font-bold text-slate-200">{player.power}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-medium">AGI</span>
                    <span className="font-bold text-slate-200">{player.agility}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-medium">CTR</span>
                    <span className="font-bold text-slate-200">{player.control}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-medium">SPD</span>
                    <span className="font-bold text-slate-200">{player.speed}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-medium">STR</span>
                    <span className="font-bold text-slate-200">{player.strength}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}