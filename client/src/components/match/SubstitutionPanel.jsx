import { useState } from "react";
import { scheduleSubstitution, cancelSubstitution } from "../../services/matches";

const SELECT_CLASS = "w-full border border-white/20 bg-slate-800 px-2 py-1 text-sm text-white";
const TOTAL_PAUSES_NUMBER = 3;
export function SubstitutionPanel({
    matchId, starters = [], substitutes = [], behaviors = [], 
    pausesEnded, scheduled, setScheduled
}) {
    const [playerOut, setPlayerOut] = useState("");
    const [playerIn, setPlayerIn] = useState("");
    const [behavior, setBehavior] = useState("");
    const [notice, setNotice] = useState(null);
    const [error, setError] = useState(null);
    const [sending, setSending] = useState(false);

    const complete = playerOut && playerIn && behavior;

     const pending =
        scheduled && substitutes.some((p) => p.player_id == scheduled.player_in_id)
            ? scheduled
            : null;

    async function handleSubmit() {
        setError(null);
        setNotice(null);    
        setSending(true);
        setScheduled(null);
        try {
            const res = await scheduleSubstitution(matchId, playerOut, playerIn, behavior);
            setScheduled({
                ...(res || {}),
                player_out_id: playerOut,
                player_in_id: playerIn,
                substitution_behavior_id: behavior
            });
            setNotice("Se realizará al fin de la pausa");
            setPlayerOut("");
            setPlayerIn("");
            setBehavior("");
        } catch(e) {
            setError(e.message);
        } finally {
            setSending(false);
        }
    }

    async function handleCancel() {
        setError(null);
        try {
            await cancelSubstitution(matchId);
            setScheduled(null);
            setNotice("Cambio cancelado");
        } catch(e) {
            setError(e.message)
        }
    }

    // nombres del cambio pendiente (el que sale está en titulares y el que entra en el banco)
    const outName = starters.find((p) => p.player_id == pending?.player_out_id)?.name; 
    const inName = substitutes.find((p) => p.player_id == pending?.player_in_id)?.name;
    const behaviorName = behaviors.find((b) => b.id == pending?.substitution_behavior_id)?.name;
    //el operador ?. impide que siga leyendo lo que sigue si el parametro previo a ?. es null o no está definido, devolviendo undefined 


    return (
        <div className="bg-slate-900 border border-slate-700 p-4 space-y-2 test-sm">
            <h3 className="text-sm text-slate-400 uppercase font-bold">Cambio de jugador</h3>

            {/* Aviso si no hay más pausas disponibles */}
            {(pausesEnded >= TOTAL_PAUSES_NUMBER) && (
                <p className="text-slate-400 text-xs">
                    Ya se han alcanzado las {TOTAL_PAUSES_NUMBER} pausas permitidas. No se pueden realizar más cambios.
                </p>
            )
            }
            
            {/* Aviso de quién sale y quién entra y boton cancelar */}
            {pending && (
                <div className="border border-emerald-700 p-2">
                    <p>Pendiente: sale {outName}, entra {inName} ({behaviorName})</p>
                    <button onClick={handleCancel} className="underline text-slate-400 hover:text-red-400">
                        Cancelar cambio
                    </button>
                </div>
            )}

            {/* Value es el jugador seleccionado, al seleccionar uno nuevo se cambia value por el nuevo*/}
            <select className={SELECT_CLASS} value={playerOut} onChange={(e) => setPlayerOut(e.target.value)}> 
                <option value="">Quién sale...</option> {/* Valor por defecto, todavía no se seleccionó a nadie*/}
                {starters.map((p) => ( //Muestra numero y name de cada jugador como opciones
                    <option key={p.player_id} value={p.player_id}>#{p.number} {p.name}</option>
                ))}
            </select>
            
            <select className={SELECT_CLASS} value={playerIn} onChange={(e) => setPlayerIn(e.target.value)}>
                <option value="">Quién entra...</option>
                {substitutes.map((p) => (
                    <option key={p.player_id} value={p.player_id}>#{p.number} {p.name}</option>
                ))}
            </select>

            <select className={SELECT_CLASS} value={behavior} onChange={(e) => setBehavior(e.target.value)}>
                <option value="">Qué comportamiento tendrá</option>
                {behaviors.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                ))}
            </select>

            {/* Anuncia la realización del cambio o no. Acá notice no viene del ws sino del servicio,
                por eso se toma como caso aparte */}
            {notice && (
                <p className={notice === "Cambio cancelado" ? "text-red-400" : "text-emerald-400"}>
                    {notice}
                </p>
            )}
            
            {error && <p className="text-red-400">{error}</p>}

            <button
                onClick={handleSubmit}
                disabled={!complete || Boolean(pending) || sending || (pausesEnded >= TOTAL_PAUSES_NUMBER)} /* sending es para que no se puedan reenviar  */
                className="w-full bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-40"
            >
                Confirmar cambio
            </button>
        </div>
    )
}