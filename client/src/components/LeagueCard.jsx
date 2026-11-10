import { useNavigate } from "react-router-dom";
import { ClubLink } from "../components/ClubLink";
export function LeagueCard({ league }) {
    const navigate = useNavigate();
    const currentClubsCount = league.registered_clubs ? league.registered_clubs.length : 0;
    const isFull = currentClubsCount >= league.max_clubs;

    const creatorClub = league.registered_clubs?.find(
        (c) => c.club_id === league.creator_club_id
    );
    const creatorName = creatorClub?.club_name || league.creator_club_name;

    return (
        <li className="flex items-center justify-between border border-white/10 bg-slate-800 p-4">
            <div>
                <p className="font-semibold text-white text-[24px]">{league.name}</p>

                {/* Club creador con enlace al perfil */}
                <div className="flex items-center gap-1.5 text-white/60">
                    <span>Creada por:</span>
                    <ClubLink id={league.creator_club_id} name={creatorName} />
                </div>
                
                <p className=" text-white/60">
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