import { useEffect, useState } from "react";

const PENALTY_SECONDS = 8;

export function PenaltyShootoutInfo({ penaltyKick, penaltyResult, lineups, teams}) {
    
    if (!penaltyKick) return null;

    const everyone = [...(lineups?.home), ...(lineups?.away)];
    const nameOf = (id) => everyone.find((player) => player.player_id == id)?.name;
    //nombres de jugadores
    const kickerName = nameOf(penaltyKick.kickerId);
    const defenderName = nameOf(penaltyKick.defenderId);
    //nombres de clubes
    const homeName = teams?.home?.name;
    const awayName = teams?.away?.name;
    //resultados de cada club
    const homeResult = penaltyResult?.homePenalties;
    const awayResult = penaltyResult?.awayPenalties;

    return (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 px-4 py-2 text-center text-sm">
            <p className="font-bold uppercase">Penal #{penaltyKick.number}</p>
            <p>
                Patea <span className="text-white">{kickerName}</span>
                {" - "}Defiende <span className="text-white">{defenderName}</span>
            </p>
            <p className="font-mono font-bold">
                {homeName} {homeResult} - {awayResult} {awayName}
            </p>
        </div>
    )
}