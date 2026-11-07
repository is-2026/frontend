import { describe, test, expect, vi } from 'vitest';
import { getBehaviors, getBehaviorById, createBehavior, updateBehavior, deleteBehavior } from './behaviors';
import * as api from './api';

describe('Behaviors service', () => {
    test('hace un GET a /club/behaviors y devuelve los datos', async () => {
        const mockBehaviors = [
            { id: '1', name: 'Presión alta', code: 'if (ball) press();' }
        ];
        // Mockeamos request general
        vi.spyOn(api, 'request').mockResolvedValueOnce(mockBehaviors);

        const res = await getBehaviors();

        // Verificacion interaccion con endpoint correcto
        expect(api.request).toHaveBeenCalledWith('/club/behaviors', {
            method: 'GET',
        });
        expect(res).toEqual(mockBehaviors);
    });
});

test('getBehaviorById hace un GET al endpoint del id', async () => {
        const mockData = { id: '1', name: 'Ofensivo', code: 'attack()' };
        vi.spyOn(api, 'request').mockResolvedValueOnce(mockData);

        const result = await getBehaviorById('1');

        expect(api.request).toHaveBeenCalledWith('/club/behaviors/1', {
            method: 'GET'
        });
        expect(result).toEqual(mockData);
    });

test('createBehavior hace un POST a /club/behaviors con los datos enviados', async () => {
        const payload = { name: 'Nuevo', code: 'test()' };
        const mockResponse = { id: '2', ...payload };
        
        vi.spyOn(api, 'request').mockResolvedValueOnce(mockResponse);

        const result = await createBehavior(payload);

        expect(api.request).toHaveBeenCalledWith('/club/behaviors', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        expect(result).toEqual(mockResponse);
    });

test('updateBehavior hace un PUT a /club/behaviors/:id con los datos actualizados', async () => {
    const payload = { name: 'Editado', code: 'test2()' };
    const mockResponse = { id: '1', ...payload };
    
    vi.spyOn(api, 'request').mockResolvedValueOnce(mockResponse);

    const result = await updateBehavior('1', payload);

    expect(api.request).toHaveBeenCalledWith('/club/behaviors/1', {
        method: 'PUT',
        body: JSON.stringify(payload)
    });
    expect(result).toEqual(mockResponse);
});

test('deleteBehavior hace un DELETE a /club/behaviors/:id', async () => {
    const mockResponse = { status: 200, message: 'Comportamiento eliminado' };
    vi.spyOn(api, 'request').mockResolvedValueOnce(mockResponse);

    const result = await deleteBehavior('1');

    expect(api.request).toHaveBeenCalledWith('/club/behaviors/1', {
        method: 'DELETE'
    });
    expect(result).toEqual(mockResponse);
});