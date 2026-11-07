const STATS = [
    ["POW", "power"],
    ["AGI", "agility"],
    ["CON", "control"],
    ["SPE", "speed"],
    ["STR", "strength"],
];
export function LineupPanel({
    title, players, renderRight
}) { //
    return (
        <div className="bg-slate-900 border border-slate-700 min-h-[10rem]">
            <h3 className="text-sm text-slate-400 mb-2 uppercase font-bold">{title}</h3>
            <ul className="space-y-1 text-sm">
                {(players ?? []).map((p) => (
                    <li key={p.player_id}>
                        {/* fila 1: número + nombre, y a la derecha el select (si hay) */}
                        <div className="flex justify-between items-center gap-2">
                            <span className="truncate">
                                <span className="text-slate-400">#{p.number}</span> {p.name}
                            </span>
                            {renderRight?.(p)}
                        </div>

                        {/* fila 2: atributos en su propia línea, a todo el ancho */}
                        <div className="mt-0.5 flex justify-between text-[11px] font-mono whitespace-nowrap">
                            {STATS.map(([label, key]) => (
                                <span key={key}>
                                    <span className="text-slate-500">{label}</span>{" "}
                                    <span className="text-slate-300">{p[key] ?? "-"}</span>
                                </span>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

