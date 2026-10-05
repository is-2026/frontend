import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInitFriendlySocket } from "../hooks/useInitFriendlySocket";

export function LobbyPage() {
    const { friendlyId } = useParams();
    const navigate = useNavigate();
    
    // Llamada al hook para escuchar inicio de partido 
    const { matchId, rival, startsAt } = useInitFriendlySocket(friendlyId);

    // segundos que faltan: se calcula contra starts_at (hora absoluta que manda el back),
    // así da bien aunque cada uno haya entrado al lobby en otro momento
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if (!startsAt) return;
        const id = setInterval(() => setNow(Date.now()), 250);
        return () => clearInterval(id);
    }, [startsAt]);
    const secondsLeft = startsAt ? Math.max(0, Math.ceil((startsAt - now) / 1000)) : null;

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
                    <p className="mt-4 text-2xl font-bold">vs {rival.name}</p>
                    <p className="mt-2 text-5xl font-black text-emerald-400">
                        {secondsLeft > 0 ? secondsLeft : "¡Ya!"}
                    </p>
                    <p className="mt-2 text-slate-400">
                        {secondsLeft > 0 ? "segundos para que arranque el partido" : "Arrancando..."}
                    </p>
                </>
            )}
        </div>
    );
}