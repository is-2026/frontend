import { useEffect, useState } from "react";
import { getRanking } from "../services/ranking";
import { getMyClub } from "../services/club";
import RankingCard from "../components/RankingCard";

export function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [myClubId, setMyClubId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRanking()
      .then(setRanking)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    getMyClub().then((c) => setMyClubId(c.id)).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Ranking</h1>
      <p className="mb-4 text-sm text-white/60">Solo contempla ligas públicas.</p>

      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && !error && ranking.length === 0 && (
        <p className="text-white/60">No hay clubes en el ranking.</p>
      )}

      <ul className="space-y-3">
        {ranking.map((c) => (
          <RankingCard key={c.club_id} club={c} isMine={c.club_id === myClubId} />
        ))}
      </ul>
    </div>
  );
}