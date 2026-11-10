import { useState, useEffect } from "react";

const NAMES = {
    cooling_break_1: "Primera pausa de hidratación",
    halftime: "Entretiempo",
    cooling_break_2: "Segunda pausa de hidratación",
};

function secondsLeft(endsAt) {
    return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
}

export function PauseBanner({ pause }) {

    //Se guarda a qué tora termina
    const endsAt = Date.parse(pause.endsAt);
    const [left, setLeft] = useState(() => secondsLeft(endsAt));

    //y se actualiza el contador cada 250ms
    //El componente se desmonta cuando pause = null
    //pause == null cuando llega mensaje matchResumed por ws 
    useEffect(() => {
        const update = () => setLeft(secondsLeft(endsAt));
        update();
        const id = setInterval(update, 250); 
        //setInterval vuelve a correr update cada un intervalo de 250ms
        return () => clearInterval(id);
        //clearInterval limpia el intervalo
    }, [endsAt]);

    if (left <= 0) return null;
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <div className="bg-slate-900 px-8 py-4 text-center">
                <p className="text-xl font-bold uppercase">{NAMES[pause.type]}</p>
                <div data-testid="countdown" className="font-mono text-emerald-400 font-bold tracking-widest">
                    {left}
                </div>
                    <p className="bg-slate-900 text-center">
                        El cambio será realizado al finalizar la pausa
                    </p>
            </div>
        </div>
    );
}