import { useState, useEffect } from "react";

const NAMES = {
cooling_break_1: "Primera pausa de hidratación",
halftime: "Entretiempo",
cooling_break_2: "Segunda pausa de hidratación",
};

const PAUSE_SECONDS = 15;

export function PauseBanner({pause}) {
const [left, setLeft] = useState(PAUSE_SECONDS);

useEffect(() => {
if (!pause) return;

const end = Date.now() + PAUSE_SECONDS * 1000; // fin calculado con el reloj local

function update() {
setLeft(Math.max(0, Math.ceil((end - Date.now()) / 1000)));
    }
update();

const id = setInterval(update, 250);
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