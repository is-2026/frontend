import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMyTeamPlayers } from "../services/players";
import { getBehaviors } from "../services/behaviors";
import { joinFriendly, getFriendlyById } from "../services/friendlies";
import { PlayerSelection } from "../components/PlayerSelection";

export function JoinFriendlyPage() {
  const { friendlyId } = useParams();
  const navigate = useNavigate();

  // Estados de carga e información del partido
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [confirmedPassword, setConfirmedPassword] = useState(false);

  // Datos reales para el formulario
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [behaviors, setBehaviors] = useState([]);

  // Estados del formulario y feedback
  const [password, setPassword] = useState("");
  const [selection, setSelection] = useState({ starters: [], substitutes: [] });
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  // Carga inicial del partido y datos reales
  useEffect(() => {
    async function fetchData() {
      try {
        const [friendly, playersData, behaviorsData] = await Promise.all([
          getFriendlyById(friendlyId),
          getMyTeamPlayers(),
          getBehaviors(),
        ]);

        if (!friendly) {
          setNotFound(true);
          return;
        }

        setIsPrivate(friendly.is_private);
        setConfirmedPassword(!friendly.is_private);
        setAvailablePlayers(playersData ?? []);
        setBehaviors(behaviorsData ?? []);
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData(); 
  }, [friendlyId]);

  const validSelection =
    selection.starters.length === 3 &&
    selection.starters.every((t) => t.behavior_id) &&
    selection.substitutes.length === 3;

  // Habilita el paso a la alineación (la validación real la hace el backend en handleConfirm)
  function handlePasswordSubmit() {
    setError(null);
    setConfirmedPassword(true);
  }

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
            player_id: id,
            is_starter: false,
          })),
        ],
      };

      await joinFriendly(friendlyId, body);
      navigate(`/friendlies/${friendlyId}/lobby`);
    } catch (e) {
      if (e.status === 400 || e.status === 401) {
        if (isPrivate && e.message?.toLowerCase().includes("password")) {
          setConfirmedPassword(false);
        }
        setError(e.message || "La contraseña es incorrecta o los datos son inválidos.");
      } else if (e.status === 409) {
        setError("Tu club ya está inscripto en este amistoso.");
      } else if (e.status === 404) {
        setError("El amistoso no fue encontrado.");
      } else {
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      setSending(false);
    }
  } 

  // Cargando
  if (loading) {
    return <div className="p-6 text-center text-white">Cargando datos del partido...</div>;
  }

  // No encontrado
  if (notFound) {
    return <div className="p-6 text-center text-red-400">El amistoso no existe o fue cancelado.</div>;
  }

  // Partido privado (solicitar clave antes de mostrar alineación)
  if (isPrivate && !confirmedPassword) {
    return (
      <div className="mx-auto max-w-sm p-6 text-white">
        <h1 className="mb-4 text-xl font-bold">Amistoso privado</h1>

        <input
          type="password"
          placeholder="Contraseña"
          className="mb-3 w-full bg-slate-800 p-2 rounded border border-slate-700"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError(null);
          }}
        />

        {error && (
          <div className="mt-2 p-2 bg-red-900/40 border border-red-500/50 text-red-300 text-sm flex items-center gap-2 rounded">
            <span>{error}</span> 
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            className="w-1/2 bg-slate-800 py-2 font-medium hover:bg-slate-700 rounded"
            onClick={() => navigate("/friendlies")}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="w-1/2 bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-40 rounded"
            onClick={handlePasswordSubmit}
            disabled={!password}
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  // Selección de jugadores
  return (
    <div className="mx-auto max-w-xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Elegí tu alineación</h1>
        <button
          onClick={() => navigate("/friendlies")}
          className="text-sm text-slate-400 hover:text-white underline"
        >
          ← Volver a partidos
        </button>
      </div>

      <PlayerSelection
        availablePlayers={availablePlayers} 
        behaviors={behaviors}               
        onChange={setSelection}
      />

      {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

      <button
        className="mt-6 w-full bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-40 rounded"
        disabled={!validSelection || sending}
        onClick={handleConfirm}
      >
        {sending ? "Uniéndose..." : "Confirmar"}
      </button>
    </div>
  );
}