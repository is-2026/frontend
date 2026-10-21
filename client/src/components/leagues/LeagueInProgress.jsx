export function LeagueInProgress({ league }) {
    const isFinished = league.status === "finished";

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 shadow-xl rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    {isFinished ? "Liga finalizada" : "Liga en curso"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    {league.name}
                </h1>
            </div>
            {/* acá van a ir NextMatchCard, LeagueFixture y StandingsTable */}
        </div>
    );
}