
export function LineupPanel({
    title, players, renderRight
}) { //
    return (
        <div className="bg-slate-900 border border-slate-700 p-4 h-40">
            <h3 className="text-sm text-slate-400 mb-2 uppercase font-bold">{title}</h3>
            <ul className="space-y-1 text-sm">
                {(players ?? []).map((p) => (
                    <li key={p.player_id} className="flex justify-between gap-2">
                        <span className="truncate">
                            <span className="text-slate-400">#{p.number}</span> {p.name}
                        </span>
                        {renderRight?.(p)}
                    </li>
                ))}
            </ul>
        </div>
    );
}