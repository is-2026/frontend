import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "../components/form/form";
import { registrarUsuario } from "../services/auth";

export default function RegisterPage() {
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

    const handleRegistro = async (email, password) => {
        setApiError("");
        try {
            const response = await registrarUsuario(email, password);
        // fetch devuelve la data directa, ya no existe "response.data"
        if (response && response.token) {
            localStorage.setItem("token", response.token);
            navigate("/create-club");
            }
        } catch (error) {
        // Nuestro auth.js tira directamente el status, ya no existe "error.response"
            if (error.status === 409) {
                setApiError("Este email ya está registrado.");
            }else {
                setApiError("Ocurrió un error en el registro.");
            }
        }
    };

  return <Form onSubmit={handleRegistro} apiError={apiError} />
}