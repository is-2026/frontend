import { useEffect, useState } from "react";
import { WS_URL, MATCH_WS_PATH } from "../config";

/*  
  cada mensaje viene
  envuelto como { type, data }, con "type" como string constante
  ("matchState", "goal", etc.).*/

export function useMatchSocket(matchId) {
  const [state, setState] = useState(null); // { tick, players, ballPosition } | null

  useEffect(() => {
    if (!matchId) return;

    const ws = new WebSocket(`${WS_URL}${MATCH_WS_PATH(matchId)}`);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      
      switch (msg.type) {
        //Si llega estado del partido, entra a este case.
        case "matchState": {
          const { match_id, tick, players, ball_position } = msg.data;

          if (match_id !== matchId) {
            console.warn("Aviso: Llegó un mensaje de otro partido");
            return;
          }

          setState({
            tick,
            players: players.map((p) => ({
              playerId: p.player_id,
              x: p.position?.x ?? 0,
              y: p.position?.y ?? 0,
            })),
            ballPosition: {
              x: ball_position?.x ?? 0,
              y: ball_position?.y ?? 0,
            },
          });
          break;
        }

        case "goal": 
          //Se implementa en otro ticket.
          break;

        default:
          console.warn("Tipo de mensaje desconocido (partido):", msg.type);
      }
    };

    ws.onerror = (err) => console.error("Match socket error:", err);

    return () => ws.close();
  }, [matchId]);

  return state;
}
