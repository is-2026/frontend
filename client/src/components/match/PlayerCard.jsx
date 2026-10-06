
// Ahora recibe "left"/"top" ya calculados (en porcentaje) en vez de
// leer player.position.x/y en píxeles, y se le agregó la transición CSS para
// mantener el movimiento fluido con transition-all duration-100


export function PlayerCard({ player , team, left, top, number, name }) {
    const bgColor = team === "home" ? "bg-blue-500" : "bg-red-500";
    return (
        <div 
            data-testid={`player-${player.playerId}`}
            title={name ?? player.playerId}
            className={`absolute w-6 h-6 border-2 border-white -translate-x-1/2 -translate-y-1/2 transition-all duration-100 flex items-center justify-center text-[10px] font-bold text-white ${bgColor}`}
            style={{
                left: left, 
                top: top 
            }}
        >{number}</div>
    );
}