import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPlayer } from "../services/club";

const INITIAL_PACSS = {
    power: 60,
    agility: 60,
    control: 60,
    speed: 60,
    strength: 60,
};

export default function CreatePlayerPage({ onPlayerCreated }) {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [number, setNumber] = useState("");
    const [pacss, setPacss] = useState(INITIAL_PACSS);

    const [error, setError] = useState(null);
    const [sending, setSending] = useState(false);
    
    // calculamos los suma de los pacss en tiempo real.
    const totalPacss = Object.values(pacss).reduce(
        (acc, val) => acc + (Number(val) || 0),  // convertimos a val en un numero o 0 si en invalido o NaN, y lo sumamos al acumulador acc.
        0 // inicializamos el acumulador en 0.
    );

    // actualizamos un pacss especifico.
    const handlePacssChange = (key, value) => {
        setPacss((prev) => ({ // actualizamos el estado y mantenemos lo anterior.
            ...prev, // clonamos las propiedades anteriores del atributo
            [key]: Math.max(20, Math.min(100, Number(value) || 0)), // restringimos el rango del atributo min 20, max 100.
        }));
    };

    // función asíncronica que envia el formulario.
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setError(null); // reeiniciamos el estado de error

        // validación de número de camiseta 1-99.
        const num = Number(number); // Convierte el input de la camiseta a número
        if (!num || num < 1 || num > 99) { // comprueba si el número no es válido o está fuera del rango 1-99
            setError("El número de camiseta de jugador está fuera de rango (1-99)."); // setea error de camiseta
            return; 
        }

        // validación que cada atributo este dentro del rango permitido.
        const pacssValue = Object.values(pacss).map((v) => Number(v) || 0); // convierte el atributo en un numero
        const hasInvalidAtt = pacssValue.some((val) => val < 20 || val > 100); // chequeamos si el atributo esta fuera del rango 20-100
        if (hasInvalidAtt) {  
            setError("Cada atributo PACSS debe tener un valor entre (20-100)."); // seteamos el mensaje de error
            return; // cancelamos la ejecución
        }

        // validación de la suma de pacss.
        if (totalPacss !== 300) {
            setError("La suma de los PACSS debe ser igual a 300.")
            return;
        }

        setSending(true);

        try {
            const payload = {
                name: name.trim(),
                number: num,
                power: Number(pacss.power),
                agility: Number(pacss.agility),
                control: Number(pacss.control),
                speed: Number(pacss.speed),
                strength: Number(pacss.strength),
            };

            const newPlayer = await createPlayer(payload); // enviamos la petición POST mediante el servicio HTTP para crear el jugador nuevo
            
            // notificamos al componente padre si se paso la callback
            if (onPlayerCreated) { 
                onPlayerCreated(newPlayer);
            }

            navigate("/club/players") // redirigimos a la plantilla del club.
        } catch (e) {
            // capturamos los errores devueltos por el servidor HTTP
            if (e.status === 409){
                setError("El número de camiseta de jugador está en uso.");
            } else if (e.status == 400) {
                setError(
                    e.message || "El número de camiseta de jugador está fuera de rango (1-99), la suma de los PACSS no es 300, o alguno está fuera de rango (20-100)."
                );
            } else { // cualquier otro error.
                setError(e.message || "Ocurrió un error al crear el jugador.")
            }
        } finally {
            setSending(false); // desactiva el estado de envio antes cualquier escenario al finalizar
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 p-8 shadow-2xl w-full max-w-lg mx-auto">
      {/* Encabezado centrado, grande y con degradado */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Creación de Jugador
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          Ingresá los datos para registrar a un nuevo jugador
        </p>
      </div>

      {/* Mostramos el mensaje de error en pantalla */}
      {error && (
        <div className="mb-6 p-3 bg-red-900/40 border border-red-500/50 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Campo obligatorio para el nombre del Jugador */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="player_name" className="text-sm font-medium text-slate-300">
            Nombre del Jugador <span className="text-red-400">*</span>
          </label>
          <input
            id="player_name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ingrese el nombre del jugador"
            required
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Campo obligatorio para el número de Camiseta */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="player_number" className="text-sm font-medium text-slate-300">
            Número de Camiseta (1 - 99) <span className="text-red-400">*</span>
          </label>
          <input
            id="player_number"
            type="number"
            min="1"
            max="99"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Ingrese el número del jugador"
            required
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Indicador de Total PACSS */}
        <div className="p-3 bg-slate-950 border border-slate-800 flex items-center justify-between my-1">
          <span className="text-sm font-medium text-slate-300">Suma Total PACSS:</span>
          <span
            className={`text-base font-bold ${
              totalPacss === 300 ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {totalPacss} / 300 pts
          </span>
        </div>

        {/* Atributos PACSS */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Atributos PACSS (min 20 - max 100) <span className="text-red-400">*</span>
          </label>

          {[
            { key: "power", label: "Power (P)" },
            { key: "agility", label: "Agility (A)" },
            { key: "control", label: "Control (C)" },
            { key: "speed", label: "Speed (S)" },
            { key: "strength", label: "Strength (S)" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-300">{label}</span>
              <input
                type="number"
                min="20"
                max="100"
                required
                value={pacss[key]}
                onChange={(e) => handlePacssChange(key, e.target.value)}
                className="w-24 px-3.5 py-1.5 bg-slate-950 border border-slate-700 text-right text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>
          ))}
        </div>

        {/* Botón principal de envío */}
        <button
          type="submit"
          disabled={sending || totalPacss !== 300}
          className="mt-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold shadow-md transition-all duration-200"
        >
          {sending ? "Guardando Jugador..." : "Confirmar y Crear Jugador"}
        </button>

        {/* Botón/Enlace para volver */}
        <button
          type="button"
          onClick={() => navigate("/club/players")}
          className="text-xs text-slate-400 hover:text-white underline text-center mt-2"
        >
          ← Volver a plantilla
        </button>
      </form>
    </div>
  );
}