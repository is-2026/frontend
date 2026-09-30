import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { joinFriendly, getFriendlyById } from "../services/friendlies";
import PlayerSelection from "../components/PlayerSelection";

const PLAYERS_MOCK = [
  { id: "j1", name: "Jugador 1" },
  { id: "j2", name: "Jugador 2" },
  { id: "j3", name: "Jugador 3" },
  { id: "j4", name: "Jugador 4" },
  { id: "j5", name: "Jugador 5" },
  { id: "j6", name: "Jugador 6" },
];

const BEHAVIORS_MOCK = [
  { id: "ofensivo", name: "Ofensivo" },
  { id: "defensivo", name: "Defensivo" },
  { id: "equilibrado", name: "Equilibrado" },
];

export default function JoinFriendlyPage() {
  const { friendlyId } = useParams();
  const navigate = useNavigate();

  // Estados de carga e información del partido
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [confirmedPassword, setConfirmedPassword] = useState(false);

  // Estados del formulario y feedback
  const [password, setPassword] = useState("");
  const [selection, setSelection] = useState({ starters: [], substitutes: [] });
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  // Carga inicial del partido
  useEffect(() => {
    async function fetchFriendly() {
      try {
        const friendly = await getFriendlyById(friendlyId);
        if (!friendly) {
          setNotFound(true);
          return;
        }

        setIsPrivate(friendly.is_private);
        // Si NO es privado, ingresa directo (confirmedPassword = true)
        setConfirmedPassword(!friendly.is_private);
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchFriendly();
  }, [friendlyId]);

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
            player_id: id,
            is_starter: false,
          })),
        ],
      };

      await joinFriendly(friendlyId, body);
      navigate(`/friendlies/${friendlyId}/lobby`);
    } catch (e) {
      if (e.status === 400) setError(e.message);
      else if (e.status === 409) setError("Tu club ya está inscripto en este amistoso.");
      else if (e.status === 404) setError("El amistoso no fue encontrado.");
      else setError("Ocurrió un error inesperado.");
    } finally {
      setSending(false);
    }
  }
  // 1. Nueva función para validar la contraseña al hacer clic en "Continuar"
  async function handlePasswordSubmit() {
    setError(null);
    const friendly = await getFriendlyById(friendlyId);

    // Si tiene clave registrada en el mock y no coincide, no continua
    if (friendly?.password && password !== friendly.password) {
      setError("La contraseña es incorrecta.");
      return; 
    }

    // Si coincide, habilita el paso a la alineación
    setConfirmedPassword(true);
  }

  // Cargando
  if (loading) {
    return <div className="p-6 text-center">Cargando datos del partido...</div>;
  }

  // Partido privado (solicitar clave antes de mostrar alineación)
  if (isPrivate && !confirmedPassword) {
    return (
      <div className="mx-auto max-w-sm p-6">
        <h1 className="mb-4 text-xl font-bold">Amistoso privado</h1>

        <input
          type="password"
          placeholder="Contraseña"
          className="mb-3 w-full bg-slate-800 p-2 "
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError(null); // Limpia el mensaje al volver a tipear
          }}
        />

        {/*mensaje de contraseña incorrecta definido en handlePasswordSubmit*/}
        {error && (
          <div className="mt-2 p-2  bg-red-900/40 border border-red-500/50 text-red-300 text-sm flex items-center gap-2">
            <span>{error}</span> 
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            className="w-1/2  bg-slate-800 py-2 font-medium hover:bg-slate-700"
            onClick={() => navigate("/friendlies")}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="w-1/2  bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-40"
            onClick={handlePasswordSubmit} //llamada a handlePasswordSubmit al hacer click para validar
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
    <div className="mx-auto max-w-xl p-6">
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
        availablePlayers={PLAYERS_MOCK}
        behaviors={BEHAVIORS_MOCK}
        onChange={setSelection}
      />

      {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

      <button
        className="mt-6 w-full bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-40"
        disabled={!validSelection || sending}
        onClick={handleConfirm}
      >
        {sending ? "Uniéndose..." : "Confirmar"}
      </button>
    </div>
  );
}