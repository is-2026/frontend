import { Link } from "react-router-dom";

export default function AmistosoCard({ amistoso }) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-800 p-4">
      <div>
        <p className="font-semibold">{amistoso.nombre}</p>
        <p className="text-sm text-white/60">
          {amistoso.privado ? "🔒 Privado" : "🌐 Público"}
        </p>
      </div>
      <Link
        to={`/amistosos/${amistoso.id}/unirse`}
        className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium hover:bg-emerald-500"
      >
        Unirse
      </Link>
    </li>
  );
}