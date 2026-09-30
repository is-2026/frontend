import { Link } from "react-router-dom";

export default function FriendlyCard({ friendly }) {
  return (
    <li className="flex items-center justify-between border border-white/10 bg-slate-800 p-4">
      <div>
        <p className="font-semibold">{friendly.creator_club_id}</p>
        <p className="text-sm text-white/60">
          {friendly.is_private ? "Privado" : "Público"} 
        </p>
      </div>
      <Link
        to={`/friendlies/${friendly.id}/join`}
        className="bg-emerald-600 px-3 py-1.5 text-sm font-medium hover:bg-emerald-500"
      >
        Unirse
      </Link>
    </li>
  );
}