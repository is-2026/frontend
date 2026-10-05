import { useEffect, useState } from "react";

// goalInfo: { tick, minute, playerId, team } | null — viene de useMatchSocket.
// TODO: Ver si agregamos nombre de jugador para mostrarlo al hacer gol

export function GoalBanner({ goalInfo }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!goalInfo) return;

    setVisible(true);
    const timeout = setTimeout(() => setVisible(false), 2000);
    
    return () => clearTimeout(timeout);
  }, [goalInfo]);

  if (!visible || !goalInfo) return null;

  const teamLabel = 
    goalInfo.teamName ?? (goalInfo.team === "home" ?
    "Equipo Local" : "Equipo Rival");

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/40">
      <div className="text-center">
        <p className="text-5xl font-extrabold text-white">¡GOL!</p>
        <p className="mt-2 text-lg text-white">
          {teamLabel} - minuto {goalInfo.minute}'
        </p>
      </div>
    </div>
  );
}
