import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { joinFriendly } from "../services/friendlies";
import PlayerSelection from "../components/PlayerSelection";

// TODO: reemplazar por los jugadores reales del club del usuario logueado.
// Todavía no hay un endpoint definido para esto en la documentación provista.
const PLAYERS_MOCK = [
  { id: "j1", name: "Jugador 1" },
  { id: "j2", name: "Jugador 2" },
  { id: "j3", name: "Jugador 3" },
  { id: "j4", name: "Jugador 4" },
  { id: "j5", name: "Jugador 5" },
  { id: "j6", name: "Jugador 6" },
];

// TODO: confirmar los IDs reales de comportamiento contra el backend.
const BEHAVIORS_MOCK = [
  { id: "ofensivo", name: "Ofensivo" },
  { id: "defensivo", name: "Defensivo" },
  { id: "equilibrado", name: "Equilibrado" },
];

// TODO: confirmar cómo se sabe si el amistoso es privado en esta pantalla
// (por ejemplo, si viene por parámetro desde el listado, o hay que consultarlo).
export default function JoinFriendlyPage({ isPrivate = false }) {
  const { friendlyId } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState(!isPrivate);
  const [selection, setSelection] = useState({ starters: [], substitutes: [] });
  const [error, setError] = useState(null);
  const [Sending, setSending] = useState(false);

  const validSelection =
    selection.starters.length === 3 &&
    selection.starters.every((t) => t.behavior_id) &&
    selection.substitutes.length === 3;

  async function confirmationHandle() {
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

  if (isPrivate && !confirmedPassword) {
    return (
      <div className="mx-auto max-w-sm p-6">
        <h1 className="mb-4 text-xl font-bold">Amistoso privado</h1>
        <input
          type="password"
          placeholder="Contraseña"
          className="mb-3 w-full bg-slate-800 p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-40"
          onClick={() => setConfirmedPassword(true)}
          disabled={!password}
        >
          Continuar
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-xl font-bold">Elegí tu alineación</h1>

      <PlayerSelection
        availablePlayers={PLAYERS_MOCK}
        behaviors={BEHAVIORS_MOCK}
        onChange={setSelection}
      />

      {error && <p className="mt-4 text-red-400">{error}</p>}

      <button
        className="mt-6 w-full rounded bg-emerald-600 py-2 font-medium hover:bg-emerald-500 disabled:opacity-40"
        disabled={!validSelection || Sending}
        onClick={confirmationHandle}
      >
        {Sending ? "Uniéndose..." : "Confirmar"}
      </button>
    </div>
  );
}
