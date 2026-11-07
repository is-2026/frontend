import { useNavigate } from "react-router-dom";

export function BehaviorCard({ behavior, onDelete }) {
  const navigate = useNavigate();

  return (
    <li onClick={() => navigate(`/club/behaviors/${behavior.id}`)}
      className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col h-full shadow-lg transition-all hover:border-slate-700 hover:cursor-pointer hover:bg-slate-800/60">
      <h2 className="text-xl font-bold text-indigo-400 mb-3 truncate" title={behavior.name}>
        {behavior.name}
      </h2>

      {/* Contenedor flexible, restringe altura y permite scroll */}
      <div className="bg-slate-950 p-3 rounded-md border border-slate-700/50 flex-grow overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-slate-700">
        <code className="text-sm text-green-400 font-mono whitespace-pre-wrap break-words">
          {behavior.code}
        </code>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDelete(behavior.id); }} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition-colors">
        Eliminar
      </button>
    </li>
  );
}