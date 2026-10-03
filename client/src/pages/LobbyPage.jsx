import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useInitFriendlySocket from "../hooks/useInitFriendlySocket";

export default function LobbyPage() {
    const { friendlyId } = useParams();
    const navigate = useNavigate();
    
    // Llamada al hook para escuchar inicio de partido 
    const { partidoId } = useInitFriendlySocket(friendlyId);

    // Redireccion al partido cuando se recibe el ID del partido
    useEffect(() => {
        if (partidoId) {
            navigate(`/partido/${partidoId}`);
        }
    }, [partidoId, navigate]);

    return (
        <div className="p-6 text-center text-white">
            <h2 className="text-xl font-bold">Lobby del Amistoso</h2>
            <p className="mt-2 text-slate-400">Esperando para iniciar el partido...</p>
        </div>
    );
}