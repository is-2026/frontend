import { describe, test, expect, vi } from 'vitest';
import { getBehaviors } from './behaviors';
import * as api from './api';

describe('Behaviors service', () => {
    test('hace un GET a /club/behaviors y devuelve los datos', async () => {
        const mockBehaviors = [
            { id: '1', name: 'Presión alta', code: 'if (ball) press();' }
        ];
        // Mockeamos la request general
        vi.spyOn(api, 'request').mockResolvedValueOnce(mockBehaviors);

        const res = await getBehaviors();

        // Verificamos que pegue al endpoint correcto
        expect(api.request).toHaveBeenCalledWith('/club/behaviors', {
            method: 'GET',
        });
        expect(res).toEqual(mockBehaviors);
    });
});