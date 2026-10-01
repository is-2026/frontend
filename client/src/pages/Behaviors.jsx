import { useEffect, useState } from "react";
import { getBehaviors } from "../services/behaviors";
import BehaviorCard from "../components/BehaviorsCard";

export default function BehavioursPage() {
  const [behaviors, setBehaviors] = useState([]); // Acá se guarda la lista de comportamientos disponibles
  const [loading, setLoading] = useState(true);     // Inicia en true para mostrar msj cargando
  const [error, setError] = useState(null);         // Acá se guarda el mensaje de error

  useEffect(() => {
    getBehaviors()
      .then(setBehaviors) // Guarda los comportamientos disponibles
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl p-6">
        <h1 className="mb-6 text-3xl font-bold text-white">Comportamientos </h1>

        {loading && <p className="text-slate-400">Cargando...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && !error && behaviors.length === 0 && (
            <p className="text-white/60">No se encontraron comportamientos.</p>
        )}
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {behaviors.map((b) => (
            <BehaviorCard key={b.id} behavior={b} />
        ))}
        </ul>
    </div>
  );
}
