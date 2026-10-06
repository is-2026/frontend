import { useNavigate, useParams } from "react-router-dom";
import { MatchHeader } from "../components/match/MatchHeader";
import { Field } from "../components/match/Field";
import { useMatchSocket } from "../hooks/useMatchSocket";
import { GoalBanner } from "../components/match/GoalBanner";
import { MatchFinishedBanner } from "../components/match/MatchFinishedBanner";
import { LineupPanel } from "../components/match/LineupPanel";
import { getPlayers } from "../services/club";
import { useEffect, useState } from "react";

export function MatchPage() {
    const { matchId } = useParams();
    const { 
        teams, lineups, scores, 
        state, goalInfo, finished 
    } = useMatchSocket(matchId);
    
    const navigate = useNavigate();

    // ids de los jugadores de mi club, para saber cuál de las dos alineaciones es la mía
    const [myPlayerIds, setMyPlayerIds] = useState(new Set());
    useEffect(() => {
        getPlayers()
            .then((players) => setMyPlayerIds(new Set((players ?? []).map((p) => p.id))))
            .catch(() => setMyPlayerIds(new Set())); // si falla, se muestra el local
    }, []);

    const mySide = lineups?.away?.some((p) => myPlayerIds.has(p.player_id)) ? "away" : "home";
    const myLineup = lineups?.[mySide] ?? [];
    const starters = myLineup.filter((p) => p.is_starter);
    const substitutes = myLineup.filter((p) => !p.is_starter);

    return (
        // fixed para sobreescribir configuracion default de app
        <div className="fixed inset-0 bg-slate-950 p-8 text-white overflow-auto z-50">
            
            {/* Contenedor de cancha.*/}
            <div className="w-[1272px] mx-auto pb-8">

                <div className="flex gap-4">
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

                        {/* banner de fin de partido */}
                        <MatchFinishedBanner
                            finished={finished}
                            teams={teams}
                            onExit={() => navigate("/friendlies")}
                        />

                    </div>

                    <div className="flex flex-col gap-4 w-64 shrink-0">
                        { /*titulares*/ }
                        <LineupPanel title="Equipo" players={starters} showBehavior />

                        { /*suplentes*/ }
                        <LineupPanel title="Suplentes" players={substitutes} />
                        { /*cambios*/ }
                        <button className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 border border-slate-600 transition-colors uppercase text-sm mt-auto">
                            Realizar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}