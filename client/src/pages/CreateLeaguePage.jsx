import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createLeagues } from "../services/leagues";
import { getPlayers } from "../services/club";
import { getBehaviors } from "../services/behaviors";
import {PlayerSelection} from "../components/PlayerSelection";

export function CreateLeaguePage() {
    const navigate = useNavigate();

    // estados del formulario, duración, pass y jugadores tit. y sup.
    const [duration, setDuration] = useState(5);
    const [maxClubs, setMaxClubs] = useState(8);
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [allowDraws, setAllowDraws] = useState(true);
    const [selection, setSelection] = useState({ starters: [], substitutes: []});
    
    // estados de los datos
    const [players, setPlayers] = useState([]);
    const [behaviors, setBehaviors] = useState([]);
    const [loadingData, setLoadingData] = useState(true);   
    
    // estados de UI / feedback
    const [error, setError] = useState(null);
    const [sending, setSending] = useState(false);

    // carga inicial de datos de información
    useEffect(() => {
        async function loadFormData() {
            try {
                setLoadingData(true);
                const[playersData, behaviorsData] = await Promise.all([
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

    const isFormValid = validSelection && name.trim() !== "" && maxClubs >= 3 && maxClubs <= 30 && duration >= 1 && duration <= 90;
    
    async function handleSubmit(e) {
        e.preventDefault();
        if(!isFormValid || sending) return;

        setError(null);
        setSending(true);

        try {
            const payload = {
                name: name.trim(),
                ...(password.trim() ? { password: password.trim() } : {}),
                max_clubs: Number(maxClubs),
                match_duration_minutes: 5,
                allows_draws: allowDraws,
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

            const newLeague = await createLeagues(payload);

            if (newLeague?.id) {
                navigate(`/leagues/${newLeague.id}/lobby`);
            } else {
                navigate("/leagues");
            }
        } catch (e) {
            if (e.status === 400 || e.response?.status === 400) {
                setError (
                    e.message || "Error en la solicitud. Asegúrate de haber seleccionado 3 titulares con comportamiento y 3 suplentes."
                );
            } else {
                setError(
                    e.message || "Ocurrió un error inesperado al crear la liga."
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
        <h1 className="text-2xl font-bold">Crear liga</h1>
        <button
          type="button"
          onClick={() => navigate("/leagues")}
          className="text-sm text-white/60 hover:text-white underline"
        >
          ← Volver a las ligas
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Nombre */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Nombre de la liga
          </label>
          <input
            type="text"
            id="name"   
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-white/10 bg-slate-800 p-2 text-white focus:outline-none focus:border-white/30"
            placeholder="Nombre de la liga"
            required
            />
        </div>


        {/* Duración */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Duración del partido (minutos)
          </label>
          <input
            type="text"
            value="5 minutos"
            disabled
            readOnly
            className="w-full border border-white/10 bg-slate-900/60 p-2 text-white/50 cursor-not-allowed select-none"
          />
        </div>

        {/* Contraseña */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Contraseña (Opcional)
          </label>
          <p className="text-xs text-white/60 mb-2">
            Si ingresas una contraseña, la liga será privada.
          </p>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-white/10 bg-slate-800 p-2 text-white focus:outline-none focus:border-white/30"
            placeholder="Dejar en blanco para liga pública"
          />
        </div>

        {/* Cantidad maxima de clubs */}
        <div>
          <label htmlFor="maxClubs" className="block text-sm font-medium mb-1">
            Cantidad máxima de clubs
          </label>
          <input
            type="number"
            id="maxClubs"
            min="3"
            max="30"
            value={maxClubs}
            onChange={(e) => setMaxClubs(e.target.value)}
            className="w-full border border-white/10 bg-slate-800 p-2 text-white focus:outline-none focus:border-white/30"
            placeholder="Ej: 10"
            required
          />
        </div>

        {/* Sin empates */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="noDraws"
            checked={!allowDraws}
            onChange={(e) => setAllowDraws(!e.target.checked)}
          />
          <label htmlFor="noDraws" className="text-sm font-medium">
            Sin empates
          </label>
        </div>

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
          disabled={!isFormValid || sending}
          className="w-full bg-emerald-600 px-4 py-2.5 font-medium hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sending ? "Creando Liga..." : "Confirmar y Crear Liga"}
        </button>
      </form>
    </div>
  );
}