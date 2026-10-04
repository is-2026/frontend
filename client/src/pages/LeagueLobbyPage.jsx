import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getLeague } from "../services/league";

export function LeagueLobbyPage() {
    const { leagueId } = useParams();
    const navigate = useNavigate();
    
    const [ league, setLeague ] =  useState(null);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);

    // carga inicial via HTTP GET 
    useEffect(() => {
        const fetchLeague = async () => {
            try {
                setLoading(true);
                const data = await getLeague(leagueId);
                setLeague(data);
            } catch (err) {
                setError(err.message || "Error al cargar la liga.");
            } finally {
                setLoading(false);
            }
        };

        fetchLeague(); 
    }, [leagueId]);

}