const NAMES = {
    cooling_break_1: "Primera pausa de hidratación",
    halftime: "Entretiempo",
    cooling_break_2: "Segunda pausa de hidratación",
};

export function PauseBanner(pause) {
    if (!pause) return null;   // sin pausa, no se muestra nada

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <div className="bg-slate-900 border border-slate-600 px-8 py-4 text-center">
                <p className="text-xl font-bold uppercase">{NAMES[pause.type]}</p>
            </div>
        </div>
    );
}