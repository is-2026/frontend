import { useParams } from "react-router-dom";
import { MatchHeader } from "../components/match/MatchHeader";
import { Field } from "../components/match/Field";
import { useMatchSocket } from "../hooks/useMatchSocket";

/* // Mock para probar la vista:
const scores = { home_score: 2, away_score: 20 };
    
// Pelota en el medio exacto
const ball_position = { x: 500, y: 250 }; 
    
// 6 jugadores distribuidos
const players = [
    { player_id: "p1", position: { x: 450, y: 250 } },
    { player_id: "p2", position: { x: 400, y: 100 } },
    { player_id: "p3", position: { x: 200, y: 400 } },
    { player_id: "p4", position: { x: 550, y: 250 } },
    { player_id: "p5", position: { x: 600, y: 100 } },
    { player_id: "p6", position: { x: 100, y: 400 } }
];
// Mock lineups
const lineups = {
    home: [{ player_id: "p1" }, { player_id: "p2" }, { player_id: "p3" }],
    away: [{ player_id: "p4" }, { player_id: "p5" }, { player_id: "p6" }]
}; */

export function MatchPage() {
    const { matchId } = useParams();
    const { lineups, scores, state } = useMatchSocket(matchId);

    return (
        // fixed para sobreescribir configuracion default de app
        <div className="fixed inset-0 bg-slate-950 p-8 text-white overflow-auto z-50">
            
            {/* Contenedor de cancha.*/}
            <div className="w-[1272px] mx-auto pb-8">

                {/* Header: equipos , contador y score */}
                <MatchHeader scores={scores} />

                <div className="flex gap-4">
                    <div className="min-w-0 flex-1">
                        <Field state={state} lineups={lineups} />
                    </div>

                    <div className="flex flex-col gap-4 w-64 shrink-0">
                        <div className="bg-slate-900 border border-slate-700 p-4 rounded h-40">
                            <h3 className="text-sm text-slate-400 mb-2 uppercase font-bold">Equipo</h3>
                        </div>
                        <div className="bg-slate-900 border border-slate-700 p-4 rounded h-40">
                            <h3 className="text-sm text-slate-400 mb-2 uppercase font-bold">Suplentes</h3>
                        </div>
                        <button className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded border border-slate-600 transition-colors uppercase text-sm mt-auto">
                            Realizar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}