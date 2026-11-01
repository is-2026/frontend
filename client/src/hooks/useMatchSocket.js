import { MATCH_WS_PATH, wsUrl } from "../config";
import { useState, useEffect, useRef } from "react";

/*  
  cada mensaje viene
  envuelto como { type, data }, con "type" como string constante
  ("matchState", "goal", etc.).*/
const NORMAL_CLOSE = 1000;

function behaviorUpdate(players, player_id, behavior_id, behavior_name) { //en players llega el conjunto o lineup de jugadores de home o de away
	return players.map((p) => {
		if (p.player_id == player_id)  //Si es el jugador buscado
			return { ...p, behavior_id, behavior_name }; //devuelve ese jugador y el behavior_id
		else
			return p; //Si no es el jugador que busco, no hace nada
	});
}

function substitutionUpdate(players, player_in_id, player_out_id, behavior_id, behavior_name) {
	return players.map((p)=> {
		if (p.player_id == player_out_id) {
			return {...p, is_starter: false};
		}
		if (p.player_id == player_in_id) {
			return {...p, is_starter: true, behavior_id, behavior_name};
		}
		return p;
	})
}
//para identificar que team o club hace el cambio (de comportamiento o de jugador)
function whichTeam(lineups, player_id) {
	return lineups.home.some((p) => p.player_id == player_id) ? "home" : "away";
}

export function useMatchSocket(matchId) {
	const [teams, setTeams] = useState(null); // { home: {id, name, avatar_url}, away: {...} }
	const [lineups, setLineups] = useState(null); // home, away
	const [scores, setScores] = useState(null); // home, away
	const [state, setState] = useState(null); // match_id, tick, players, ball_position
	const [goalInfo, setGoalInfo] = useState(null);
	const [pause, setPause] = useState(null);
	const [pausesEnded, setPausesEnded] = useState(0);
	const [finished, setFinished] = useState(null);
	const [closeCode, setCloseCode] = useState(null);

	const socketRef = useRef(null);

	useEffect(() => {
		if (!matchId) return;

		// matchStarted llega una sola vez; lo guardamos acá para leerlo en los goal
		// sin depender del estado de React (el listener se crea una sola vez).
		let started = null;
		// Si el cierre lo pedimos nosotros (desmontaje, StrictMode), no es un error.
		let active = true;
		
		/*
		const ws = new WebSocket(wsUrl(MATCH_WS_PATH(matchId)));
		socketRef.current = ws;
		window.__TEST_WS__ = socketRef.current; // Exponer para pruebas
		if (typeof window !== "undefined") {
			
			// Simular pausa (ej: 'halftime', 'cooling_break_1', etc.)
			window.testPause = (type = "halftime") => {
				setPause({
					type: type,
					startedAt: new Date().toISOString(),
				});
			};

			// 4. Simular fin de pausa / incrementar pausas terminadas (para probar pausesEnded == 3)
			window.testResume = (incrementPauses = true) => {
				setPause(null);
				if (incrementPauses) {
					setPausesEnded((n) => n + 1);
				}
			};
		}
		*/
		socketRef.current = new WebSocket(wsUrl(MATCH_WS_PATH(matchId)));
		const ws = socketRef.current;
		ws.addEventListener("open", () => { console.log("CONNECTED"); });
		ws.addEventListener("error", () => { console.error(`ERROR`); });
		ws.addEventListener("close", (e) => {
			if (!active || e.code === NORMAL_CLOSE) return;
			setCloseCode(e.code);
		});

		ws.addEventListener("message", (e) => {
			const msg = JSON.parse(e.data);
			switch (msg.type) {

				//caso de inicio de partido
				case "matchStarted": {
					started = msg.data; // { home_lineup, away_lineup, home_score, away_score, home_club, away_club } 
					setTeams({
						home: started.home_club,
						away: started.away_club
					});
					setLineups({
						home: started.home_lineup ?? [],
						away: started.away_lineup ?? [],
					});
					setScores({
						home: started.home_score ?? 0,
						away: started.away_score ?? 0,
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
					const { player_id, minute, tick,
						team_id, home_score, away_score } = msg.data;

					setScores({
						home: home_score,
						away: away_score, 
					});
					
					const team = team_id === started?.home_club?.id ? "home" : "away";
					setGoalInfo({
						tick: tick,
						minute: minute,
						playerId: player_id,
						team: team,
						teamName: started?.[`${team}_club`]?.name,
					});
					break;
				
				}
			
				//Caso finalización del partido
				case "matchFinished": {
					const { tick, match_end, home_score, away_score } = msg.data;
					//Se setea finished con estos valores, deja de ser null.
					setScores({ 
						home: home_score, 
						away: away_score 
					});
					setFinished({
						tick,
						matchEnd: match_end,
						homeScore: home_score ?? 0,
						awayScore: away_score ?? 0,
						})
					break;
				}
				
				//Caso pausa de hidratación
				case "coolingBreakStart": {
					const {cooling_break_number, cooling_break_start} = msg.data;
					setPause({
						type: cooling_break_number == 1 ? "cooling_break_1" : "cooling_break_2", //identifica qué cooling break es
						startedAt: cooling_break_start,
					});
					break;
				}

				//Caso pausa de medio tiempo
				case "halftimeStart": {
					setPause({
						type: "halftime",
						startedAt: msg.data.halftime_start,
					});
					break;
				}

				//Caso partido resumido
				case "matchResumed": {
					setPause(null);
					setPausesEnded((n) => (n+1));
					break;
				}

				//Caso cambio de comportamiento en vivo
				case "behaviorChanged": {
					const { player_id, behavior_id, behavior_name } = msg.data;
					setLineups((prev) => {
						const team = whichTeam(prev, player_id); //team puede ser "home" o "away"
						return { ...prev, [team]: behaviorUpdate(prev[team], player_id, behavior_id, behavior_name)};
					}); //team se usa como clave para acceder a home o away
					break;
				}

				case "substitutionMade": {
					const { player_in_id, player_out_id, behavior_id, behavior_name } = msg.data;
					setLineups((prev) => {
						const team = whichTeam(prev, player_in_id);
						return { ...prev, [team]: substitutionUpdate(prev[team], player_in_id, player_out_id, behavior_id, behavior_name)};
					});
					break;	
				}

				//error
				default:
					console.warn("Tipo de mensaje desconocido (partido):", msg.type);
			}
		});

		return () => {
			active = false;
			if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
				ws.close();
			}
		};
	}, [matchId]);
	return { teams, lineups , scores , state, goalInfo, finished, closeCode, pause, pausesEnded };
}
