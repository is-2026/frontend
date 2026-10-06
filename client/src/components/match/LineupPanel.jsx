// players: jugadores de una alineación de matchStarted
// ({ player_id, number, name, is_starter, behavior_name? }).
// showBehavior: los titulares muestran su comportamiento; los suplentes no tienen.
export function LineupPanel({ title, players, showBehavior = false }) {
    return (
        <div className="bg-slate-900 border border-slate-700 p-4 h-40">
            <h3 className="text-sm text-slate-400 mb-2 uppercase font-bold">{title}</h3>
            <ul className="space-y-1 text-sm">
                {(players ?? []).map((p) => (
                    <li key={p.player_id} className="flex justify-between gap-2">
                        <span className="truncate">
                            <span className="text-slate-400">#{p.number}</span> {p.name}
                        </span>
                        {showBehavior && (
                            <span className="text-slate-400 truncate">{p.behavior_name}</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}