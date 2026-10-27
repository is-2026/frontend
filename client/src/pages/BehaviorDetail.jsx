import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBehaviorById, deleteBehavior } from "../services/behaviors";
import { BehaviorEditor } from "../components/BehaviorEditor";

export function BehaviorDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [behavior, setBehavior] = useState(null);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    useEffect(() => {
        getBehaviorById(id)
            .then(setBehavior)
            .catch((e) => {
                const errorMsg = e?.message || String(e);
                if (errorMsg.includes("404")) {
                    setError("El comportamiento no existe. Redirigiendo al listado...");
                    setTimeout(() => navigate("/club/behaviors"), 3000);
                } else {
                    setError("Ocurrio un error inesperado.");
                }
            });
    }, [id, navigate]);

    const handleDelete = async () => {
        const isConfirmed = window.confirm("¿Estás seguro de que querés eliminar este comportamiento? Esta acción no se puede deshacer.");
        if (!isConfirmed) return;

        try {
            setDeleteError(null);
            await deleteBehavior(id);
            navigate("/club/behaviors", { state: { successMessage: "Comportamiento eliminado con éxito." } });
        } catch (err) {
            const status = err.status || err.response?.status;
            const message = err.message || err.response?.data?.message || "Error al eliminar";
        
            if (status === 409) {
                setDeleteError(message);
            } else {
                setDeleteError("Ocurrió un error inesperado al intentar eliminar.");
            }
        }
    };

    if (error) return (
        <div className="mx-auto max-w-3xl p-6">
            <p className="text-red-400 mb-6">{error}</p>
            <button onClick={() => navigate("/club/behaviors")} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md font-semibold">
            Volver a comportamientos
            </button>
        </div>
    );
    if (!behavior) return <p className="p-6 text-slate-400">Cargando...</p>;

    return (
        <div className="mx-auto max-w-3xl p-6">
            <h1 className="mb-6 text-3xl font-bold text-white">{behavior.name}</h1>
            <code className="text-green-400 font-mono">{behavior.code}</code>
            <div className="flex gap-4">
                <button onClick={() => navigate("/club/behaviors")}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md font-semibold transition-colors"
                >
                Volver a comportamientos
                </button>

                <button onClick={() => setIsOpen(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:opacity-80 transition-opacity"
                >
                Editar comportamiento
                </button>
                <button 
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition-colors"
                >
                Eliminar
                </button>
            </div>
            {deleteError && ( <p className="text-red-400 mt-4 font-semibold">{deleteError}</p> )}
            <BehaviorEditor 
                isOpen={isOpen} 
                onClose={() => {
                    setIsOpen(false);
                    getBehaviorById(id)
                        .then(setBehavior)
                        .catch(() => setError("Error al recargar el comportamiento actualizado.")); // Refetch the behavior after closing the editor to get the latest data
                }} 
                initialBehavior={behavior} 
                />
        </div>
    );
}