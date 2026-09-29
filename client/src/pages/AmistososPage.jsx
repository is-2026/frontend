import { useEffect, useState } from "react";
import { getAmistosos } from "../services/amistosos";
import AmistosoCard from "../components/AmistosoCard";

export default function AmistososPage() {
  const [amistosos, setAmistosos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAmistosos()
      .then(setAmistosos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Amistosos disponibles</h1>

      {cargando && <p>Cargando...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!cargando && !error && amistosos.length === 0 && (
        <p className="text-white/60">No hay amistosos disponibles por ahora.</p>
      )}

      <ul className="space-y-3">
        {amistosos.map((a) => (
          <AmistosoCard key={a.id} amistoso={a} />
        ))}
      </ul>
    </div>
  );
}
