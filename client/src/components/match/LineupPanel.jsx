const STATS = [
    ["POW", "power"],
    ["AGI", "agility"],
    ["CON", "control"],
    ["SPE", "speed"],
    ["STR", "strength"],
];
export function LineupPanel({title, players, renderRight, kickerId, defenderId}) { //

    const penaltyRole = (player) => {
        if (kickerId != null && player.player_id == kickerId)
            return <span className="text-s font-bold text-green-200">PATEA</span>;
        if (defenderId != null && player.player_id == defenderId)
            return <span className="text-s font-bold text-orange-200">ATAJA</span>;
        return null;
    };

    return (
        <div className="bg-slate-900 min-h-[10rem] px-2 py-2">
            <h3 className="text-sm text-slate-400 mb-2 uppercase font-bold">{title}</h3>
            <ul className="space-y-1 text-sm">
                {(players ?? []).map((player) => (
                    <li key={player.player_id}>
                        {/* fila 1: número + nombre, y a la derecha el select (si hay) */}
                        <div className="flex justify-between items-center gap-2">
                            <span className="truncate">
                                <span className="text-slate-400">#{player.number}</span> {player.name}
                            </span>
                            {renderRight?.(player)} 
                            {penaltyRole(player)}
                            {/* Si renderRight es null, no dibuja nada, lo mismo en penaltyRole */}
                        </div>

                        {/* fila 2: atributos en su propia línea, a todo el ancho */}
                        <div className="mt-0.5 flex justify-between text-[11px] font-mono whitespace-nowrap">
                            {STATS.map(([label, key]) => (
                                <span key={key}>
                                    <span className="text-slate-500">{label}</span>{" "}
                                    <span className="text-slate-300">{player[key] ?? "-"}</span>
                                </span>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

