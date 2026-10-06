import { PlayerCard } from "./PlayerCard";
import {toLeft, toTop} from "./utils/utils";

// lineups: { home: [{ player_id, ... }], away: [...] } | null — viene de
// useMatchSocket (del mensaje matchStarted, todavía sin traducir a camelCase).
export function Field({ state, lineups }) {
    const players = state?.players ?? []; //Esto es por si stat llega undefined, se usa lista vacía que no hace nada y no rompe nada
    const ball = state?.ballPosition;

    return (
        <div
            data-testid="field"
            className="relative w-full aspect-[2/1] overflow-hidden border-4 border-white/70 bg-green-700"
        >
            <div className="absolute bottom-0 left-1/2 top-0 w-px bg-white/50" />

            {/* Se usarán medidas en % (no px) para escalar con el tamaño real del
          contenedor, igual que los jugadores y la pelota.*/}

            {/* Círculo central */}
            <div className="absolute left-1/2 top-1/2 h-[30%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 pointer-events-none" />

            {/* Punto central del saque de centro */}
            <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 pointer-events-none" />

            {/* Arcos */}
            <div className="absolute left-0 top-1/2 h-[15%] w-[3%] -translate-y-1/2 border-2 border-l-0 border-white bg-green-800/60" />
            <div className="absolute right-0 top-1/2 h-[15%] w-[3%] -translate-y-1/2 border-2 border-r-0 border-white bg-green-800/60" />

            {players.map((p) => {
                const isHome = lineups?.home?.some(
                    (h) => h.player_id === p.playerId,
                );
                // datos del jugador en la alineación (número y nombre)
                const info = [...(lineups?.home ?? []), ...(lineups?.away ?? [])].find(
                    (l) => l.player_id === p.playerId,
                );

                return (
                    <PlayerCard
                        key={p.playerId}
                        player={p}
                        team={isHome ? "home" : "away"}
                        number={info?.number}
                        name={info?.name}
                        left={toLeft(p.x)}
                        top={toTop(p.y)}
                    />
                );
            })}

            {ball && (
                <div
                    data-testid="ball"
                    className="absolute -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white transition-all duration-100 "
                    style={{
                        left: toLeft(ball.x),
                        top: toTop(ball.y),
                    }}
                />
            )}
        </div>
    );
}