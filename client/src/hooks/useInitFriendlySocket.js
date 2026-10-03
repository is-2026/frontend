import { WS_URL, FRIENDLY_LOBBY_WS_PATH } from "../config";
import { useState, useEffect, useRef } from "react";


export default function useInitFriendlySocket(friendlyId) {
    const [partidoId, setPartidoId] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!friendlyId) return;

        socketRef.current = new WebSocket(`${WS_URL}${FRIENDLY_LOBBY_WS_PATH(friendlyId)}`);
        const socket = socketRef.current;

        socket.addEventListener("open", () => { console.log("CONNECTED"); });
        socket.addEventListener("error", () => { console.error(`ERROR`); });
        socket.addEventListener("message", (e) => {
            const message = JSON.parse(e.data);
            switch (message.type) {
            case "friendlyStart":
                setPartidoId(message.data.match_id);
                socket.close();
                break;
            default:
                console.warn("Recibido un tipo de mensaje desconocido:", message.type);
            }
        });
        socket.addEventListener("close", () => { console.log("DISCONNECTED"); });

        return () => {
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
                socket.close();
            }
        };
    }, [friendlyId]);
    return { partidoId };
}