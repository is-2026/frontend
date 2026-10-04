import { WS_URL, MATCH_WS_PATH } from "../config";
import { useState, useEffect, useRef } from "react";

/*  
  cada mensaje viene
  envuelto como { type, data }, con "type" como string constante
  ("matchState", "goal", etc.).*/

export function useMatchSocket(matchId) {
  const [lineups, setLineups] = useState(null); // home, away
  const [scores, setScores] = useState(null); // home, away
  const [state, setState] = useState(null); // match_id, tick, players, ball_position
  const [goalInfo, setGoalInfo] = useState(null);
  //const [finished, setFinished] = useState(null); comentado porque es de otro ticket
  const socketRef = useRef(null);
  const lineupsRef = useRef(null);

  useEffect(() => {
    lineupsRef.current = lineups;
  }, [lineups]);

  useEffect(() => {
    if (!matchId) return;

    socketRef.current = new WebSocket(`${WS_URL}${MATCH_WS_PATH(matchId)}`);
    const ws = socketRef.current;

    ws.addEventListener("open", () => {
      console.log("CONNECTED");
    });
    ws.addEventListener("error", () => {
      console.error(`ERROR`);
    });
    ws.addEventListener("close", () => {
      console.log("DISCONNECTED");
    });

    ws.addEventListener("message", (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        //caso de inicio de partido
        case "matchStarted": {
          const { home_lineup, away_lineup, home_score, away_score } = msg.data;
          setLineups({
            home: home_lineup ?? [],
            away: away_lineup ?? [],
          });
          setScores({
            home: home_score ?? 0,
            away: away_score ?? 0,
          });
          break;
        }

        //Caso estado del partido
        case "matchState": {
          const { match_id, tick, players, ball_position } = msg.data;

          if (match_id !== matchId) {
            console.warn("Aviso: Llegó un mensaje de otro partido");
            return;
          }
          setState({
            matchId: match_id,
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

        //Caso gol
        case "goal": {
          const { player_id, minute, tick } = msg.data;
          const isHomeGoal = lineupsRef.current?.home?.some(
            (h) => h.player_id === player_id,
          );

          setScores((prev) => ({
            home: isHomeGoal ? prev.home + 1 : prev.home, //Si el gol es de home, +1 a score.home
            away: !isHomeGoal ? prev.away + 1 : prev.away, //Si es de away, +1 en score.away
          }));

          setGoalInfo({
            tick: tick,
            minute: minute,
            playerId: player_id,
            team: isHomeGoal ? "home" : "away",
          });
          break;
        }

        //error
        default:
          console.warn("Tipo de mensaje desconocido (partido):", msg.type);
      }
    });

    return () => {
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
    };
  }, [matchId]);
  return { lineups, scores, state, goalInfo };
}
