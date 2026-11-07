import { useNavigate } from "react-router-dom";

export default function LeagueCard({ league }) {
    const navigate = useNavigate();
    const currentClubsCount = league.registered_clubs ? league.registered_clubs.length : 0;
    const isFull = currentClubsCount >= league.max_clubs;

    return (
        <li className="flex items-center justify-between border border-white/10 bg-slate-800 p-4">
            <div>
                <p className="font-semibold text-white">{league.name}</p>
                <p className="text-sm text-white/60">
                    {league.is_private ? "Privada" : "Pública"}
                </p>
                {league.allows_draws === false && (
                    <p className="text-sm text-white/60">Sin empates</p>
                )}
            </div>

            <div className="flex items-center gap-6">
                <span className="text-sm text-white/80">
                    {currentClubsCount}/{league.max_clubs} clubes
                </span>
                <button
                    onClick={() => navigate(`/leagues/${league.id}/join`)}
                    disabled={isFull}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold px-4 py-2 text-sm transition-colors"
                >
                    {isFull ? "Lleno" : "Unirse"}
                </button>
            </div>
        </li>
    );
}