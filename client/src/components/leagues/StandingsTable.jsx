export function StandingsTable({ standings }) {
    // si no hay datos todavia, mostramos un mensaje en vez de una tabla vacia
    if (!standings || standings.length === 0) {
        return (
            <p className="text-slate-500 text-sm text-center py-8">
                Todavía no hay posiciones para mostrar.
            </p>
        );
    }

    return (
        <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                    <th className="px-2 py-2">Pos</th>
                    <th className="px-2 py-2">Club</th>
                    <th className="px-2 py-2 text-center">Pts</th>
                    <th className="px-2 py-2 text-center">PJ</th>
                    <th className="px-2 py-2 text-center">PG</th>
                    <th className="px-2 py-2 text-center">PG pen.</th>
                    <th className="px-2 py-2 text-center">PE</th>
                    <th className="px-2 py-2 text-center">PP</th>
                    <th className="px-2 py-2 text-center">GF</th>
                    <th className="px-2 py-2 text-center">GC</th>
                    <th className="px-2 py-2 text-center">DG</th>
                </tr>
            </thead>
            <tbody>
                {standings.map((row, index) => {
                    // la diferencia de gol no viene del back, la calculamos
                    const goalDiff = row.goals_for - row.goals_against;

                    return (
                        <tr key={row.club_id} className="border-b border-slate-800 text-slate-200">
                            {/* el back devuelve la tabla ordenada, la posicion es el indice + 1 */}
                            <td className="px-2 py-2 font-bold">{index + 1}</td>
                            {/* TODO: reemplazar por ClubLink cuando exista */}
                            <td className="px-2 py-2 font-semibold">{row.club_name}</td>
                            <td className="px-2 py-2 text-center font-black text-blue-400">{row.points}</td>
                            <td className="px-2 py-2 text-center">{row.matches_played}</td>
                            <td className="px-2 py-2 text-center">{row.won}</td>
                            {/* TODO: confirmar nombre del campo con el back */}
                            <td className="px-2 py-2 text-center">{row.won_penalties ?? "-"}</td>
                            <td className="px-2 py-2 text-center">{row.drawn}</td>
                            <td className="px-2 py-2 text-center">{row.lost}</td>
                            <td className="px-2 py-2 text-center">{row.goals_for}</td>
                            <td className="px-2 py-2 text-center">{row.goals_against}</td>
                            <td className="px-2 py-2 text-center">
                                {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

