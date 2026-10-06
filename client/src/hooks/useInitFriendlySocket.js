import { wsUrl, FRIENDLY_LOBBY_WS_PATH } from "../config";
import { useState, useEffect, useRef } from "react";


export function useInitFriendlySocket(friendlyId) {
    const [matchId, setMatchId] = useState(null);
    const [rival, setRival] = useState(null); // { id, name } del club que se unió
    const [startsAt, setStartsAt] = useState(null); // Date en que arranca el partido
    const socketRef = useRef(null);

    useEffect(() => {
        if (!friendlyId) return;

        socketRef.current = new WebSocket(wsUrl(FRIENDLY_LOBBY_WS_PATH(friendlyId)));
        const socket = socketRef.current;

        socket.addEventListener("open", () => { console.log("CONNECTED"); });
        socket.addEventListener("error", () => { console.error(`ERROR`); });
        socket.addEventListener("message", (e) => {
            const message = JSON.parse(e.data);
            switch (message.type) {
            case "friendlyClubRegistered":
                setRival({ id: message.data.club_id, name: message.data.club_name });
                setStartsAt(new Date(message.data.starts_at));
                break;
            case "friendlyStart":
                setMatchId(message.data.match_id);
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
    return { matchId, rival, startsAt };
}