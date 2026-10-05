import { useParams } from "react-router-dom";
import { MatchHeader } from "../components/match/MatchHeader";
import { Field } from "../components/match/Field";
import { useMatchSocket } from "../hooks/useMatchSocket";
import { GoalBanner } from "../components/match/GoalBanner";

/*

// Mock para probar la vista:
*/
const mockScores = { home: 2, away: 1 };
  
  const mockLineups = {
  home: [
    { player_id: "p1" },
    { player_id: "p2" },
    { player_id: "p3" },
  ],
  away: [
    { player_id: "p4" },
    { player_id: "p5" },
    { player_id: "p6" },
  ],
};


const mockState = {
    tick: 150,
    ballPosition: { x: 20, y: 10 }, 
    players: [
    // Equipo Local (lado izquierdo)
    { playerId: "p1", x: 3, y: 10 },   // Arquero Local (cerca del arco izq)
    { playerId: "p2", x: 12, y: 5 },   // Defensor Local (arriba)
    { playerId: "p3", x: 18, y: 12 },  // Mediocampista Local (centro)

    // Equipo Visitante (lado derecho)
    { playerId: "p4", x: 22, y: 8 },   // Mediocampista Visitante (centro)
    { playerId: "p5", x: 28, y: 15 },  // Defensor Visitante (abajo)
    { playerId: "p6", x: 37, y: 10 },  // Arquero Visitante (cerca del arco der)
  ],
};

const mockGoalInfo = { tick: 150, minute: 23, playerId: "p2", team: "home" };


export function MatchPage() {
    const { matchId } = useParams();
    const { lineups, scores, state, goalInfo } = useMatchSocket(matchId);

    return (
        // fixed para sobreescribir configuracion default de app
        <div className="fixed inset-0 bg-slate-950 p-8 text-white overflow-auto z-50">
            {/* Contenedor de cancha.*/}
            <div className="w-[1272px] mx-auto pb-8">
                {/* Header: equipos , contador y score */}
                <MatchHeader scores={mockScores} />

                {/*Contenedor de la cancha */}
                <div className="flex gap-4">
                    <div className="min-w-0 flex-1 relative">

                        {/*cancha */}
                        <Field state={mockState} lineups={mockLineups} />

                        {/*evento de gol */}
                        <GoalBanner goalInfo={mockGoalInfo} />
                    </div>

                    <div className="flex flex-col gap-4 w-64 shrink-0">
                        { /*titulares*/ }
                        <div className="bg-slate-900 border border-slate-700 p-4 h-40">
                            <h3 className="text-sm text-slate-400 mb-2 uppercase font-bold">
                                Equipo
                            </h3>
                        </div>

                        { /*suplentes*/ }
                        <div className="bg-slate-900 border border-slate-700 p-4 h-40">
                            <h3 className="text-sm text-slate-400 mb-2 uppercase font-bold">
                                Suplentes
                            </h3>
                        </div>

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
