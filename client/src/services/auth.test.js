import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginUser } from './auth';
import * as api from './api';

// Mockear el cliente HTTP (api.js)
vi.mock('./api', () => ({
    request: vi.fn(),
}));

describe('Auth service (loginUser)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    test('envia las credenciales correctamente a /auth/login y guarda el token', async () => {
        const mockResponse = { token : 'jwt-token-123' }; // responde como si el servidor respondiera un token jwt
        vi.spyOn(api, 'request').mockResolvedValueOnce(mockResponse);

        const credentials = { email : 'usuario@ejemplo.com', password : 'contraseña123' };
        const res = await loginUser(credentials);

        expect(api.request).toHaveBeenCalledWith('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        expect(res).toEqual(mockResponse);
        expect(localStorage.getItem('token')).toBe('jwt-token-123');
    });

    test('lanza error si la autenticación falla y no guarda el token', async () => {
        const mockError = new Error('Email o contraseña incorrectos');
        vi.spyOn(api, 'request').mockRejectedValueOnce(mockError);

        await expect(
           loginUser({ email : 'usuario@ejemplo.com', password : 'wrong' })
        ).rejects.toThrow(mockError);

        expect(localStorage.getItem('token')).toBeNull();
    });
});