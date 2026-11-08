import {useEffect, useState } from "react";
import { setPenaltyOrder } from "../../services/matches";

const KICKERS = 5;
const SELECT_CLASS = "w-full border border-white/20 bg-slate-800 px-2 py-1 text-sm text-white";

function secondsLeft(endsAt) {
    return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
}

export function PenaltyOrderPanel({matchId, players = [], behaviors = [], endsAt}) {
    const end = Date.parse(endsAt);
    const [left, setLeft] = useState(() => secondsLeft(end));
    const [slots, setSlots] = useState(() =>
        Array.from({ length: KICKERS }, () => ({ playerId: "", behaviorId: "" }))
    );
    const [notice, setNotice] = useState(null);
    const [error, setError]= useState(null); 
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const update = () => setLeft(secondsLeft(end));
        update();
        const id = setInterval(update, 250);
        return () => clearInterval(id);
    }, [end]);

    //filtra comportamientos que no sean kind == player
    const playerBehaviors = behaviors.filter((behavior) => behavior.kind === "player");
    //Se queda con el string del Id
    const chosen = slots.map((slot)=> slot.playerId).filter(Boolean);
    const complete = slots.every((slot) => slot.playerId && slot.behaviorId);

    function updateSlot(i, field, value) {
        setNotice(null);
        setSlots((prev) => 
            prev.map((slot, index) => 
                ((index == i) ? {...slot, [field]:value} : slot) 
            )
        )
    }

    async function handleConfirm(){
        setError(null);
        setNotice(null);
        setSending(true);
        try {
            await setPenaltyOrder(
                matchId,
                slots.map((slot)=>
                    ({ 
                        player_id: slot.playerId,
                        behavior_id: slot.behaviorId,
                    })),
            );
            setNotice("Orden confirmado");
        } catch (e) {
            setError(e.message);
        } finally {
            setSending(false);
        }
    }

    if (left <= 0) return null;
    
    return (
        <div className="bg-slate-900 p-4 space-y-2 text-sm">
            <div className="flex justify-between items-center">
                <h3 className="text-sm text-slate-400 uppercase font-bold">Orden de penales</h3>
                <span className="font-mono text-emerald-400 font-bold">{left}</span>
            </div>

            {slots.map((slot, i) => (
                <div key={i} className="space-y-1"> 
                    <p className="text-xs text-slate-400">Pateador {i+1}</p>
                    <select
                        className={SELECT_CLASS}
                        value={slot.playerId}
                        onChange={(e) =>
                            updateSlot(i, "playerId", e.target.value)
                        }
                    >
                        <option value="">Jugador</option>
                        {players
                            .filter((player) => (player.player_id == slot.playerId) || !chosen.includes(p.player_id))
                            .map((player) => (
                                <option key={player.player_id} value={player.player_id}>
                                    #{player.number} {player.name}
                                </option>
                            ))}
                    </select>
                    <select 
                        className={SELECT_CLASS}
                        value={slot.behaviorId}
                        onChange={(event) => updateSlot(i, "behaviorId", event.target.value)}
                    >
                        <option value="">Comportamiento</option>
                        {playerBehaviors.map((behavior) => (
                            <option key={behavior.id} value={behavior.id}> {behavior.name}</option>
                        ))}
                    </select>
                </div>
            ))}
            {notice && <p className="text-emerald-400">{notice}</p>}
            {error && <p className="text-red-400">{error}</p>}
            <button
                onClick={handleConfirm}
                disabled={!complete || sending}
                className="w-full bg-emerald-600 py-2 font-medium disabled:opacity-40 hover:bg-emerald-500 transition-colors duration-200"
            >
                Confirmar elección
            </button>
        </div>
    );
}