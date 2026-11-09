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
	const [penaltyStart, setPenaltyStart] = useState(null);
	const [penaltyResult, setPenaltyResult] = useState(null);
	const [penaltyKick, setPenaltyKick] = useState(null);
	const socketRef = useRef(null);

	useEffect(() => {
		if (!matchId) return;

		// matchStarted llega una sola vez; lo guardamos acá para leerlo en los goal
		// sin depender del estado de React (el listener se crea una sola vez).
		let started = null;
		// Si el cierre lo pedimos nosotros (desmontaje, StrictMode), no es un error.
		let active = true;
		
		/*
		Mock para probar pausas en consola f12
		const send = (type, data) =>
		window.__TEST_WS__.dispatchEvent(
			new MessageEvent("message", { data: JSON.stringify({ type, data }) })
		);
		const inSeconds = (s) => new Date(Date.now() + s * 1000).toISOString();

		Y luego enviar estos mensajes 
		// Pausa de hidratación 1, 15 s
		send("coolingBreakStart", { cooling_break_number: 1, ends_at: inSeconds(15) });

		// Entretiempo
		send("halftimeStart", { halftime_start: new Date().toISOString(), ends_at: inSeconds(15) });

		// Hidratación 2
		send("coolingBreakStart", { cooling_break_number: 2, ends_at: inSeconds(15) });

		// Fin de pausa
		send("matchResumed", {});
		*/
		socketRef.current = new WebSocket(wsUrl(MATCH_WS_PATH(matchId)));
		const ws = socketRef.current;
		if (import.meta.env.DEV) window.__TEST_WS__ = ws;

		ws.addEventListener("open", () => { console.log("CONNECTED"); });
		ws.addEventListener("error", () => { console.error(`ERROR`); });
		ws.addEventListener("close", (e) => {
			if (!active || e.code === NORMAL_CLOSE) return;
			setCloseCode(e.code);
		});

		ws.addEventListener("message", (e) => {
			const msg = JSON.parse(e.data);
			switch (msg.type) {

				//1. caso de inicio de partido
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

				//2. Caso estado del partido
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

				//3. Caso gol
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
			
				//4. Caso finalización del partido
				case "matchFinished": {
					const { 
						tick, match_end, 
						home_score, away_score,
						home_penalties, away_penalties,
						winner_club_id
					} = msg.data;
					//Se setea finished con estos valores, deja de ser null.
					setScores({ 
						home: home_score, 
						away: away_score 
					});
					setFinished({
						tick,
						matchEnd: match_end,
						homeScore: home_score,
						awayScore: away_score,
						homePenalties: home_penalties, 
						awayPenalties: away_penalties,
						winnerClubId: winner_club_id
						})
					break;
				}
				
				//5. Caso pausa de hidratación
				case "coolingBreakStart": {
					const {cooling_break_number, ends_at} = msg.data;
					setPause({
						type: cooling_break_number == 1 ? "cooling_break_1" : "cooling_break_2", //identifica qué cooling break es
						endsAt: ends_at,
					});
					break;
				}

				//6. Caso pausa de medio tiempo
				case "halftimeStart": {
					setPause({
						type: "halftime",
						endsAt: msg.data.ends_at,
					});
					break;
				}

				//7. Caso partido resumido
				case "matchResumed": {
					setPause(null);
					setPausesEnded((n) => (n+1));
					break;
				}

				//8. Caso cambio de comportamiento en vivo
				case "behaviorChanged": {
					const { player_id, behavior_id, behavior_name } = msg.data;
					setLineups((prev) => {
						const team = whichTeam(prev, player_id); //team puede ser "home" o "away"
						return { ...prev, [team]: behaviorUpdate(prev[team], player_id, behavior_id, behavior_name)};
					}); //team se usa como clave para acceder a home o away
					break;
				}

				//9. caso sustitución realizada
				case "substitutionMade": {
					const { player_in_id, player_out_id, behavior_id, behavior_name } = msg.data;
					setLineups((prev) => {
						const team = whichTeam(prev, player_in_id);
						return { ...prev, [team]: substitutionUpdate(prev[team], player_in_id, player_out_id, behavior_id, behavior_name)};
					});
					break;	
				}

				//10. caso inicio penales
				case "penaltyShootoutStart":{
					const { ends_at } = msg.data;
					setPenaltyStart({
						endsAt: ends_at,
					});
					setPenaltyResult({ homePenalties: 0, awayPenalties: 0 });
    				break;
				}

				//11. Caso penal individual terminado
				case "penaltyResult":{
					const{
						team_id, scored, 
						home_penalties, away_penalties,
						number
					} = msg.data;
					setPenaltyResult({
						teamId: team_id,
						scored: scored,
						homePenalties: home_penalties, //cuantos penales metió home
						awayPenalties: away_penalties, //cuantos penales metió away
						number: number //cuantos penales se realizaron hasta ahora
					});
					break;
				}

				//12. Caso patear penal (quién patea y quién ataja)
				case "penaltyKick":{
					const {
						defender_id, kicker_id, 
						team_id, number,
						penalty_ticks
					} = msg.data;
					setPenaltyKick({
						kickerId: kicker_id,
						defenderId: defender_id,
						teamId: team_id,
						number: number,
						penaltyTicks: penalty_ticks
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
	return { 
		teams, lineups, scores, 
		state, goalInfo, finished, 
		closeCode, pause, pausesEnded,
		penaltyStart, penaltyResult, penaltyKick
	};
}
