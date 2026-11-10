import { Link } from "react-router-dom";
import { ClubLink } from "./ClubLink"

export function FriendlyCard({ friendly }) {
	return (
		<li className="flex items-center justify-between border border-white/10 bg-slate-800 p-4">
			<div>
				{/* Muestra el nombre del club creador */}
				<p className="font-semibold text-white">
					<ClubLink 
						name={friendly.creator_club_name} 
						id={friendly.creator_club_id}
					/>
				</p>
				<p className="text-sm text-white/60">
					{friendly.is_private ? "Privado" : "Público"}
				</p>
			</div>
			<Link
				to={`/friendlies/${friendly.id}/join`}
				className="bg-emerald-600 px-3 py-1.5 text-sm font-medium hover:bg-emerald-500"
			>
				Unirse
			</Link>
		</li>
	);
}