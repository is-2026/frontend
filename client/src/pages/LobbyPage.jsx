import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInitFriendlySocket } from "../hooks/useInitFriendlySocket";

export function LobbyPage() {
    const { friendlyId } = useParams();
    const navigate = useNavigate();
    
    // Llamada al hook para escuchar inicio de partido 
    const { matchId, rival } = useInitFriendlySocket(friendlyId);

    // Redireccion al partido cuando se recibe el ID del partido
    useEffect(() => {
        if (matchId) {
            navigate(`/match/${matchId}`);
        }
    }, [matchId, navigate]);

    return (
        <div className="p-6 text-center text-white">
            <h2 className="text-xl font-bold">Lobby del Amistoso</h2>
            {!rival && <p className="mt-2 text-slate-400">Esperando rival...</p>}
            {rival && (
                <>
                    <p className="mt-4 text-2xl font-bold">Vas a jugar contra {rival.name}</p>
                    <p className="mt-2 text-slate-400">Arrancando el partido...</p>
                </>
            )}
        </div>
    );
}