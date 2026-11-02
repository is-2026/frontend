import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLineup, updateLineup } from "../services/leagues";
import { getPlayers } from "../services/club";
import { getBehaviors } from "../services/behaviors";
import { PlayerSelection } from "../components/PlayerSelection";

const FORMATIONS = [
    { value: "TRIANGLE", label: "Triángulo" },
    { value: "OFFENSIVE_LINE", label: "Línea ofensiva" },
    { value: "DEFENSIVE_LINE", label: "Línea defensiva" },
];

export function LeagueLineupPage() {
    const { leagueId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    const [players, setPlayers] = useState([]);
    const [behaviors, setBehaviors] = useState([]);
    const [initialSelection, setInitialSelection] = useState(null);

    const [selection, setSelection] = useState({ starters: [], substitutes: [] });
    const [formation, setFormation] = useState("TRIANGLE");
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [sending, setSending] = useState(false);

    // carga inicial: alineación vigente, jugadores y comportamientos
    useEffect(() => {
        async function fetchData() {
            try {
                const [lineup, clubPlayers, clubBehaviors] = await Promise.all([
                    getLineup(leagueId),
                    getPlayers(),
                    getBehaviors(),
                ]);

                // el GET solo trae los ids, los nombres salen de los jugadores del club
                const convocadosId = lineup.players.map((p) => p.player_id);
                const starters = lineup.players
                    .filter((p) => p.is_starter) // separo a los jugadores titulares 
                    .map((p) => ({ player_id: p.player_id, behavior_id: p.behavior_id })); // formato que espera PlayerSelection
                const substitutes = lineup.players 
                    .filter((p) => !p.is_starter) // separo a los jugadores suplentes 
                    .map((p) => p.player_id);
                
                setPlayers(clubPlayers.filter((p) => convocadosId.includes(p.id)));
                setBehaviors(clubBehaviors || []);
                setInitialSelection({ starters, substitutes });
                setSelection({ starters, substitutes });
                setFormation(lineup.formation);
        } catch (e) {
             setLoadError(e.message || "Error al cargar la alineación.");
         } finally {
             setLoading(false);
         }
     }
     fetchData();
 }, [leagueId]);;

    // 3 titulares con comportamiento y 3 suplentes
    const validSelection =
        selection.starters.length === 3 &&
        selection.starters.every((s) => s.behavior_id) &&
        selection.substitutes.length === 3;
    
    async function handleSave() {
        setError(null);
        setMessage(null);
        setSending(true);

        try {
            const body = {
                formation,
                players: [
                    ...selection.starters.map((s) => ({
                        player_id: s.player_id,
                        is_starter: true,
                        behavior_id: s.behavior_id,
                    })),
                    ...selection.substitutes.map((id) => ({
                        player_id: id,
                        is_starter: false,
                    })),
                ],
            };

            await updateLineup(leagueId, body);
            setMessage("Rige desde el próximo partido");
        } catch (e) {
            if ([400, 403, 409].includes(e.status)) {
                setError(e.message || "No se pudo guardar la alineación.");
            } else {
                setError("Ocurrió un error inesperado al guardar la alineación.");
            }
        } finally {
            setSending(false);
        }
    }

    if (loading) {
        return <div className="p-6 text-center text-slate-300">Cargando alineación...</div>;
    }
    if (loadError) {
        return (
            <div className="mx-auto max-w-sm p-6 text-center">
                <p className="text-red-400 font-semibold">{loadError}</p>
                <button
                    onClick={() => navigate(`/leagues/${leagueId}/lobby`)}
                    className="mt-4 bg-slate-800 px-4 py-2 hover:bg-slate-700"
                >
                    Volver a la liga
                </button>
            </div>
        );    
    }

    return (
        <div className="mx-auto max-w-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">Mi alineación</h1>
                <button
                    onClick={() => navigate(`/leagues/${leagueId}/lobby`)}
                    className="text-sm text-slate-400 hover:text-white underline"
                >
                    ← Volver a la liga
                </button>
            </div>

            <label className="block mb-4 text-sm">
                Formación
                <select
                    className="mt-1 w-full bg-slate-800 p-2"
                    value={formation}
                    onChange={(e) => setFormation(e.target.value)}
                >
                    {FORMATIONS.map((f) => (
                        <option key={f.value} value={f.value}>
                            {f.label}
                        </option>
                    ))}
                </select>
            </label>

            <PlayerSelection
                availablePlayers={players}
                behaviors={behaviors}
                initialSelection={initialSelection}
                onChange={setSelection}
            />

            {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
            {message && <p className="mt-4 text-emerald-400 text-sm">{message}</p>}

            <button
                className="mt-6 w-full bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-40"
                disabled={!validSelection || sending}
                onClick={handleSave}
            >
                {sending ? "Guardando..." : "Guardar"}
            </button>
        </div>
    );
}