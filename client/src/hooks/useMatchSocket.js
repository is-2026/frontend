import { useEffect, useState } from "react";
import { WS_URL, MATCH_WS_PATH } from "../config";

/*  
  cada mensaje viene
  envuelto como { type, data }, con "type" como string constante
  ("matchState", "goal", etc.).*/

export function useMatchSocket(matchId) {
  const [state, setState] = useState(null); // { tick, players, ballPosition } | null
  const [finished, setFinished] = useState(null);
  const [goalInfo, setGoalInfo] = useState(null);

  useEffect(() => {
    if (!matchId) return;

    const ws = new WebSocket(`${WS_URL}${MATCH_WS_PATH(matchId)}`);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      
      switch (msg.type) {
        
        case "matchFinished": {
          //Se implementa en otro ticket
          const { match_end, home_score, away_score } = msg.data;
            //Se setea finished con estos valores, deja de ser null.
            setFinished({
              matchEnd: match_end,
              homeScore: home_score ?? 0,
              awayScore: away_score ?? 0,
            })
          break;
        }

        //Si llega estado del partido, entra a este case.
        case "matchState": {
          const { match_id, tick, players, ball_position } = msg.data;

          if (match_id !== matchId) {
            console.warn("Aviso: Llegó un mensaje de otro partido");
            return;
          }

          setState({
            tick: tick,
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

        case "goal": {
          const { player_name, club_name } = msg.data;
          setGoalInfo({
            scoringPlayer: player_name,
            scoringClub: club_name,
          });
          break;
        }

        default:
          console.warn("Tipo de mensaje desconocido (partido):", msg.type);
      }
    };

    ws.onerror = (err) => console.error("Match socket error:", err);

    return () => ws.close();
  }, [matchId]);

  return { state, finished, goalInfo } ;
}
