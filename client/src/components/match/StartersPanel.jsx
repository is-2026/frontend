import { useState } from "react";
import { LineupPanel } from "./LineupPanel";
import { changeLiveBehavior } from "../../services/matches";

export function StartersPanel({matchId, players, behaviors}) {
    const [error, setError] =useState(null);

    async function handleBehaviorChange(playerId, behaviorId) {
        setError(null);
        try {
            await changeLiveBehavior(matchId, playerId, behaviorId);
        } catch (e) {
            setError(e.message);
        }
    }

    return (
        <>
            <LineupPanel
                title="Titulares"
                players={players}
                renderRight={(p) => (
                    <select
                        className="border border-white/20 bg-slate-800 px-1 text-xs text-white max-w-[50%]"
                        value={p.behavior_id}
                        onChange={(e) => handleBehaviorChange(p.player_id, e.target.value)}
                    > 
                        {behaviors.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                )}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
        </>
    );
    {/* onChange envía la request (PATCH) al back, el back responde con
        behaviorChanged por ws (mensaje con behaviors actualizados),
        MatchPage recibe los nuevos behaviors del hook y se 
        re-renderiza startersPanel con los nuevos valores.
    */}
}