const FORMATIONS = [
    { value: "TRIANGLE", label: "Triángulo" },
    { value: "OFFENSIVE_LINE", label: "Línea Ofensiva" },
    { value: "DEFENSIVE_LINE", label: "Línea Defensiva" },
];

export function FormationSelection({ value, onChange, className = "" }) {
    return (
        <div className={className}>
            <label className="block text-l font-medium mb-1 p-2">
                Formación táctica
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)} 
                className="w-full border border-white/10 bg-slate-800 p-2 text-white focus:outline-none focus:border-white/30"
            >
                {FORMATIONS.map((f) => (
                    <option key={f.value} value={f.value}>
                        {f.label}
                    </option>
                ))}
            </select>
        </div>
    );
}