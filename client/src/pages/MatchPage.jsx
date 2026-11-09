import { useNavigate, useParams } from "react-router-dom";
import { MatchHeader } from "../components/match/MatchHeader";
import { Field } from "../components/match/Field";
import { useMatchSocket } from "../hooks/useMatchSocket";
import { GoalBanner } from "../components/match/GoalBanner";
import { MatchFinishedBanner } from "../components/match/MatchFinishedBanner";
import { LineupPanel } from "../components/match/LineupPanel";
import { getPlayers } from "../services/club";
import { useEffect, useState } from "react";
import { getBehaviors } from "../services/behaviors";
import { PauseBanner } from "../components/match/PauseBanner";
import { SubstitutionPanel } from "../components/match/SubstitutionPanel";
import { StartersPanel } from "../components/match/StartersPanel";
import { PenaltyOrderPanel } from "../components/match/PenaltyOrderPanel" 
import { PenaltyShootoutInfo } from "../components/match/PenaltyShootoutInfo" 

export function MatchPage() {
    const { matchId } = useParams();
    const { 
        teams, lineups, scores, 
        state, goalInfo, finished,
        pause, pausesEnded, closeCode,
        penaltyStart, penaltyResult, penaltyKick
    } = useMatchSocket(matchId);

    //Variables para cambio de behaviors
    const [behaviors, setBehaviors] = useState([]);
    const navigate = useNavigate();
    const [scheduled, setScheduled] = useState(null);
    const [finishedSub, setFinishedSub] = useState(false);
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
    const rivalSide = mySide === "home" ? "away" : "home";
    const rivalLineup = lineups?.[rivalSide] ?? [];
    const rivalStarters = rivalLineup.filter((p) => p.is_starter);
    const rivalSubstitutes = rivalLineup.filter((p) => !p.is_starter);

    // el local va a la izquierda, el visitante a la derecha (igual que el marcador)
    const myOrder = mySide === "home" ? "order-1" : "order-3";
    const rivalOrder = mySide === "home" ? "order-3" : "order-1";

    //Verifica si el partido pertenece a quien cambiará el comportamiento
    const isOwnMatch = (
        (lineups != null) &&
        [...lineups.home, ...lineups.away].some((p) =>
            myPlayerIds.has(p.player_id))
    );

    const canChange = isOwnMatch && !finished;
    const inShootout = penaltyStart != null || penaltyKick != null;
    const inPenaltyWindow = canChange && penaltyStart != null && penaltyKick == null;
    //inShootout se usa durante el juego de los penales
    //inPenaltyWindow se usa para mostrar el panel de elección de pateadores

    //Se limpia scheduled luego de la pausa. Lo necesita al inicio para mostrar el cambio, por eso no se borra al inicio.
    useEffect(() => {
    if (!pause) setScheduled(null);
    }, [pause]);

    // Escuchar cuando 'pausesEnded' incrementa
    useEffect(() => {
        // Si la pausa terminó y tenías un cambio planificado
        if (pausesEnded > 0 && scheduled) {
            setFinishedSub(true);

            const timer = setTimeout(() => {
                setFinishedSub(false);
            }, 3000); // Se oculta a los 3 segundos

            return () => clearTimeout(timer);
        }
    }, [pausesEnded]);

    return (
        // fixed para sobreescribir configuracion default de app
        <div className="fixed inset-0 bg-slate-950 p-8 text-white overflow-auto z-50">

            {/* Contenedor de cancha.*/}
            <div className="w-[1272px] mx-auto pb-8">

                <div className="flex gap-4 items-start">
                    <div className="min-w-0 flex-1 relative order-2">

                        {/* Mensaje de error por desconexión */}
                        {closeCode && (
                            <div className="bg-red-600 text-white text-center py-2">
                                Conexión perdida con el servidor (Código: {closeCode}). Reintentando...
                            </div>
                        )}

                        {/*cronómetro y evento partido finalizado o header de penal*/}
                        {penaltyKick ? (
                            <PenaltyShootoutInfo
                                penaltyKick={penaltyKick}
                                penaltyResult={penaltyResult}
                                state={state}
                                lineups={lineups}
                                teams={teams}
                                penaltyTicks={penaltyKick.penaltyTicks}    
                            />
                        ) : (
                            <MatchHeader
                            teams={teams}
                            scores={scores}
                            tick={finished?.tick ?? state?.tick}
                            />
                        )}

                        {/*cancha */}
                        <Field state={state} lineups={lineups} />

                        {/*evento de gol */}
                        <GoalBanner goalInfo={goalInfo} />

                        {/* banner de pausa */}
                        { pause && <PauseBanner pause={pause} substitutionDone={Boolean(scheduled)}/> }

                        {/* Panel de penales */}
                        {(inPenaltyWindow && (                            
                            <PenaltyOrderPanel
                                matchId={matchId}
                                players={myLineup}
                                behaviors={behaviors}
                                endsAt={penaltyStart.endsAt}
                            />
                        )
                        )}

                        {/* banner de fin de partido */}
                        <MatchFinishedBanner
                            finished={finished}
                            teams={teams}
                            onExit={() => navigate("/friendlies")}
                        />
                        {/* Cartel de aviso cuando se completa la pausa */}
                        {finishedSub && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30 pointer-events-none">
                                <p className="text-3xl font-black text-white uppercase tracking-wider">
                                    Cambio realizado
                                </p>
                        </div>

                        )}
                        
                    </div>

                    {/* Mi equipo */}
                    <div className={`flex flex-col gap-4 w-64 shrink-0 ${myOrder}`}>
                        { /*titulares*/}
                        {inShootout ? (
                            <LineupPanel 
                            title="Convocados" 
                            players={myLineup}
                            kickerId={penaltyKick?.kickerId}
                            defenderId={penaltyKick?.defenderId}  />
                        ) : ( 
                            <>
                                {canChange ? (
                                    <StartersPanel matchId={matchId} players={starters} behaviors={behaviors} />
                                ) : (
                                    <LineupPanel title="Titulares" players={starters} />
                                )}
                                <LineupPanel title="Suplentes" players={substitutes} />
                            </>
                        )}
                        
                        
                        
                        { /*Planificar cambios durante el partido*/}
                        {(canChange && !inShootout) &&  (
                            <>
                                {showForm && (
                                    <SubstitutionPanel
                                        matchId={matchId}
                                        starters={starters}
                                        substitutes={substitutes}
                                        behaviors={behaviors}
                                        pausesEnded={pausesEnded}
                                        scheduled={scheduled}
                                        setScheduled={setScheduled}
                                    />
                                )}
                                
                                <button 
                                    onClick={() => setShowForm(!showForm)}
                                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 border border-slate-600 transition-colors uppercase text-sm mt-auto">
                                    {showForm ? "Ocultar" : "Realizar cambios"}
                                </button>
                            </>
                        )}

                    </div>
                    {/* Rival: solo lectura */}
                    <div className={`flex flex-col gap-4 w-64 shrink-0 ${rivalOrder}`}>
                        {(inShootout ? (
                            <LineupPanel 
                            title="Convocados" 
                            players={rivalLineup}
                            kickerId={penaltyKick?.kickerId}
                            defenderId={penaltyKick?.defenderId}  />
                        ) : (
                            <>
                                <LineupPanel title="Titulares" players={rivalStarters} />
                                <LineupPanel title="Suplentes" players={rivalSubstitutes} />
                            </>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}