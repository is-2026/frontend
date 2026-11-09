export function MatchFinishedBanner({ finished, teams, onExit }) {
    if (!finished) return null;

    const home = teams?.home?.name;
    const away = teams?.away?.name;
    const { 
        homeScore, awayScore, 
        homePenalties, awayPenalties,
        winnerClubId 
    } = finished;

    const byPenalties = (homePenalties != null && awayPenalties != null);
    const winner = teams?.home?.id == winnerClubId ? home : away;
    let outcome;
    let scores;
    if(byPenalties) {

        outcome = `Ganó ${winner} por penales`
        scores = `${home} ${homePenalties} - ${awayPenalties} ${away}`
    } else if (homeScore == awayScore){
        outcome = `Empate`;
        scores = `${home} ${homeScore} - ${awayScore} ${away}`
    } else {
        outcome = `Ganó ${winner}`;
        scores = `${home} ${homeScore} - ${awayScore} ${away}`
    }
    
    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
            <div className="text-center p-8 bg-slate-900 shadow-2xl">
                <h2 className="text-4xl font-extrabold text-amber-400 uppercase tracking-widest">
                    PARTIDO FINALIZADO
                </h2>
                <div className="mt-4 text-3xl font-bold text-white">
                    {scores}
                </div>
                <p className="mt-2 text-xl text-slate-300">{outcome}</p>
                <button
                    onClick={onExit}
                    className="mt-6 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 uppercase text-sm"
                >
                    Volver a amistosos
                </button>
            </div>
        </div>
    );
}