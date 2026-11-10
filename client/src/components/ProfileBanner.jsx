import { useEffect, useState } from "react";
import { getClubInfo , getMyClub, DEFAULT_AVATAR } from "../services/club";

export default function ProfileBanner({ clubId}) {
    const [clubInfo, setClubInfo] = useState(null);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        try {
            if(!clubId){
                getMyClub()
                    .then((club) => getClubInfo(club.id))
                    .then((info) => setClubInfo(info))
                    .catch((e) => console.error(e.message))
                    .finally(() => setLoading(false));
                return;
            }
            getClubInfo(clubId)
                .then((info) => setClubInfo(info))
                .catch((e) => console.error(e.message))
                .finally(() => setLoading(false));
            } catch (error) {
                console.error(error.message);
            }
      }, [clubId]);

    if (loading) return <p className="text-slate-400">Cargando...</p>;
    if (!clubInfo) return <p className="text-red-400">El club no existe</p>;

    return (
        <div className="bg-slate-900 border border-slate-800 p-5 flex items-center gap-8 shadow-lg">
            <img src={clubInfo.avatar_url || DEFAULT_AVATAR} onError={(e) => { e.target.src = DEFAULT_AVATAR; }} alt={clubInfo.club_name} className="w-40 h-40 object-cover border-4 border-black" />
            <div className="flex-1 text-center">
                <h2 className="text-xl font-bold text-white">{clubInfo.club_name}</h2>
                <p className="text-slate-500 text-sm mb-4">
                    Ranking: {clubInfo.ranking_position ?? "Sin ranking"}
                </p>
                <div className="border-4 border-white p-3 grid grid-cols-8 text-white">
                    <span>Pts</span><span>PJ</span><span>PG</span><span>PG pen.</span><span>PE</span><span>PP</span><span>GF</span><span>GC</span>
                    <b>{clubInfo.points}</b><b>{clubInfo.matches_played}</b><b>{clubInfo.won}</b><b>{clubInfo.won_penalties}</b>
                    <b>{clubInfo.drawn}</b><b>{clubInfo.lost}</b><b>{clubInfo.goals_for}</b><b>{clubInfo.goals_against}</b>
                </div>
            </div>
        </div>
    );
}