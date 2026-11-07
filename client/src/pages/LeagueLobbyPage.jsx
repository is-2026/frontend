import { useEffect, useState } from "react";
import { useParams , useNavigate } from "react-router-dom";
import { getLeagues, leaveLeague, startLeague } from "../services/leagues";
import { getMyClub } from "../services/club";
import { useLeagueLobbySocket } from "../hooks/useLeagueLobbySocket";
import { LeagueInProgress } from "../components/leagues/LeagueInProgress";

export function LeagueLobbyPage() {
    const { leagueId } = useParams();
    const navigate = useNavigate();
    
    const [ league, setLeague ] =  useState(null);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);
    const [ abandonError, setAbandonError ] = useState(null);
    const [ myClubId, setMyClubId ] = useState(null);

    // estados para iniciar liga.
    const [ isStartLeague, setIsStartLeague ] = useState(false);
    const [ startLeagueError, setStartLeagueError ] = useState(null);
    const [ isStartingLeague, setIsStartingLeague ] = useState(false);

    // carga inicial via HTTP GET 
    useEffect(() => {
        const fetchLeague = async () => {
            try {
                setLoading(true);
                const data = await getLeagues(leagueId);
                setLeague(data);
                 // pedimos mi club para saber si soy el creador
                const myClub = await getMyClub();
                setMyClubId(myClub.id);
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

    if (league?.status === "started" || league?.status === "finished") {
        return <LeagueInProgress league={league} />;
    }

    const registeredClubs = league?.registered_clubs || [];
    const registeredCount = registeredClubs.length;
    const maxClubs = league?.max_clubs || 0;
    const isCreator = Boolean(myClubId) && league?.creator_club_id === myClubId; // soy el creador si mi club es el que creó la liga
    const isStarted = Boolean(league?.is_started || league?.status === "started"); // estado de liga en curso
    const minClubs = registeredCount >= 3; // verifica el minimo de 3 clubes para iniciar

    const handleAbandonLeague = async () => {
        try {
            setAbandonError(null);
            await leaveLeague(leagueId);
            navigate("/leagues");
        } catch (err) {
            console.error("Error al abandonar la liga:", err);
            setAbandonError("Ocurrió un error al intentar abandonar la liga.");
        }
        return
    }

    const handleStartLeague = async () => {
        try {
            setStartLeagueError(null);
            setIsStartingLeague(true);
            await startLeague(leagueId);

            // actualizamos el estado local
            setLeague((prev) => (prev ? { ...prev, is_started: true, status: "started" } : prev));
            setIsStartLeague(false);
        } catch (err) {
            if ([400, 403, 409].includes(err.status)) {
                setStartLeagueError(err.message || "La liga no se pudo iniciar.");
            } else {
                setStartLeagueError("Ocurrio un error inesperado al iniciar la liga.");    
            }
        } finally {
            setIsStartingLeague(false);
        }
    };
    
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

                {/* acceso a mi alineación */}
                <button
                    onClick={() => navigate(`/leagues/${leagueId}/lineup`)}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 font-semibold text-sm self-start sm:self-center"
                >
                    Mi alineación
                </button>
            </div>

            {/* sección de control del creador para iniciar liga */}
            {isCreator && !isStarted && (
                <div className="bg-slate-900 border border-slate-800 p-6 shadow-xl rounded-xl flex flex-col items-center gap-3 text-center">
                    <button
                        onClick={() => setIsStartLeague(true)}
                        disabled={!minClubs}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-lg text-sm uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Iniciar liga
                    </button>

                    {!minClubs && (
                        <p className="text-xs font-semibold text-amber-400">
                            Se necesitan al menos 3 clubes inscriptos para poder iniciar la liga.
                        </p>
                    )}
                </div>
            )}

            {/* lista de clubes en tiempo real */}
            <div className="bg-slate-900 border border-slate-800 p-6 shadow-xl rounded-xl flex flex-col gap-4">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-200">
                        Clubes Inscriptos
                    </h2>
                    {abandonError && ( <p className="text-red-400 text-xs font-semibold">{abandonError}</p>)}
                    { !isStarted && ( 
                        <button
                            onClick={handleAbandonLeague}
                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 font-bold text-sm tracking-wider uppercase transition-colors text-center"
                        >
                            Abandonar Liga
                        </button>
                    )}
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

                {/* modal de confirmación de inicio de liga */}
            {isStartLeague && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl max-w-md w-full flex flex-col gap-4 shadow-2xl">
                        <h3 className="text-xl font-bold text-white">
                            Confirmar inicio de liga
                        </h3>
                        <p className="text-slate-300 text-sm">
                            ¿Estás seguro de que deseas iniciar la liga? Una vez iniciada no podrán unirse más clubes.
                        </p>

                        {startLeagueError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-semibold rounded-lg">
                                {startLeagueError}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsStartLeague(false);
                                    setStartLeagueError(null);
                                }}
                                disabled={isStartingLeague}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 font-semibold text-sm rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleStartLeague}
                                disabled={isStartingLeague}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 font-bold text-sm rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isStartingLeague ? "Iniciando..." : "Confirmar e Iniciar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div> 
    );
}