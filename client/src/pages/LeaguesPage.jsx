import { useEffect, useState } from "react";
import { getLeagues } from "../services/leagues";
import LeagueCard from "../components/LeagueCard";

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLeagues()
      .then(setLeagues)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Ligas disponibles</h1>

      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && !error && leagues.length === 0 && (
        <p className="text-white/60">No hay ligas disponibles por ahora.</p>
      )}

      <ul className="space-y-3">
        {leagues.map((l) => (
          <LeagueCard key={l.id} league={l} />
        ))}
      </ul>
    </div>
  );
}
