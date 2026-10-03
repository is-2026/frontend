import { FIELD_WIDTH, FIELD_HEIGHT } from "../../config"
import PlayerCard from "./PlayerCard";

function stayInBounds(value, min, max) {
  if (value < min) 
    return min;

  if (value > max) 
    return max;

  else return value;
}

// lineups: { home: [{ player_id, ... }], away: [...] } | null — viene de
// useMatchSocket (del mensaje matchStarted, todavía sin traducir a camelCase).
export default function Field({ state, lineups }) {
  const players = state?.players ?? []; //Esto es por si stat llega undefined, se usa lista vacía que no hace nada y no rompe nada
  const ball = state?.ballPosition;

  return (
    <div
      data-testid="field"
      className="relative w-full aspect-[5/3] overflow-hidden border-4 border-white/70 bg-green-700"
    >
      <div className="absolute bottom-0 left-1/2 top-0 w-px bg-white/50" />
      {/* Arcos. Medidas en % (no px) para escalar con el tamaño real del
          contenedor, igual que los jugadores y la pelota.*/}
      <div className="absolute left-0 top-1/2 h-[15%] w-[3%] -translate-y-1/2 border-2 border-l-0 border-white bg-green-800/60" />
      <div className="absolute right-0 top-1/2 h-[15%] w-[3%] -translate-y-1/2 border-2 border-r-0 border-white bg-green-800/60" />

      {players.map((p) => {
        const x = stayInBounds(p.x, 0, FIELD_WIDTH);
        const y = stayInBounds(p.y, 0, FIELD_HEIGHT);
        const isHome = lineups?.home?.some((h) => h.player_id === p.playerId);

        return (
          <PlayerCard
            key={p.playerId}
            player={p}
            team={isHome ? "home" : "away"}
            left={`${(x / FIELD_WIDTH) * 100}%`}
            top={`${(y / FIELD_HEIGHT) * 100}%`}
          />
        );
      })}
      
      {ball && (
        <div
          data-testid="ball"
          className="absolute -ml-1.5 -mt-1.5 h-3 w-3 rounded-full bg-white transition-all duration-100 "
          style = {{
            left:`${stayInBounds(ball.x, 0, FIELD_WIDTH) / FIELD_WIDTH * 100}%`,
            top:`${stayInBounds(ball.y, 0, FIELD_HEIGHT) / FIELD_HEIGHT * 100}%`,
          }}
        />
      )}
    </div>
  );
}