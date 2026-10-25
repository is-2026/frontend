import { useEffect, useState } from "react";
import { getLeagueMatches, getStandings } from "../../services/leagues";
import { getMyClub } from "../../services/club";
import { NextMatchCard } from "./NextMatchCard";
import { LeagueFixture } from "./LeagueFixture";
import { StandingsTable } from "./StandingsTable";

export function LeagueInProgress({ league }) {
    const isFinished = league.status === "finished";

    const [ matches, setMatches ] = useState([]);
    const [ standings, setStandings ] = useState([]);
    const [ myClubId, setMyClubId ] = useState(null);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);

    // carga de partidos, tabla y mi club
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const matchesData = await getLeagueMatches(league.id);
                const standingsData = await getStandings(league.id);
                const myClub = await getMyClub();

                setMatches(matchesData);
                setStandings(standingsData);
                setMyClubId(myClub.id);
            } catch (err) {
                setError(err.message || "Error al cargar los datos de la liga.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [league.id]);

    // el campeon es el primero de la tabla
    const champion = isFinished && standings.length > 0 ? standings[0] : null;

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 shadow-xl rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    {isFinished ? "Liga finalizada" : "Liga en curso"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    {league.name}
                </h1>
            </div>

            {loading && (
                <p className="text-slate-400 font-medium animate-pulse text-center">
                    Cargando datos de la liga...
                </p>
            )}

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/40 text-red-400 text-center text-sm font-semibold rounded-lg">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    {champion && (
                        <div className="bg-amber-500/10 border border-amber-500/40 p-6 shadow-xl rounded-xl text-center">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                                Campeón
                            </span>
                            <p className="text-2xl font-black text-white mt-1">{champion.club_name}</p>
                        </div>
                    )}

                    {!isFinished && (
                        <div className="bg-slate-900 border border-slate-800 p-6 shadow-xl rounded-xl flex flex-col gap-4">
                            <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3">
                                Próximo partido
                            </h2>
                            <NextMatchCard matches={matches} myClubId={myClubId} />
                        </div>
                    )}

                    <div className="bg-slate-900 border border-slate-800 p-6 shadow-xl rounded-xl flex flex-col gap-4">
                        <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3">
                            Calendario
                        </h2>
                        <LeagueFixture matches={matches} clubs={league.registered_clubs} />
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 shadow-xl rounded-xl flex flex-col gap-4">
                        <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3">
                            {isFinished ? "Tabla final" : "Tabla de posiciones"}
                        </h2>
                        <StandingsTable standings={standings} />
                    </div>
                </>
            )}
        </div>
    );
}