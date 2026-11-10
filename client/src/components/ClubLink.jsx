import { Link } from "react-router-dom";

export function ClubLink({ name, id }) {
    if (!name) return <span className="text-slate-400">Sin club</span>;

    // Si recibe ID navega al perfil del club, de lo contrario muestra el texto
    return id ? (
        <Link 
            to={`/club/${id}`} 
            className="text-emerald-400 hover:underline font-medium"
        >
            {name}
        </Link>
    ) : (
        <span className="font-medium text-white">{name}</span>
    );
}