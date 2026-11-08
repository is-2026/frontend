import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLeagues, joinLeague } from "../services/leagues";
import { getPlayers } from "../services/club";
import { getBehaviors } from "../services/behaviors";
import { PlayerSelection } from "../components/PlayerSelection";

export function JoinLeaguePage() {
    const { leagueId } = useParams();
    const navigate = useNavigate();

    // Estados de datos
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);

    const [players, setPlayers] = useState([]);
    const [behaviors, setBehaviors] = useState([]);

    // Estados del formulario
    const [password, setPassword] = useState("");
    const [selection, setSelection] = useState({ starters: [], substitutes: [] });
    const [error, setError] = useState(null);
    const [sending, setSending] = useState(false);

    // Carga inicial de la liga, jugadores y comportamientos
    useEffect(() => {
        async function fetchData() {
            try {
                const [league, clubPlayers, clubBehaviors] = await Promise.all([
                    getLeagues(leagueId),
                    getPlayers(),
                    getBehaviors(),
                ]);

                if (!league) {
                    setNotFound(true);
                    return;
                }

                setIsPrivate(Boolean(league.is_private));
                setPlayers(clubPlayers || []);
                setBehaviors(clubBehaviors || []);
            } catch (e) {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [leagueId]);

    // Validación corregida con el nombre exacto de la propiedad (substitutes)
    const validSelection =
        selection.starters.length === 3 &&
        selection.starters.every((t) => t.behavior_id) &&
        selection.substitutes.length === 3;

    async function handleConfirm() {
        setError(null);
        setSending(true);

        try {
            const body = {
                ...(isPrivate ? { password } : {}),
                players: [
                    ...selection.starters.map((t) => ({
                        player_id: t.player_id,
                        is_starter: true,
                        behavior_id: t.behavior_id,
                    })),
                    ...selection.substitutes.map((id) => ({
                        player_id: typeof id === "object" ? id.player_id : id,
                        is_starter: false,
                    })),
                ],
            };

            await joinLeague(leagueId, body);
            navigate(`/leagues/${leagueId}/lobby`);
        } catch (e) {
            if (e.status === 400) setError(e.message || "Datos de inscripción inválidos.");
            else if (e.status === 409) setError("Tu club ya está inscripto en esta liga.");
            else setError("Ocurrió un error inesperado al unirse a la liga.");
        } finally {
            setSending(false);
        }
    }

    if (loading) {
        return <div className="p-6 text-center text-slate-300">Cargando datos de la liga...</div>;
    }

    if (notFound) {
        return (
            <div className="mx-auto max-w-sm p-6 text-center">
                <h1 className="mb-2 text-xl font-bold text-red-400">Liga no encontrada</h1>
                <button
                    onClick={() => navigate("/leagues")}
                    className="mt-4 bg-slate-800 px-4 py-2 hover:bg-slate-700"
                >
                    Volver a ver Ligas
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">Alineación para la liga</h1>
                <button
                    onClick={() => navigate("/leagues")}
                    className="text-sm text-slate-400 hover:text-white underline"
                >
                    ← Volver a ligas
                </button>
            </div>

            {/* solo en ligas privadas se pide la contraseña */}
            {isPrivate && (
                <input
                    type="password"
                    placeholder="Contraseña de la liga"
                    className="mb-4 w-full bg-slate-800 p-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            )}

            <PlayerSelection
                availablePlayers={players}
                behaviors={behaviors}
                onChange={setSelection}
            />

            {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

            <button
                className="mt-6 w-full bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-40"
                disabled={!validSelection || sending || (isPrivate && !password)}
                onClick={handleConfirm}
            >
                {sending ? "Inscribiendo..." : "Confirmar e Inscribirse"}
            </button>
        </div>
    );
}