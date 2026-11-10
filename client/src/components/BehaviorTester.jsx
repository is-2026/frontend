import { MatchHeader } from "./match/MatchHeader";
import { Field } from "./match/Field";
import { useMatchSocket } from "../hooks/useMatchSocket";
import { GoalBanner } from "./match/GoalBanner";
import { MatchFinishedBanner } from "./match/MatchFinishedBanner";

export function BehaviorTester({ behaviorId , setTestLayout}) {
    const { teams, lineups, scores, state, goalInfo, finished} = useMatchSocket(behaviorId);

    return (
        <div className="text-white">
            <div className="relative">
                {/*cronómetro y evento partido finalizado */}
                <MatchHeader teams={teams} scores={scores} tick={finished?.tick ?? state?.tick} />

                {/*cancha */}
                <Field state={state} lineups={lineups} />

                {/*evento de gol */}
                <GoalBanner goalInfo={goalInfo} />

                {/* banner de fin de partido */}
                <MatchFinishedBanner finished={finished} teams={teams} onExit={() => setTestLayout(false)} testing={true} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setTestLayout(false)} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                    Cerrar Prueba
                </button>
            </div>
        </div>
    );
}