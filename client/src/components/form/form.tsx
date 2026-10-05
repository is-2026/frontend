import { useState } from "react";
import { Link } from "react-router-dom";

interface SearchProps {
  onSubmit: (email: string, password: string) => void;
  apiError: string;
}

export default function Form({ onSubmit, apiError }: SearchProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
  const regexPassword = /^.{5,}$/;

  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value.trim() === '') setEmailError('El correo es obligatorio.');
    else if (!regexEmail.test(value)) setEmailError('El formato de email no es válido.');
    else setEmailError('');
  };

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value.trim() === '') setPasswordError('La contraseña es obligatoria.');
    else if (!regexPassword.test(value)) setPasswordError('La contraseña debe tener al menos 5 caracteres.');
    else setPasswordError('');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validEmail = regexEmail.test(email);
    const validPassword = regexPassword.test(password);

    if (!validEmail) setEmailError('Por favor, escribe un correo válido.');
    if (!validPassword) setPasswordError('La contraseña debe tener al menos 5 caracteres.');

    if (!validEmail || !validPassword) return;
    
    onSubmit(email, password);
  };

  const disableButton = email.trim() === '' || password.trim() === '' || emailError !== '' || passwordError !== '';
  const errorVisibleEmail = apiError || emailError;

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 shadow-2xl w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Registrar Usuario
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          ¡Completá tus datos para crear una nueva cuenta!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-300">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            id="email"
            name="Email"
            type="email"
            value={email}
            onChange={handleEmail}
            placeholder="ejemplo@correo.com"
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
          <p className={`text-red-500 min-h-[20px] text-xs mt-1 ${errorVisibleEmail ? 'visible' : 'invisible'}`}>
            {errorVisibleEmail || ' '}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-slate-300">
            Contraseña (Al menos 5 caracteres) <span className="text-red-400">*</span>
          </label>
          <input
            id="password"
            name="Password"
            type="password"
            value={password}
            onChange={handlePassword}
            placeholder="•••••"
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
          <p className={`text-red-500 min-h-[20px] text-xs mt-1 ${passwordError ? 'visible' : 'invisible'}`}>
            {passwordError || ' '}
          </p>
        </div>

        <button
          type="submit"
          disabled={disableButton}
          className="mt-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold shadow-md transition-all duration-200 text-sm"
        >
          Registrar Usuario
        </button>
        
        <Link
          to="/login"
          className="mt-4 text-center text-sm font-bold tracking-wider text-slate-400 hover:text-white transition-colors block py-2"
        >
          Iniciar Sesión
        </Link>
      </form>
    </div>
  );
}