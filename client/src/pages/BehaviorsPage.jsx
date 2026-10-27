import { useEffect, useState } from "react";
import { getBehaviors } from "../services/behaviors";
import { BehaviorCard } from "../components/BehaviorsCard";
import { BehaviorEditor } from "../components/BehaviorEditor";
import { useLocation } from "react-router-dom";

export function BehaviorsPage() {
  const [behaviors, setBehaviors] = useState([]); // Acá se guarda la lista de comportamientos disponibles
  const [loading, setLoading] = useState(true);     // Inicia en true para mostrar msj cargando
  const [error, setError] = useState(null);         // Acá se guarda el mensaje de error
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar la apertura del modal
  const location = useLocation();
  const successMessage = location.state?.successMessage; //manejo de estado de éxito al eliminar un comportamiento

  useEffect(() => {
    getBehaviors()
      .then(setBehaviors) // Guarda los comportamientos disponibles
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleClick = () => {
    console.log("BotónCrear Comportamiento");
    setIsOpen(true); // Abre el editor de comportamiento
  }

  const handleClose = () => {
    setIsOpen(false); // Cierra el editor de comportamiento
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Comportamientos </h1>
          <button onClick={handleClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Crear Comportamiento +
          </button>
        </div>
        <BehaviorEditor isOpen={isOpen} onClose={handleClose} />

        {loading && <p className="text-slate-400">Cargando...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {successMessage && (
            <div className="mb-4 p-3 bg-green-800 text-green-100 rounded-md">
                {successMessage}
            </div>
        )}
        {!loading && !error && behaviors.length === 0 && (
            <p className="text-white/60">No se encontraron comportamientos.</p>
        )}
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {behaviors.map((b) => (
            <BehaviorCard key={b.id} behavior={b} />
        ))}
        </ul>
    </div>
  );
}
