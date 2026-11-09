export function NextMatchCard({ matches, myClubId }) {
    // el primer partido programado de la liga nos dice cual es la proxima fecha
    const nextLeagueMatch = matches.find((match) => match.status === "scheduled");

    // el primer partido programado de mi club
    const myNextMatch = matches.find(
        (match) => match.status === "scheduled" && (match.home_club_id === myClubId || match.away_club_id === myClubId)
    );

    if (!nextLeagueMatch) {
        return <p className="text-slate-400 text-sm">No quedan partidos por jugar.</p>;
    }

    // si mi club no juega en la proxima fecha, queda libre
    if (!myNextMatch || myNextMatch.round_number !== nextLeagueMatch.round_number) {
        return <p className="text-amber-400 text-sm font-semibold">Fecha libre</p>;
    }

    return (
        <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-xs font-bold uppercase text-slate-400">Fecha {myNextMatch.round_number}</span>
            <p className="text-lg font-black text-white">
                {myNextMatch.home_club_name} vs {myNextMatch.away_club_name}
            </p>
            <p className="text-sm text-slate-400">Cuando termine la fecha</p>
        </div>
    );
}