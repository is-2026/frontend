import { useEffect, useState } from "react";

export function NextMatchCard({ matches, myClubId }) {
    // segundos que faltan para el partido
    const [ secondsLeft, setSecondsLeft ] = useState(null);

    // el primer partido programado de la liga nos dice cual es la proxima fecha
    const nextLeagueMatch = matches.find((match) => match.status === "scheduled");

    // el primer partido programado de mi club
    const myNextMatch = matches.find(
        (match) => match.status === "scheduled" && (match.home_club_id === myClubId || match.away_club_id === myClubId)
    );

    const startsAt = myNextMatch?.starts_at;

    // cuenta regresiva: cada segundo calculamos cuanto falta
    useEffect(() => {
        if (!startsAt) return;

        const interval = setInterval(() => {
            const diff = new Date(startsAt) - new Date();
            setSecondsLeft(diff > 0 ? Math.floor(diff / 1000) : 0);
        }, 1000);

        return () => clearInterval(interval);
    }, [startsAt]);

    if (!nextLeagueMatch) {
        return <p className="text-slate-400 text-sm">No quedan partidos por jugar.</p>;
    }

    // si mi club no juega en la proxima fecha, queda libre
    if (!myNextMatch || myNextMatch.round !== nextLeagueMatch.round) {
        return <p className="text-amber-400 text-sm font-semibold">Fecha libre</p>;
    }

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return (
        <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-xs font-bold uppercase text-slate-400">Fecha {myNextMatch.round}</span>
            <p className="text-lg font-black text-white">
                {myNextMatch.home_club_name} vs {myNextMatch.away_club_name}
            </p>

            {!startsAt && (
                <p className="text-sm text-slate-400">Cuando termine la fecha</p>
            )}

            {startsAt && secondsLeft !== null && (
                <p className="text-2xl font-black text-blue-400">
                    {minutes} min {seconds} seg
                </p>
            )}
        </div>
    );
}