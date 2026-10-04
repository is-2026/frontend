import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/auth";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Si el email esta vacio o la password tiene menos de 5 caracteres, entotnces el botón esta deshabilitado.
    const isButtonDisabled = !email.trim() || password.length < 5 || loading;
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // borramos los carteles de errores que hayan ocurrido antes.
        setLoading(true);

        if (password.length < 5) {
            setError('La contraseña debe tener al menos 5 caracteres.');
        return;
        }

        try {
          await loginUser({ email, password});
          navigate('/friendlies') // pongo '/' ya que todavia no definimos un main page  
        } catch (err) {
            setError(err.message || 'email o contraseña incorrectos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 p-8 shadow-2xl w-full">
         <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
             Iniciar Sesión
            </h2>
         <p className="text-slate-400 text-sm mt-2">
             ¡Ingresá tu Email y Contraseña para acceder a tu cuenta!
            </p>
        </div>

        {/* Mostramos el mensaje de error en pantalla */}
        {error && <div className="error-message" style={{ color: "red" }}>{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">    
            {/* Campo obligatorio para el Correo Electrónico */}
            <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email <span className="text-red-400">*</span>
            </label>
            <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            </div>

            {/* Campo obligatorio para la Contraseña */}
            <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate-300">
                Contraseña (Al menos 5 carcacteres) <span className="text-red-400">*</span>
            </label>
            <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            </div>

            <button
            type="submit"
            disabled={isButtonDisabled}
            className="mt-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold shadow-md transition-all duration-200"
            >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>

            <Link
                to="/register"
                className="mt-4 text-center text-ms font-bold tracking-wider text-slate-400 hover:text-white transition-colors block py-2"
            >
            Registrar Usuario
            </Link>
        </form>
    </div>
  );
}