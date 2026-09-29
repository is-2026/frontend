import { useEffect, useState } from "react";
import { getFriendlies } from "../services/friendlies";
import FriendlyCard from "../components/FriendlyCard";

export default function FriendliesPage() {
  const [friendlies, setFriendlies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getFriendlies()
      .then(setFriendlies)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Amistosos disponibles</h1>

      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && !error && friendlies.length === 0 && (
        <p className="text-white/60">No hay amistosos disponibles por ahora.</p>
      )}

      <ul className="space-y-3">
        {friendlies.map((a) => (
          <FriendlyCard key={a.id} friendly={a} />
        ))}
      </ul>
    </div>
  );
}
