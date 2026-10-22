export function scheduleSubstitution(match_id, player_out_id, player_in_id, substitution_behavior_id) {
    return request(`/matches/${match_id}/substitutions`, {
        method: "POST",
        body: JSON.stringify({ player_out_id, player_in_id, substitution_behavior_id })
    });
}

export function cancelSubstitution(match_id) {
    return request(`/matches/${match_id}/substitutions`, {method:"DELETE"});
}