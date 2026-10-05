export function MatchFinishedBanner({ finished }) {
    if (!finished) return null;

    return (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/75 backdrop-blur-sm">
            <div className="text-center p-8 bg-slate-900 border-2 border-slate-700 shadow-2xl">
                <h2 className="text-4xl font-extrabold text-amber-400 uppercase tracking-widest">
                    PARTIDO FINALIZADO
                </h2>
                <div className="mt-4 text-3xl font-bold text-white">
                    {finished.homeScore} - {finished.awayScore}
                </div>
            </div>
        </div>
    );
}