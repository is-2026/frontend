export default function LeagueCard({ league }) {
  // Cantidad actual de ligas en array
  const currentClubsCount = league.registered_clubs ? league.registered_clubs.length : 0;
  return (
    <li className="flex items-center justify-between border border-white/10 bg-slate-800 p-4">
      <div>
        <p className="font-semibold">{league.name}</p>
        <p className="text-sm text-white/60">
          {league.is_private ? "Privada" : "Pública"} 
        </p>
      </div>
      <div className="text-right">
        <span className="text-sm text-white/80">
          {currentClubsCount}/{league.max_clubs} clubes
        </span>
      </div>
    </li>
  );
}