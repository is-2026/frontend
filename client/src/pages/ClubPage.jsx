import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClub } from "../services/club";


export function ClubPage() {
    const [clubName, setClubName] = useState("");
    const [avatar, setAvatar] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    const navigate = useNavigate();

    // Si el nombre esta vacio o  si esta cargandose, el botón estará deshabilitado.
   const isButtonDisabled = !clubName.trim() || loading;

   const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError(""); // borra carteles de errores anteriores.
    
    if(avatar && !avatar.endsWith('.png')) {
        setError("La URL del avatar debe terminar en (.png)");
        return;
    }

    setLoading(true);

    try {
        // peticion HTTP al backend
        await createClub({
            club_name: clubName,
            avatar_url: avatar,
        });
        // Muestra el mensaje de éxito y redirección
        setLoading(false);
        setIsRedirecting(true);

         // Espera 1.5 segundos para que el usuario lea el mensaje y luego navega
        setTimeout(() => {
        navigate("/club");
        }, 1500);
    } catch (err) {
        // Capturamos el error 409 si el club ya esta creado.
        if (err.status === 409){
            setError(err.message || "El usuario ya tiene un club creado.");
        } else {
            setError(err.message || "Ocurrió un error al intentar crear el club.");
        }
    } finally {
        setLoading(false);
    }
   };

   // pantalla de redirección a crear juagadores.
   if (isRedirecting) {
    return (
        <div className="bg-slate-900 border border-slate-800 p-8 shadow-2xl w-full text-center flex flex-col items-center justify-center gap-4">
            {/* Spinner animado */}
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-2xl font-bold text-emerald-400">
            ¡Club Creado con Éxito!
            </h2>
            <p className="text-slate-300 text-sm">
            Redirigiendo a la creación de jugadores...
            </p>
        </div>
        );
    }

   return (
    <div className="bg-slate-900 border border-slate-800 p-8 shadow-2xl w-full">
        {/* Encabezado centrado, grande y con degradado */}
        <div className="text-center mb-8">
         <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        Creación de Club
         </h2>
          <p className="text-slate-400 text-sm mt-2">
           ¡Ingresá los datos para registrar a tu equipo!
          </p>
         </div>
         {/* Mostramos el mensaje de error en pantalla */}
        {error && <div className="error-message" style={{ color: "red" }}>{error} </div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Campo obligatorio para el nombre del Club*/}
            <div className="flex flex-col gap-1.5">
                <label htmlFor="club_name" className="text-sm font-medium text-slate-300">
                    Nombre del Club <span className="text-red-400">*</span> 
                </label>
                <input
                    id="club_name"
                    type="text"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    placeholder="Ingrese el nombre de su Club."
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
            </div>
        
        <div className="flex flex-col gap-1.5">
            {/* Campo opcional para el avatar del Club*/}
            <label htmlFor="avatar_url" className="text-sm font-medium text-slate-300">
                URL del Avatar <span className="text-slate-500 text-xs">(Opcional)</span>
            </label>
            <input
                id="avatar_url"
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://ejemploavatar.com/avatar.png"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
        </div>

        <button
          type="submit"
          disabled={isButtonDisabled}
          className="mt-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold shadow-md transition-all duration-200"
        >
          {loading ? "Creando club..." : "Confirmar y Crear Club"}
        </button>
        </form> 
    </div>
   );
}