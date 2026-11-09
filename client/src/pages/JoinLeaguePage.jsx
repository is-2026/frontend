import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLeagues, joinLeague } from "../services/leagues";
import { getPlayers } from "../services/club";
import { getBehaviors } from "../services/behaviors";
import { PlayerSelection } from "../components/PlayerSelection";
import { FormationSelection } from "../components/FormationSelection"

export function JoinLeaguePage() {
    const { leagueId } = useParams();
    const navigate = useNavigate();

    // Estados de datos
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [confirmedPassword, setConfirmedPassword] = useState(false);

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
                setConfirmedPassword(!league.is_private);
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

    async function handlePasswordSubmit() {
        setError(null);
        try {
            const league = await getLeagues(leagueId);

            if (league?.password && password !== league.password) {
                setError("La contraseña es incorrecta.");
                return;
            }

            setConfirmedPassword(true);
        } catch (e) {
            setError("Error al verificar la contraseña.");
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

    if (isPrivate && !confirmedPassword) {
        return (
            <div className="mx-auto max-w-sm p-6">
                <h1 className="mb-4 text-xl font-bold">Liga privada</h1>

                <input
                    type="password"
                    placeholder="Contraseña de la liga"
                    className="mb-3 w-full bg-slate-800 p-2"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                    }}
                />

                {error && (
                    <div className="mt-2 mb-3 p-2 bg-red-900/40 border border-red-500/50 text-red-300 text-sm flex items-center gap-2">
                        <span>{error}</span>
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        type="button"
                        className="w-1/2 bg-slate-800 py-2 font-medium hover:bg-slate-700"
                        onClick={() => navigate("/leagues")}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="w-1/2 bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-40"
                        onClick={handlePasswordSubmit}
                        disabled={!password}
                    >
                        Continuar
                    </button>
                </div>
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

            <PlayerSelection
                availablePlayers={players}
                behaviors={behaviors}
                onChange={setSelection}
            />
            
            <FormationSelection
                value={formation} 
                onChange={setFormation} 
                className="mb-4"
            />

            {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

            <button
                className="mt-6 w-full bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-40"
                disabled={!validSelection || sending}
                onClick={handleConfirm}
            >
                {sending ? "Inscribiendo..." : "Confirmar e Inscribirse"}
            </button>
        </div>
    );
}