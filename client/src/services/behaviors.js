import { request } from "./api"; 

export const getBehaviors = async () => {
    const data = await request('/club/behaviors', {
        method: 'GET',
    });
    return data;
};
