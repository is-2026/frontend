import { formatMatchTime } from "./utils/utils";

export function MatchHeader({ teams, scores, tick = 0 }) {
    return (
        <div className="flex justify-between items-center bg-slate-900 mb-4">
            <div className="flex items-center gap-4">
                <span className="font-bold text-xl text-blue-400">
                    {teams?.home?.name ?? "Equipo Local"}
                </span>
                <span className="text-3xl font-black bg-slate-800 px-4 py-1">{scores?.home ?? 0}</span>
            </div>

            {/* Cronómetro */}
            <div className="text-2xl font-mono text-emerald-400 font-bold tracking-widest bg-slate-950 px-6 py-2">
                {formatMatchTime(tick)}
            </div>

            <div className="flex items-center gap-4">
                <span className="text-3xl font-black bg-slate-800 px-4 py-1">{scores?.away ?? 0}</span>
                <span className="font-bold text-xl text-red-400">
                    {teams?.away?.name ?? "Equipo Rival"}
                </span>
            </div>
        </div>
    );
}