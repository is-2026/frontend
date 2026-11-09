import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createClub, getMyClub, DEFAULT_AVATAR , updateDtBehavior} from './club';
import { request } from './api';

// Mockear el cliente HTTP (api.js)
vi.mock('./api', () => ({
    request: vi.fn(),
}));

describe('club service (createClub)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('envía la petición POST con el avatar provisto por el usuario', async () => {
        const dataInput = {
            club_name: 'River Plate',
            avatar_url: 'https://avatarejemplo.com/ej.png',
        };

        await createClub(dataInput);

        expect(request).toHaveBeenCalledWith('/club', {
            method: 'POST',
            body: JSON.stringify({
                club_name: 'River Plate',
                avatar_url: 'https://avatarejemplo.com/ej.png',
            }),
        });
    });

    test('asigna DEFAULT_AVATAR si no se pasa avatar_url o está en blanco', async () => {
        const dataInput = {
            club_name: 'River Plate',
            avatar_url: '   ',
        };

        await createClub(dataInput);

        expect(request).toHaveBeenCalledWith('/club', {
            method: 'POST',
            body: JSON.stringify({
                club_name: 'River Plate',
                avatar_url: DEFAULT_AVATAR,
            }),
        });
    });
});

describe('club service (getMyClub)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('envía la petición GET a /club', async () => {
        await getMyClub();

        expect(request).toHaveBeenCalledWith('/club');
    });

    test('devuelve lo que responde el back', async () => {
        const club = { id: 'c1', club_name: 'River Plate' };
        request.mockResolvedValue(club);

        const result = await getMyClub();

        expect(result).toEqual(club);
    });
});

describe('club service (updateDtBehavior)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('envía PATCH a /club/coach con el id del comportamiento', async () => {
        request.mockResolvedValue({ id: 'c1', coach_behavior_id: 'b1' });

        await updateDtBehavior('b1');

        expect(request).toHaveBeenCalledWith('/club/coach', {
            method: 'PATCH',
            body: JSON.stringify({ behavior_id: 'b1' }),
        });
    });

    test('envía null para quitar el DT', async () => {
        request.mockResolvedValue({ id: 'c1', coach_behavior_id: null });

        await updateDtBehavior(null);

        expect(request).toHaveBeenCalledWith('/club/coach', {
            method: 'PATCH',
            body: JSON.stringify({ behavior_id: null }),
        });
    });
});