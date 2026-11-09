import { formatMatchTime } from "./utils/utils";



export function PenaltyShootoutInfo({ penaltyKick, penaltyResult, state, lineups, teams, penaltyTicks}) {
    
    if (!penaltyKick) return null;

    const ticksLeft = Math.max(0, penaltyTicks - state.tick);

    const everyone = [...(lineups?.home), ...(lineups?.away)];
    const nameOf = (id) => everyone.find((player) => player.player_id == id)?.name;
    //nombres de jugadores
    const kickerName = nameOf(penaltyKick.kickerId);
    const defenderName = nameOf(penaltyKick.defenderId);
    //nombres de clubes
    const homeName = teams?.home?.name;
    const awayName = teams?.away?.name;
    
    //Si un usuario se conecta durante un penal, 
    //no recibe penaltyResult ni penaltyShootoutStart -> dan info para el marcador
    //Entonces es null y no se dibuja nada.
    //Por esto se usa ?? 0 en caso de que sea null.
    const homeResult = penaltyResult?.homePenalties ?? 0;
    const awayResult = penaltyResult?.awayPenalties ?? 0;

    return (
        <div className="bg-slate-900 mb-4 px-4 py-2 text-center text-sm">
            <p className="font-bold uppercase">Penal #{penaltyKick.number}</p>
            <p>
                Patea <span className="text-white">{kickerName}</span>
                {" - "}Defiende <span className="text-white">{defenderName}</span>
            </p>
            <p className="font-mono font-bold">
                {homeName} {homeResult} - {awayResult} {awayName}
            </p>
            <p className="font-mono font-bold text-emerald-400">{formatMatchTime(ticksLeft)}</p>
        </div>
    )
}