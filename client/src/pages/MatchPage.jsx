import { useParams } from "react-router-dom";
import MatchHeader from "../components/match/MatchHeader";
import useMatchSocket from "../hooks/useMatchSocket";
import PlayerCard from "../components/match/PlayerCard";

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

export default function MatchPage() {
    const { matchId } = useParams();
    const { lineups, scores, ball_position, players } = useMatchSocket(matchId);

    const pitchWidth = 1000;
    const pitchHeight = 500;
    const goalHeight = 75;

    return (
        // fixed para sobreescribir configuracion default de app
        <div className="fixed inset-0 bg-slate-950 p-8 text-white overflow-auto z-50">
            
            {/* Contenedor de cancha.*/}
            <div className="w-[1272px] mx-auto pb-8">

                {/* Header: equipos , contador y score */}
                <MatchHeader scores={scores} />

                <div className="flex gap-4">
                    <div 
                        className="relative bg-green-700 border-2 border-white shrink-0"
                        style={{ width: `${pitchWidth}px`, height: `${pitchHeight}px` }}
                    >
                        {/* Líneas de la cancha */}
                        <div className="absolute w-px h-full bg-white/60 left-1/2 -translate-x-1/2"></div>
                        <div className="absolute w-[150px] h-[150px] border-2 border-white/60 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                        
                        {/* Arcos */}
                        <div 
                            className="absolute left-0 border-2 border-white border-l-0 bg-green-800/60"
                            style={{ height: `${goalHeight}px`, width: '30px', top: '50%', transform: 'translateY(-50%)' }}
                        ></div>
                        <div 
                            className="absolute right-0 border-2 border-white border-r-0 bg-green-800/60"
                            style={{ height: `${goalHeight}px`, width: '30px', top: '50%', transform: 'translateY(-50%)' }}
                        ></div>

                        {/* Pelota */}
                        {ball_position && (
                            <div className="absolute w-4 h-4 bg-white rounded-full border-2 border-black z-10 shadow-md -translate-x-1/2 -translate-y-1/2"
                                style={{ left: ball_position.x, top: ball_position.y }}
                            ></div>
                        )}
                        
                        {/* Jugadores  */}
                        {players?.map((p) => ( 
                            <PlayerCard key={p.player_id} 
                                        player={p} 
                                        team={lineups?.home?.some(h => h.player_id === p.player_id) ? "home" : "away"}
                            />))}
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