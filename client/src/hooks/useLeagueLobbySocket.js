import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LEAGUE_LOBBY_WS_PATH, wsUrl } from "../config";
import { getLeagueById } from "../services/leagues";

export const useLeagueLobbySocket = (leagueId, setLeague, setError) => {
    const navigate = useNavigate();

    useEffect(() => {
        if(!leagueId) return; // verificamos que la id de la liga exista, si no paramos ejec.
        
        const socket = new WebSocket(wsUrl(LEAGUE_LOBBY_WS_PATH(leagueId))); // conectamos al backend (localhost:8000) con el token
        
        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                const { type, data } = message;

                switch (type) { // manejamos los eventos
                    case "clubRegistered": 
                        setLeague((prev) => {
                            if (!prev) return prev;
                            return {
                                ...prev, // mantenemos la info de la liga
                                registered_clubs: [ // sobreescribimos el arreglo de clubes inscriptos
                                    ...prev.registered_clubs, // mantenemos los clubes que ya estaban inscriptos en la liga
                                    { club_id: data.club_id, club_name: data.club_name }, // metemos al final el club nuevo de la liga
                                ],
                            };
                        });
                        break;

                    case "clubLeft":
                        setLeague((prev) => {
                            if (!prev) return prev;
                            return {
                                ...prev,
                                registered_clubs: prev.registered_clubs.filter( // filtramos la liga actual de clubes
                                    (c) => c.club_id !== data.club_id // conservamos los clubes con id distinta al que abandona la liga
                                ),
                            };
                        });
                        break;

                    case "leagueStarted":
                        setLeague((prev) => {
                            if(!prev) return prev;
                            return {
                                ...prev,
                                is_started: true, // cuando la liga inicie marcarmos como iniciada, en tiempo real
                                status: "started",
                            };
                        });
                        break;

                    case "leagueUpdated":
                        // algo cambio en la liga en curso, volvemos a pedir el detalle
                        getLeagueById(data.league_id)
                            .then((league) => setLeague(league))
                            .catch((err) => console.error("Error al actualizar la liga:", err));
                        break;
                    
                    case "leagueCancelled":
                        setError("La liga fue cancelada por el creador."); // guardamos el mensaje de error para mostrar al usuario
                        break;
                    
                }
            } catch (err) { // capturamos cualquier falla en la lectura del mensaje
                console.error("Error al procesar el mensaje del WebSocket:", err); // muestra mensaje de error
            }
        };

        socket.onerror = (err) => { // errores propios de la red o desconexión del ws
            console.error("Error en la conexión WebSocket:", err); // imprime el error de conexión
        };

        return () => { // se ejecuta cuando el usuario se va de la pag o cambia el id
            socket.close(); // cerramos la conexión socket activa para no dejar conexiones fantasma
        };
    }, [leagueId, navigate, setLeague, setError]); // lista de dependencias, se volvera a ejecutar si cambia alguno de estos valores
};
