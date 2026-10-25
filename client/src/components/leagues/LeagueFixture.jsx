import { Link } from "react-router-dom";

// texto que mostramos para cada estado del partido
const statusText = {
    scheduled: "Programado",
    in_progress: "En juego",
    paused: "Pausado",
    finished: "Finalizado",
};

export function LeagueFixture({ matches, clubs }) {
    if (matches.length === 0) {
        return (
            <p className="text-slate-500 text-sm text-center py-8">
                Todavía no hay partidos programados.
            </p>
        );
    }

    // armamos la lista de fechas sin repetir (los partidos ya vienen ordenados por fecha)
    const rounds = [];
    matches.forEach((match) => {
        if (!rounds.includes(match.round)) {
            rounds.push(match.round);
        }
    });

    return (
        <div className="flex flex-col gap-5">
            {rounds.map((round) => {
                // partidos de esta fecha
                const roundMatches = matches.filter((match) => match.round === round);

                // clubes que no juegan esta fecha
                const freeClubs = clubs.filter((club) => {
                    const plays = roundMatches.find(
                        (match) => match.home_club_id === club.club_id || match.away_club_id === club.club_id
                    );
                    return !plays;
                });

                return (
                    <div key={round} className="flex flex-col gap-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">
                            Fecha {round}
                        </h3>

                        {roundMatches.map((match) => (
                            <div
                                key={match.id}
                                className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between gap-3 text-sm text-slate-200"
                            >
                                <span className="font-semibold">{match.home_club_name}</span>
                                <span className="font-black text-white">
                                    {match.status === "scheduled" ? "vs" : `${match.home_score} - ${match.away_score}`}
                                </span>
                                <span className="font-semibold">{match.away_club_name}</span>
                                <span className="text-xs text-slate-400">{statusText[match.status]}</span>

                                {match.status === "in_progress" && (
                                    <Link
                                        to={`/match/${match.id}`}
                                        className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase"
                                    >
                                        Ver en vivo
                                    </Link>
                                )}
                            </div>
                        ))}

                        {freeClubs.length > 0 && (
                            <p className="text-xs text-slate-400">
                                Libre: {freeClubs.map((club) => club.club_name).join(", ")}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}