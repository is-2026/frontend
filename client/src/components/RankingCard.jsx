import { Link } from "react-router-dom";
import { DEFAULT_AVATAR } from "../services/club";

export default function RankingCard({ club, isMine }) {
  // Auxiliar para calcular la diferencia de goles
  const goalDiff = club.goals_for - club.goals_against;
  return (
    <li className={`flex items-center gap-4 border p-4 ${isMine ? "border-blue-500 bg-blue-950" : "border-white/10 bg-slate-800"}`}>
      <span className="font-bold">{club.position}</span>
      <img src={club.avatar_url || DEFAULT_AVATAR} alt={club.club_name} className="h-12 w-12" />
      <Link to={`/clubs/${club.club_id}`} className="font-semibold">{club.club_name}</Link>
      <div className="ml-auto text-sm text-white/80">
        {club.points} pts · PJ {club.matches_played} · PG {club.won} · PG pen. {club.won_penalties} · PE {club.drawn} · PP {club.lost} · DG {goalDiff}
      </div>
    </li>
  );
}