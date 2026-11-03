import { useNavigate } from "react-router-dom";

const STATUS_LABELS = {
    not_sarted: "No iniciada",
    started: "En curso",
    finished: "Finalizada",
};

export default function MyLeagueCard({ league }) {
    const navigate = useNavigate();
    const currentClubsCount = league.registered_clubs ? league.registered_clubs.length : 0;
    
    return (
        <li className="flex items-center justify-between border border-white/10 bg-slate-800 p-4">
            <div>
                <p className="font-semibold text-white">{league.name}</p>
                <p className="text-sm text-white/60">
                    {STATUS_LABELS[league.status] ?? league.status}
                </p>
            </div>

            <div className="flex items-center gap-6">
                <span className="text-sm text-white/80">
                    {currentClubsCount}/{league.max_clubs} clubes
                </span>
                <button
                    onClick={() => navigate(`/leagues/${league.id}/lobby`)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 text-sm transition-colors"
                >
                    Entrar
                </button>
            </div>
        </li>
    );
}