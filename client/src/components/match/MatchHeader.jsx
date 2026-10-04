export function MatchHeader({scores}) {
    return (
        <div className="flex justify-between items-center bg-slate-900 border border-slate-700 p-4 rounded-t-lg mb-4">
            <div className="flex items-center gap-4">
                <span className="font-bold text-xl text-blue-400">Equipo Local</span>
                <span className="text-3xl font-black bg-slate-800 px-4 py-1 rounded">{scores?.home ?? 0}</span>
            </div>
                    
            <div className="text-2xl font-mono text-emerald-400 font-bold tracking-widest bg-slate-950 px-6 py-2 rounded-lg border border-slate-800">
                00:00
            </div>
                    
            <div className="flex items-center gap-4">
                <span className="text-3xl font-black bg-slate-800 px-4 py-1 rounded">{scores?.away ?? 0}</span>
                <span className="font-bold text-xl text-red-400">Equipo Rival</span>
            </div>
        </div>
    )
}