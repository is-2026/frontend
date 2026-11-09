import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import 'prismjs/themes/prism-tomorrow.css'
import { useState , useEffect } from 'react'
import EditorModule from 'react-simple-code-editor'
import { createBehavior, updateBehavior, behaviorMatch } from '../services/behaviors'
import {useNavigate} from 'react-router-dom'
import { BehaviorTester } from './BehaviorTester'

const Editor = EditorModule.default || EditorModule;

// Detectar llamadas a funciones (ej: attack() o mover() sin def en prism)
Prism.languages.insertBefore('python', 'keyword', {
    'function-call': {
        pattern: /\b[a-zA-Z_]\w*(?=\s*\()/i,
        alias: 'function'
    }
});

export function BehaviorEditor({ isOpen, onClose, initialBehavior }) {
    const navigate = useNavigate()

    //form states
    const [code, setCode] = useState("")
    const [name, setName] = useState("")
    const [testLayout, setTestLayout] = useState(false)
    const [behaviorId, setbehaviorId] = useState("")

    //error handling
    const [errorName, setErrorName] = useState(null)
    const [errorResponse, setErrorResponse] = useState(null)

    // handle form for updating existing behavior
    useEffect(() => {
        if (initialBehavior) {
            setName(initialBehavior.name);
            setCode(initialBehavior.code);
        } else {
            setName("");
            setCode("");
        }
        setErrorName(null);
        setErrorResponse(null);
        setTestLayout(false);
    }, [initialBehavior, isOpen]);

    if (!isOpen) return null;

    // Validation : empty or more than 30 characters
    const isInvalid = !name || name.trim() === "" || name.length > 30;

    const handleSave = async () => {
        setErrorName(null);
        setErrorResponse(null);
        try {
            if (initialBehavior) {
                // PUT: update existing behavior
                await updateBehavior(initialBehavior.id, { name, code });
                onClose(); 
            } else {
                // POST: create new behavior
                const res = await createBehavior({ name, code });
                navigate(`/club/behaviors/${res.id}`);
                onClose();
            }
        } catch (err) {
            const status = err.status || err.response?.status;
            const message = err.message || err.response?.data?.message || "Error al guardar";
            
            if (status === 409) {
                setErrorName("El nombre del comportamiento ya existe");
            } else if (status === 400) {
                setErrorResponse(message);
            } else {
                setErrorResponse("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.");
            }
        }
    };

    const handleTestBehavior = async () => {
        try {
            setErrorResponse(null);
            const res = await behaviorMatch(code); // devuelve { match_id }
            setbehaviorId(res.match_id);
            setTestLayout(true);
        } catch (error) {
            setErrorResponse(error.message);
        }
    };

    return (
        <div>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className={`bg-slate-900 p-6 ${testLayout ? "w-11/12" : "w-1/2"}`}>
                    <div className="flex gap-6">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-white mb-4">
                                {initialBehavior ? "Editar Comportamiento" : "Editor de Comportamiento"}
                            </h2>
                            <h2 className="text-sm font-bold text-white mb-4">Nombre del Comportamiento</h2>
                            <input type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={30}
                                disabled={testLayout}
                                className="w-full rounded bg-slate-800 text-white placeholder:text-slate-500 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" 
                                placeholder="Nombre del comportamiento" />
                            {/* Error message for name validation */}
                            {errorName && <p className="text-red-500 text-xs mb-2">{errorName}</p>}
                            <Editor
                                value={code}
                                onValueChange={setCode}
                                disabled={testLayout}
                                highlight={(code) => { return Prism.highlight( code, Prism.languages.python, 'python')}}
                                padding={10}
                                preClassName="language-python"
                                className="bg-slate-800 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    fontFamily: '"Fira code", "Fira Mono", monospace',
                                    fontSize: 14,
                                }}
                                placeholder="# Escribe tu comportamiento aquí"
                            />
                            {/* Error message for backend validation */}
                            {errorResponse && <p className="text-red-500 text-xs mt-1">{errorResponse}</p>}
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={handleTestBehavior} className="bg-slate-700 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded" disabled={testLayout || !code.trim()}>
                                    Probar
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={isInvalid || testLayout}
                                    className="bg-blue-700 hover:bg-blue-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded"
                                >
                                    {initialBehavior ? "Actualizar" : "Crear"}
                                </button>
                                <button onClick={onClose} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                                    Cerrar
                                </button>
                            </div>
                        </div> 
                        {testLayout && (
                            <div className="flex-1 min-w-0">
                                <BehaviorTester behaviorId={behaviorId} setTestLayout={setTestLayout} />
                            </div>
                        )}
                    </div>
                </div>
            </div> 
        </div>
    )
}