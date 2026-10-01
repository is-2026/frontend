import { useState } from "react";

// availablePlayers: [{ id, name }]
// behaviors: [{ id, name }]
// onChange(selection): { starters: [{ player_id, behavior_id }], substitutes: [player_id] }
export default function PlayerSelection({
  availablePlayers = [],
  behaviors = [],
  onChange,
}) {
  const [starters, setStarters] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);

  function emitSelection(newStarters, newSubstitutes) {
    if (typeof onChange === "function") {
      onChange({ starters: newStarters, substitutes: newSubstitutes });
    }
  }

  function handleToggleStarter(playerId) {
    const isAlreadySelected = starters.some((s) => s.player_id === playerId);
    let newStarters;
    let newSubstitutes = substitutes;

    if (isAlreadySelected) {
      newStarters = starters.filter((s) => s.player_id !== playerId);
    } else if (starters.length < 3) {
      newStarters = [...starters, { player_id: playerId, behavior_id: "" }];
      newSubstitutes = substitutes.filter((id) => id !== playerId);
    } else {
      return;
    }

    setStarters(newStarters);
    setSubstitutes(newSubstitutes);
    emitSelection(newStarters, newSubstitutes);
  }

  function handleBehaviorChange(playerId, behaviorId) {
    const newStarters = starters.map((s) =>
      s.player_id === playerId ? { ...s, behavior_id: behaviorId } : s
    );
    setStarters(newStarters);
    emitSelection(newStarters, substitutes);
  }

  function handleToggleSubstitute(playerId) {
    const isAlreadySelected = substitutes.includes(playerId);
    let newSubstitutes;
    let newStarters = starters;

    if (isAlreadySelected) {
      newSubstitutes = substitutes.filter((id) => id !== playerId);
    } else if (substitutes.length < 3) {
      newSubstitutes = [...substitutes, playerId];
      newStarters = starters.filter((s) => s.player_id !== playerId);
    } else {
      return;
    }

    setSubstitutes(newSubstitutes);
    setStarters(newStarters);
    emitSelection(newStarters, newSubstitutes);
  }

  return (
    <div className="space-y-6">
      {/* SECCIÓN TITULARES */}
      <section>
        <h3 className="mb-2 font-semibold">
          Starters ({starters.length}/3)
        </h3>
        <ul className="space-y-2">
          {availablePlayers
            .filter((player) => !substitutes.includes(player.id))
            .map((player) => {
              const selectedStarter = starters.find(
                (s) => s.player_id === player.id
              );
              return (
                <li
                  key={player.id}
                  className="flex items-center justify-between gap-2  border border-white/10 p-2"
                >
                  <label className="flex cursor-pointer select-none items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!selectedStarter}
                      onChange={() => handleToggleStarter(player.id)}
                    />
                    <span>{player.name}</span>
                  </label>

                  {selectedStarter && (
                    <select
                      className=" border border-white/20 bg-slate-800 px-2 py-1 text-sm text-white"
                      value={selectedStarter.behavior_id}
                      onChange={(e) =>
                        handleBehaviorChange(player.id, e.target.value)
                      }
                    >
                      <option value="">Select behavior...</option>
                      {behaviors.map((behavior) => (
                        <option key={behavior.id} value={behavior.id}>
                          {behavior.name}
                        </option>
                      ))}
                    </select>
                  )}
                </li>
              );
            })}
        </ul>
      </section>

      {/* SECCIÓN SUPLENTES */}
      <section>
        <h3 className="mb-2 font-semibold">
          Substitutes ({substitutes.length}/3)
        </h3>
        <ul className="space-y-2">
          {availablePlayers
            .filter((player) => !starters.some((s) => s.player_id === player.id))
            .map((player) => (
              <li
                key={player.id}
                className="flex items-center gap-2 border border-white/10 p-2"
              >
                <label className="flex cursor-pointer select-none items-center gap-2">
                  <input
                    type="checkbox"
                    checked={substitutes.includes(player.id)}
                    onChange={() => handleToggleSubstitute(player.id)}
                  />
                  <span>{player.name}</span>
                </label>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}