/*
import { request } from "./api"; 

export const getBehaviors = async () => {
    const data = await request('/club/behaviors', {
        method: 'GET',
    });
    return data;
};
*/
/* MOCK para ver funcionamiento de crear amistoso */

export const getBehaviors = async () => {
  return [
    { id: "b1", name: "Ofensivo" },
    { id: "b2", name: "Defensivo" },
    { id: "b3", name: "Equilibrado" },
    { id: "b4", name: "Presión Alta" },
  ];
};