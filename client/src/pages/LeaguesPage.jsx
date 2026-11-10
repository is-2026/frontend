import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLeagues, getMyLeagues } from "../services/leagues";
import { LeagueCard } from "../components/LeagueCard";
import { MyLeagueCard } from "../components/MyLeagueCard";

export function LeaguesPage() {
    const [tab, setTab] = useState("available");
    const [leagues, setLeagues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const fetchLeagues = async (activeTab, searchTerm) => {
        try {
            if (activeTab === "available") {
                // Consultamos tanto las ligas generales como las del usuario en paralelo
                const [allLeagues, myLeagues] = await Promise.all([
                    getLeagues(searchTerm),
                    getMyLeagues()
                ]);

                // Guardamos los IDs de "mis ligas" para excluirlas del listado
                const myLeagueIds = new Set((myLeagues || []).map((l) => String(l.id)));

                // Filtramos las ligas disponibles removiendo las que ya son del club
                const availableOnly = (allLeagues || []).filter(
                    (l) => !myLeagueIds.has(String(l.id))
                );

                setLeagues(availableOnly);
            } else {
                // Trae las ligas del club y las filtra localmente si hay búsqueda
                const data = await getMyLeagues();
                const cleanSearch = searchTerm.trim().toLowerCase();
                const filtered = cleanSearch
                    ? (data || []).filter((l) => l.name?.toLowerCase().includes(cleanSearch))
                    : (data || []);
                setLeagues(filtered);
            }
        } catch (err) {
            setError(err.message || "Error al cargar los amistosos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeagues(tab, search);
    }, [tab, search]);

    return (
        <div className="mx-auto max-w-4xl p-6 text-white">
            {/* Encabezado con Botón de Crear */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-800 pb-4">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-wider text-white">
                        {tab === "available" ? "Ligas Disponibles" : "Mis Ligas"}
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {tab === "available"
							? "Explora e inscríbete en nuevas ligas."
							: "Revisá el estado y las fechas de tus ligas."}
                    </p>
                    {/* Input de Búsqueda */}
                    <div className="mb-6">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar liga por nombre..."
                            className="w-full border border-white/10 bg-slate-800 focus:bg-slate-950 p-2 text-white focus:outline-none focus:border-white/30 transition-colors"
                        />
                    </div>
                </div>

                <Link
                    to="/leagues/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 font-bold text-sm tracking-wider uppercase transition-colors text-center"
                >
                    + Crear Liga
                </Link>
            </div>

            {/* Pestañas */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setTab("available")}
                    className={`px-4 py-2 text-sm font-bold uppercase ${
                        tab === "available" 
                        ? "bg-blue-600 text-white" 
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                >
                    Disponibles
                </button>
                <button
                    onClick={() => setTab("mine")}
                    className={`px-4 py-2 text-sm font-bold uppercase ${
                        tab === "mine" 
                        ? "bg-blue-600 text-white" 
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                >
                    Mis ligas
                </button>
            </div>

            {/* Estados de carga y error */}
            {loading && (
                <p className="text-slate-400 text-sm uppercase tracking-wider">
                    Cargando ligas...
                </p>
            )}

            {error && (
                <div className="bg-red-950 border border-red-800 text-red-200 p-4 mb-4 text-sm font-semibold uppercase">
                    {error}
                </div>
            )}

            {!loading && !error && leagues.length === 0 && (
                <div className="bg-slate-900 border border-slate-800 p-8 text-center text-slate-400">
                    {search.trim()
                        ? `No hay ligas que coincidan con «${search}»`
                        : tab === "available"
                        ? "No hay ligas disponibles."
                        : "No participás en ninguna liga."}
                </div>
            )}

            {/* Lista de tarjetas */}
            {!loading && !error && leagues.length > 0 && (
                <ul className="space-y-3">
                    {leagues.map((l) =>
                        tab === "available" ? (
                            <LeagueCard key={l.id} league={l} />
                        ) : (
                            <MyLeagueCard key={l.id} league={l} />
                        )
                    )}
                </ul>
            )}
        </div>
    );
}
