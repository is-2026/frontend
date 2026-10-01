import { request } from './api';

/**
 * Realiza el inicio de sesión del usuario y guarda el token.
 * @param {Object} credentials - { email, password }
 */

export const loginUser = async ({ email, password }) => {
    const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    if (data?.token) {
        localStorage.setItem('token', data.token);
    }
    return data;
};