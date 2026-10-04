import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFriendlies } from "../services/friendlies";
import { FriendlyCard } from "../components/FriendlyCard";

export function FriendliesPage() {
  const [friendlies, setFriendlies] = useState([]); // Acá se guarda la lista de amistosos disponibles
  const [loading, setLoading] = useState(true);     // Inicia en true para mostrar msj cargando
  const [error, setError] = useState(null);         // Acá se guarda el mensaje de error

  useEffect(() => {
    getFriendlies()
      .then((data) => setFriendlies(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl p-6 text-white">
      {/* Encabezado con Botón de Crear */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-white">
            Amistosos Disponibles
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Organiza o únete a partidos de prueba.
          </p>
        </div>

        <Link
          to="/friendlies/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 font-bold text-sm tracking-wider uppercase transition-colors text-center"
        >
          + Crear Amistoso
        </Link>
      </div>

      {/* Estados de carga y error */}
      {loading && (
        <p className="text-slate-400 text-sm uppercase tracking-wider">
          Cargando amistosos...
        </p>
      )}

      {error && (
        <div className="bg-red-950 border border-red-800 text-red-200 p-4 mb-4 text-sm font-semibold uppercase">
          {error}
        </div>
      )}

      {!loading && !error && friendlies.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 p-8 text-center text-slate-400">
          No hay amistosos disponibles por ahora.
        </div>
      )}

      {/* Lista de tarjetas */}
      {!loading && !error && friendlies.length > 0 && (
        <ul className="space-y-3">
          {friendlies.map((a) => (
            <FriendlyCard key={a.id} friendly={a} />
          ))}
        </ul>
      )}
    </div>
  );
}