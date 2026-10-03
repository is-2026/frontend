export default function PlayerCard({ player , team }) {
    const bgColor = team === "home" ? "bg-blue-500" : "bg-red-500";
    return (
        <div 
            className={`absolute w-6 h-6 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 ${bgColor}`}
            style={{ 
                left: player.position.x, 
                top: player.position.y 
            }}
        ></div>
)}