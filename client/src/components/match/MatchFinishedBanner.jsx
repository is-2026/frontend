export function MatchFinishedBanner({ finished, onExit }) {
    if (!finished) return null;

    const home = teams?.home?.name ?? "Equipo Local";
    const away = teams?.away?.name ?? "Equipo Rival";
    const { homeScore, awayScore } = finished;

    let outcome = "Empate";
    if (homeScore > awayScore) outcome = `Ganó ${home}`;
    if (awayScore > homeScore) outcome = `Ganó ${away}`;
    
    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 backdrop-blur-sm">
            <div className="text-center p-8 bg-slate-900 border-2 border-slate-700 shadow-2xl">
                <h2 className="text-4xl font-extrabold text-amber-400 uppercase tracking-widest">
                    PARTIDO FINALIZADO
                </h2>
                <div className="mt-4 text-3xl font-bold text-white">
                    {home} {homeScore} - {awayScore} {away}
                </div>
                <p className="mt-2 text-xl text-slate-300">{outcome}</p>
                <button
                    onClick={onExit}
                    className="mt-6 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 border border-slate-600 uppercase text-sm"
                >
                    Volver a amistosos
                </button>
            </div>
        </div>
    );
}