import { useState } from "react";

interface SearchProps {
    onSubmit: (email: string, password: string) => void;
    apiError: string;
}

export default function Form({ onSubmit, apiError }: SearchProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const regexEmail =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
    const regexPassword = /^.{5,}$/;

    const manejarEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        if (value.trim() === "") setEmailError("El correo es obligatorio.");
        else if (!regexEmail.test(value))
            setEmailError("El formato de email no es válido.");
        else setEmailError("");
    };

    const manejarPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        if (value.trim() === "")
            setPasswordError("La contraseña es obligatoria.");
        else if (!regexPassword.test(value))
            setPasswordError("La contraseña debe tener al menos 5 caracteres.");
        else setPasswordError("");
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const emailValido = regexEmail.test(email);
        const passwordValida = regexPassword.test(password);

        if (!emailValido) setEmailError("Por favor, escribe un correo válido.");
        if (!passwordValida)
            setPasswordError("La contraseña debe tener al menos 5 caracteres.");

        if (!emailValido || !passwordValida) return;

        onSubmit(email, password);
    };

    const botonDeshabilitado =
        email.trim() === "" ||
        password.trim() === "" ||
        emailError !== "" ||
        passwordError !== "";
    const errorVisibleEmail = apiError || emailError;

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full max-w-sm mx-auto bg-[#0b1120] p-6 rounded-lg"
        >
            <div className="text-4xl font-black text-[#a5b4fc] mb-6 text-center w-full">
                Register
            </div>

            <div className="flex flex-col mb-4 w-full">
                <h1 className="text-sm font-bold text-slate-200 mb-1">
                    Email <span className="text-red-500 ml-1">*</span>
                </h1>
                <input
                    name="Email"
                    type="email"
                    value={email}
                    onChange={manejarEmail}
                    placeholder="Email"
                    className="w-full bg-[#050b14] border border-slate-700 text-slate-200 placeholder-slate-600 p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <p
                    className={`text-red-500 min-h-[24px] mt-1 text-sm ${errorVisibleEmail ? "visible" : "invisible"}`}
                >
                    {errorVisibleEmail || " "}
                </p>
            </div>

            <div className="flex flex-col mb-4 w-full">
                <h1 className="text-sm font-bold text-slate-200 mb-1">
                    Password <span className="text-red-500 ml-1">*</span>
                </h1>
                <input
                    name="Password"
                    type="password"
                    value={password}
                    onChange={manejarPassword}
                    placeholder="Password"
                    className="w-full bg-[#050b14] border border-slate-700 text-slate-200 placeholder-slate-600 p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <p
                    className={`text-red-500 min-h-[24px] mt-1 text-sm ${passwordError ? "visible" : "invisible"}`}
                >
                    {passwordError || " "}
                </p>
            </div>

            <button
                type="submit"
                disabled={botonDeshabilitado}
                className="w-full bg-[#1e3a8a] text-slate-300 font-bold py-3 mt-2 hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
                Register
            </button>

            <div className="text-slate-400 p-2 mt-2 text-center w-full cursor-pointer hover:text-white">
                Iniciar Sesión
            </div>
        </form>
    );
}
