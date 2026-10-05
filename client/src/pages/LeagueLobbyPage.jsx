import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getLeague } from "../services/leagues";
import { useLeagueLobbySocket } from "../hooks/useLeagueLobbySocket";

export function LeagueLobbyPage() {
    const { leagueId } = useParams();
    
    const [ league, setLeague ] =  useState(null);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);

    // carga inicial via HTTP GET 
    useEffect(() => {
        const fetchLeague = async () => {
            try {
                setLoading(true);
                const data = await getLeague(leagueId);
                setLeague(data);
            } catch (err) {
                setError(err.message || "Error al cargar la liga.");
            } finally {
                setLoading(false);
            }
        };

        fetchLeague(); 
    }, [leagueId]);

    useLeagueLobbySocket(leagueId, setLeague, setError);

    // estado de carga
    if (loading) {
        return (
        <div className="flex items-center justify-center min-h-[300px]">
            <p className="text-slate-400 font-medium animate-pulse">
            Cargando lobby de la liga...
            </p>
        </div>
        );
    }

    // estado de error
    if (error) {
        return (
        <div className="max-w-xl mx-auto my-8 p-4 bg-red-500/10 border border-red-500/40 text-red-400 text-center text-sm font-semibold rounded-lg shadow-md">
            {error}
        </div>
        );
    }

    const registeredClubs = league?.registered_clubs || [];
    const registeredCount = registeredClubs.length;
    const maxClubs = league?.max_clubs || 0;
    
    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 p-4">
            {/* información principal de la Liga */}
            <div className="bg-slate-900 border border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xl rounded-xl">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                        Lobby de Espera
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                        {league?.name}
                    </h1>
                </div>

                {/* contador de Inscriptos */}
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg self-start sm:self-center shadow-inner">
                    <span className="text-slate-400 text-xs font-bold uppercase">
                        Clubes:
                    </span>
                    <span className="text-lg font-black text-blue-400">
                        {registeredCount} / {maxClubs}
                    </span>
                </div>
            </div>

            {/* lista de clubes en tiempo real */}
            <div className="bg-slate-900 border border-slate-800 p-6 shadow-xl rounded-xl flex flex-col gap-4">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-200">
                        Clubes Inscriptos
                    </h2>
                </div>

                {registeredClubs.length > 0 ? (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {registeredClubs.map((club) => (
                            <li
                                key={club.club_id}
                                className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg flex items-center gap-3 text-slate-200 text-sm font-semibold transition-all hover:border-slate-700"
                            >
                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0" />
                                <span className="truncate">{club.club_name}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 text-sm text-center py-8">
                        Aún no hay clubes inscriptos en esta liga.
                    </p>
                )}
            </div>
        </div>
    );
}