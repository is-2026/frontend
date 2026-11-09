import { request } from "./api"; 


export const getBehaviors = async () => {
    const data = await request('/club/behaviors', {
        method: 'GET',
    });
    return data;
};


/* MOCK para ver funcionamiento de crear amistoso 

export const getBehaviors = async () => {
  return [
    { id: "b1", name: "Ofensivo" },
    { id: "b2", name: "Defensivo" },
    { id: "b3", name: "Equilibrado" },
    { id: "b4", name: "Presión Alta" },
  ];
};
*/

export const getBehaviorById = async (id) => {
    return await request(`/club/behaviors/${id}`, { 
        method: 'GET' 
    });
};


/* export const getBehaviorById = async (id) => {
    // MOCK: Simula la base de datos para probar estilos y funcionalidad 
    const mockDb = {
        "1": { id: "1", name: "Comportamiento Defensivo", code: "defend()" },
        "2": { id: "2", name: "Comportamiento Ofensivo", code: "attack()" },
        "3": { id: "3", name: "Comportamiento Equilibrado", code: "balance()" }
    };

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (mockDb[id]) {
                resolve(mockDb[id]);
            } else {
                reject(new Error("404")); // Simula el error 404
            }
        }, 500);
    });
}; */


export const createBehavior = async (data) => {
    return await request('/club/behaviors', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const updateBehavior = async (id, data) => {
    return await request(`/club/behaviors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

export const deleteBehavior = async (id) => {
    return await request(`/club/behaviors/${id}`, {
        method: 'DELETE'
    });
};