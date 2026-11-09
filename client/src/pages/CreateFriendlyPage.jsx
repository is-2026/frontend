import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createFriendlies } from "../services/friendlies";
import { getPlayers } from "../services/club";
import { getBehaviors } from "../services/behaviors";
import { PlayerSelection } from "../components/PlayerSelection";
import { FormationSelection } from "../components/FormationSelection"

export function CreateFriendlyPage() {
	const navigate = useNavigate();

	// estados del formulario, duración, pass y jugadores tit. y sup.
	const [password, setPassword] = useState("");
	const [selection, setSelection] = useState({ starters: [], substitutes: [] });

	// estados de los datos
	const [players, setPlayers] = useState([]);
	const [behaviors, setBehaviors] = useState([]);
	const [loadingData, setLoadingData] = useState(true);
	const [formation, setFormation] = useState("TRIANGLE");

	// estados de UI / feedback
	const [error, setError] = useState(null);
	const [sending, setSending] = useState(false);

	// carga inicial de datos de información
	useEffect(() => {
		async function loadFormData() {
			try {
				setLoadingData(true);
				const [playersData, behaviorsData] = await Promise.all([
					getPlayers(),
					getBehaviors(),
				]);
				setPlayers(playersData || []);
				setBehaviors(behaviorsData || []);
			} catch {
				setError("Error al cargar los jugadores y comportamientos de tu club.");
			} finally {
				setLoadingData(false);
			}
		}

		loadFormData();
	}, []);

	// validación 3 titulares y suplentes con comportamiento asignado
	const validSelection =
		selection.starters.length === 3 &&
		selection.starters.every((s) => s.behavior_id && s.behavior_id !== "") &&
		selection.substitutes.length === 3;

	async function handleSubmit(e) {
		e.preventDefault();
		if (!validSelection || sending) return;

		setError(null);
		setSending(true);

		try {
			const payload = {
				formation,
				...(password.trim() ? { password: password.trim() } : {}),
				match_duration_minutes: 5,
				players: [
					...selection.starters.map((starter) => ({
						player_id: starter.player_id,
						is_starter: true,
						behavior_id: starter.behavior_id,
					})),
					...selection.substitutes.map((subId) => ({
						player_id: subId,
						is_starter: false,
					})),
				],
			};

			const newFriendly = await createFriendlies(payload);

			if (newFriendly?.id) {
				navigate(`/friendlies/${newFriendly.id}/lobby`);
			} else {
				navigate("/friendlies");
			}
		} catch (e) {
			if (e.status === 400 || e.response?.status === 400) {
				setError(
					e.message || "Error en la solicitud. Asegúrate de haber seleccionado 3 titulares con comportamiento y 3 suplentes."
				);
			} else {
				setError(
					e.message || "Ocurrió un error inesperado al crear el amistoso."
				);
			}
		} finally {
			setSending(false);
		}
	}

	if (loadingData) {
		return <div className="p-6 text-center text-slate-300">Cargando datos...</div>;
	}

	return (
		<div className="mx-auto max-w-xl p-6">
			{/* Encabezado */}
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Crear partido amistoso</h1>
				<button
					type="button"
					onClick={() => navigate("/friendlies")}
					className="text-sm text-white/60 hover:text-white underline"
				>
					← Volver a amistosos
				</button>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">


				{/* Contraseña */}
				<div>
					<label className="block text-sm font-medium mb-1">
						Contraseña (Opcional)
					</label>
					<p className="text-xs text-white/60 mb-2">
						Si ingresas una contraseña, el amistoso será privado.
					</p>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full border border-white/10 bg-slate-800 p-2 text-white focus:outline-none focus:border-white/30"
						placeholder="Dejar en blanco para amistoso público"
					/>
				</div>

				{/* Selección de formación */}
				<FormationSelection
					value={formation}
					onChange={setFormation}
					className="mb-4"
				/>

				{/* Selección de Jugadores */}
				<div className="border-t border-white/10 pt-4">
					<PlayerSelection
						availablePlayers={players}
						behaviors={behaviors}
						onChange={setSelection}
					/>
				</div>

				{/* Mensaje de Error */}
				{error && (
					<div className="p-3 bg-red-900/40 border border-red-500/50 text-red-300 text-sm">
						{error}
					</div>
				)}

				{/* Botón Guardar */}
				<button
					type="submit"
					disabled={!validSelection || sending}
					className="w-full bg-emerald-600 px-4 py-2.5 font-medium hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
				>
					{sending ? "Creando Amistoso..." : "Confirmar y Crear Amistoso"}
				</button>
			</form>
		</div>
	);
}