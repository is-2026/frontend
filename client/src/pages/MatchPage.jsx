import { useNavigate, useParams } from "react-router-dom";
import { MatchHeader } from "../components/match/MatchHeader";
import { Field } from "../components/match/Field";
import { useMatchSocket } from "../hooks/useMatchSocket";
import { GoalBanner } from "../components/match/GoalBanner";
import { MatchFinishedBanner } from "../components/match/MatchFinishedBanner";
import { LineupPanel } from "../components/match/LineupPanel";
import { getPlayers } from "../services/club";
import { useEffect, useState } from "react";
import { changeLiveBehavior } from "../services/matches";
import { getBehaviors } from "../services/behaviors";
import { PauseBanner } from "../components/match/PauseBanner";
import { SubstitutionPanel } from "../components/match/SubstitutionPanel";


export function MatchPage() {
    const { matchId } = useParams();
    const { 
        teams, lineups, scores, 
        state, goalInfo, finished,
        pause, pausesEnded
    } = useMatchSocket(matchId);

    //Variables para cambio de behaviors
    const [behaviors, setBehaviors] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    //Variable para mostrar formulario de sustitución
    const [showForm, setShowForm] = useState(false);
    
    // ids de los jugadores de mi club, para saber cuál de las dos alineaciones es la mía
    const [myPlayerIds, setMyPlayerIds] = useState(new Set());
    useEffect(() => {
        getPlayers()
            .then((players) => setMyPlayerIds(new Set((players ?? []).map((p) => p.id))))
            .catch(() => setMyPlayerIds(new Set())); // si falla, se muestra el local
        getBehaviors()
            .then((b) => setBehaviors(b || []))
            .catch(() => setBehaviors([]));
    }, []);

    //Cierra formulario de cambio en pausas luego de que acaba la pausa.
    useEffect(() => {
        if (!pause) {
            setShowForm(false);
        }
    }, [pause]);

    const mySide = lineups?.away?.some((p) => myPlayerIds.has(p.player_id)) ? "away" : "home";
    const myLineup = lineups?.[mySide] ?? [];
    const starters = myLineup.filter((p) => p.is_starter);
    const substitutes = myLineup.filter((p) => !p.is_starter);

    //Verifica si el partido pertenece a quien cambiará el comportamiento
    const isOwnMatch = (
        (lineups != null) &&
        [...lineups.home, ...lineups.away].some((p) =>
            myPlayerIds.has(p.player_id))
    );

    const canChange = isOwnMatch && !finished;

    async function handleBehaviorChange(player_id, behavior_id) {
        setError(null);
        try {
            await changeLiveBehavior(matchId, player_id, behavior_id); //Espera la respuesta del service matches
        } catch (e) {
            setError(e.message);
        }
    }

    return (
        // fixed para sobreescribir configuracion default de app
        <div className="fixed inset-0 bg-slate-950 p-8 text-white overflow-auto z-50">

            {/* Contenedor de cancha.*/}
            <div className="w-[1272px] mx-auto pb-8">

                <div className="flex gap-4 items-start">
                    <div className="min-w-0 flex-1 relative">

                        {/*cronómetro y evento partido finalizado */}
                        <MatchHeader
                            teams={teams}
                            scores={scores}
                            tick={finished?.tick ?? state?.tick}
                        />

                        {/*cancha */}
                        <Field state={state} lineups={lineups} />

                        {/*evento de gol */}
                        <GoalBanner goalInfo={goalInfo} />

                        {/* banner de pausa */}
                        <PauseBanner pause={pause}/>


                        {/* banner de fin de partido */}
                        <MatchFinishedBanner
                            finished={finished}
                            teams={teams}
                            onExit={() => navigate("/friendlies")}
                        />
                        
                    </div>

                    <div className="flex flex-col gap-4 w-64 shrink-0">
                        { /*titulares*/}
                        <LineupPanel
                            title="Equipo"
                            players={starters}
                            showBehavior={isOwnMatch}
                            canChange={canChange}
                            behaviors={behaviors}
                            onChangeBehavior={handleBehaviorChange}
                        />

                        { /*error al cambiar comportamiento en partido*/}
                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        { /*suplentes*/}
                        <LineupPanel title="Suplentes" players={substitutes} />
                        
                        { /*Planificar cambios durante el partido*/}
                        {canChange && !pause && (
                            <>
                                <div hidden={!showForm}>
                                {/* Panel de sustituciones */}
                                <SubstitutionPanel
                                    matchId={matchId}
                                    starters={starters}
                                    substitutes={substitutes}
                                    behaviors={behaviors}
                                    pause={pause}
                                    pausesEnded={pausesEnded}
                                />
                                </div>
                                <button 
                                    onClick={() => setShowForm(!showForm)}
                                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 border border-slate-600 transition-colors uppercase text-sm mt-auto">
                                    Realizar cambios
                                </button>
                            </>
                        )}

                        {/* Cambios durante pausas */}
                        {pause && canChange && (
                            <div className="bg-slate-900 border border-slate-700 p-4 mt-2 rounded shadow-lg">
                                <button 
                                    onClick={() => setShowForm(!showForm)}
                                    className="bg-emerald-600 hover:bg-emerald-400 text-white font-bold py-2 px-4 ring-2 ring-gray-300 animate-bounce transition-colors uppercase text-[19px]">
                                    {showForm ? "Ocultar" : "Realizar cambios"}
                                </button>

                                {showForm && (
                                    <div className="mt-4">
                                        <SubstitutionPanel
                                            matchId={matchId}
                                            starters={starters}
                                            substitutes={substitutes}
                                            behaviors={behaviors}
                                            pause={pause}
                                            pausesEnded={pausesEnded}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}