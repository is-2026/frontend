import { useState, useEffect } from "react";

const NAMES = {
    cooling_break_1: "Primera pausa de hidratación",
    halftime: "Entretiempo",
    cooling_break_2: "Segunda pausa de hidratación",
};




export function PauseBanner({pause}) {
    const [left, setLeft] = useState(() => {
        if (!pause?.startedAt) return 15;
        const startTime = new Date(pause.startedAt).getTime();
        const elapsedSeconds = Math.floor((Date.now() - startTime) /1000);
        //fecha actual - fecha de inicio me da milisegundos, divido por 1000 y tengo cantidad de segundos transcurridos
        const remaining = 15 - elapsedSeconds;
        return Math.max(0, remaining);
    });

    useEffect(() => {
        if (!pause) return;
        setLeft(15); //reinicia left a 15 en una nueva pausa
        
        //función para restar 1 segundo
        function deductSec(actual) {
            return Math.max(0, actual - 1);
        }

        //Se aplica el paso de un segundo a left
        function secPassed() {
            return setLeft(deductSec);
        }

        const id = setInterval(secPassed, 1000);
        return () => clearInterval(id);

    }, [pause]);

    if (!pause) return null; 
    
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <div className="bg-slate-900 border border-slate-600 px-8 py-4 text-center">
                <p className="text-xl font-bold uppercase">{NAMES[pause.type]}</p>
                <span data-testid="countdown" className="font-mono text-emerald-400 font-bold tracking-widest">
                    {left}
                </span>
            </div>
        </div>
    );
}

