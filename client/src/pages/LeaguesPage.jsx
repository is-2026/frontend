import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLeagues, getMyLeagues } from "../services/leagues";
import LeagueCard from "../components/LeagueCard";
import MyLeagueCard from "../components/MyLeagueCard";

export function LeaguesPage() {
  const [tab, setTab] = useState("available");
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchLeagues = tab === "available" ? getLeagues : getMyLeagues;

    fetchLeagues()
      .then((data) => setLeagues(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="mx-auto max-w-4xl p-6 text-white">
      {/* Encabezado con Botón de Crear */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-white">
            Ligas Disponibles
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Organiza o únete a partidos de prueba.
          </p>
        </div>

        <Link
          to="/leagues/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 font-bold text-sm tracking-wider uppercase transition-colors text-center"
        >
          + Crear Liga
        </Link>
      </div>

      {/* Pestañas */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("available")}
          className={`px-4 py-2 text-sm font-bold uppercase ${tab === "available" ? "bg-blue-600" : "bg-slate-800"}`}
          >
            Disponibles
        </button>
            <button
              onClick={() => setTab("mine")}
              className={`px-4 py-2 text-sm font-bold uppercase ${tab === "mine" ? "bg-blue-600" : "bg-slate-800"}`}
            >
          Mis ligas
        </button>
      </div>

      {/* Estados de carga y error */}
        {loading && (
          <p className="text-slate-400 text-sm uppercase tracking-wider">
              Cargando ligas...
              </p>
        )}

        {error && (
           <div className="bg-red-950 border border-red-800 text-red-200 p-4 mb-4 text-sm font-semibold uppercase">
              {error}
            </div>
        )}

        {!loading && !error && leagues.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 p-8 text-center text-slate-400">
            {tab === "available"
                ? "No hay ligas disponibles por ahora."
                : "No participás en ninguna liga."}
          </div>
        )}

        {/* Lista de tarjetas */}
          {!loading && !error && leagues.length > 0 && (
            <ul className="space-y-3">
                {leagues.map((l) =>
                  tab === "available" ? (
                    <LeagueCard key={l.id} league={l} />
                    ) : (
                    <MyLeagueCard key={l.id} league={l} />
                  )
                )}
            </ul>
          )}
    </div>
  );
}
