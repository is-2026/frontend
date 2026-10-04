import { WS_URL, MATCH_WS_PATH } from "../config";
import { useState, useEffect, useRef } from "react";


export default function useMatchSocket(matchId) {
    const [lineups, setLineups] = useState(null);
    const [scores, setScores] = useState(null);
    const [ball_position, setBallPosition] = useState(null);
    const [players, setPlayers] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!matchId) return;

        socketRef.current = new WebSocket(`${WS_URL}${MATCH_WS_PATH(matchId)}`);
        const socket = socketRef.current;

        socket.addEventListener("open", () => { console.log("CONNECTED"); });
        socket.addEventListener("error", () => { console.error(`ERROR`); });
        socket.addEventListener("message", (e) => {
            const message = JSON.parse(e.data);
            switch (message.type) {
            case "matchStarted":
                setLineups({ home: message.data.home_lineup, away: message.data.away_lineup });
                setScores({ home: message.data.home_score, away: message.data.away_score });
                break;
            case "matchState":
                setBallPosition(message.data.ball_position);
                setPlayers(message.data.players);
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
    }, [matchId]);
    return { lineups , scores , ball_position, players };
}