import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { BehaviorDetail } from './BehaviorDetail';
import * as behaviorsService from '../services/behaviors';

vi.mock('../services/behaviors', () => ({
    getBehaviorById: vi.fn(),
    deleteBehavior: vi.fn(),
}));

const DummyBehaviorsList = () => {
    const location = useLocation();
    return <div>{location.state?.successMessage || 'Lista de Comportamientos'}</div>;
};

describe('BehaviorDetail', () => {
    test('renderiza el nombre y codigo del comportamiento', async () => {
        behaviorsService.getBehaviorById.mockResolvedValueOnce({
            name: 'Ofensivo',
            code: 'attack()'
        });

        render(
            <MemoryRouter initialEntries={['/club/behaviors/1']}>
                <Routes>
                    <Route path="/club/behaviors/:id" element={<BehaviorDetail />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ofensivo')).toBeInTheDocument();
            expect(screen.getByText('attack()')).toBeInTheDocument();
        });
    });

    test('muestra el error y el boton de volver si falla la peticion', async () => {
        behaviorsService.getBehaviorById.mockRejectedValueOnce(new Error('404'));

        render(
            <MemoryRouter initialEntries={['/club/behaviors/99']}>
                <Routes>
                    <Route path="/club/behaviors/:id" element={<BehaviorDetail />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/El comportamiento no existe/i)).toBeInTheDocument();
            expect(screen.getByText('Volver a comportamientos')).toBeInTheDocument();
        });
    });

    test('abre el modal de edición al hacer clic en Editar comportamiento', async () => {
        behaviorsService.getBehaviorById.mockResolvedValueOnce({
            id: '1',
            name: 'Ofensivo',
            code: 'attack()'
        });

        render(
            <MemoryRouter initialEntries={['/club/behaviors/1']}>
                <Routes>
                    <Route path="/club/behaviors/:id" element={<BehaviorDetail />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ofensivo')).toBeInTheDocument();
            expect(screen.getByText('Editar comportamiento')).toBeInTheDocument();
        });

        // Inicio de evento de clic en el botón "Editar comportamiento"
        fireEvent.click(screen.getByText('Editar comportamiento'));

        // Verificar que el modal se abrio en modo edición
        expect(screen.getByText('Editar Comportamiento')).toBeInTheDocument();
        
        // Verificar que el nombre del comportamiento se precargó en el input
        expect(screen.getByDisplayValue('Ofensivo')).toBeInTheDocument();
    });

    test('cancela la eliminación si el usuario no confirma en el pop-up', async () => {
        behaviorsService.getBehaviorById.mockResolvedValueOnce({ id: '1', name: 'Ofensivo', code: 'attack()' });
        
        // Simulamos que el usuario aprieta "Cancelar" en la alerta
        vi.spyOn(window, 'confirm').mockReturnValueOnce(false);

        render(
            <MemoryRouter initialEntries={['/club/behaviors/1']}>
                <Routes>
                    <Route path="/club/behaviors/:id" element={<BehaviorDetail />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('Ofensivo')).toBeInTheDocument());

        fireEvent.click(screen.getByText('Eliminar'));

        // Verificar que el pop-up de confirmación se mostró y que no se llamó a la API de eliminación
        expect(window.confirm).toHaveBeenCalled();
        expect(behaviorsService.deleteBehavior).not.toHaveBeenCalled();
    });

    test('elimina el comportamiento y redirige con mensaje de éxito (200)', async () => {
        behaviorsService.getBehaviorById.mockResolvedValueOnce({ id: '1', name: 'Ofensivo', code: 'attack()' });
        behaviorsService.deleteBehavior.mockResolvedValueOnce({});
        
        // Simulamos que el usuario aprieta "Aceptar" en la alerta
        vi.spyOn(window, 'confirm').mockReturnValueOnce(true);

        render(
            <MemoryRouter initialEntries={['/club/behaviors/1']}>
                <Routes>
                    <Route path="/club/behaviors/:id" element={<BehaviorDetail />} />
                    {/* Uso de dummy para verificar redireccion */}
                    <Route path="/club/behaviors" element={<DummyBehaviorsList />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('Ofensivo')).toBeInTheDocument());

        fireEvent.click(screen.getByText('Eliminar'));

        await waitFor(() => {
            // Verificar que se llamo a la API con el ID correcto
            expect(behaviorsService.deleteBehavior).toHaveBeenCalledWith('1');
            // Verificamos que redirigio y mando el mensaje de exito por el state
            expect(screen.getByText('Comportamiento eliminado con éxito.')).toBeInTheDocument();
        });
    });

    test('muestra error (409) en pantalla si el backend rechaza la eliminación', async () => {
        behaviorsService.getBehaviorById.mockResolvedValueOnce({ id: '1', name: 'Ofensivo', code: 'attack()' });
        
        // Simulamos un error 409 del backend
        const mockError = new Error();
        mockError.status = 409;
        mockError.message = "El comportamiento está asignado a un jugador.";
        behaviorsService.deleteBehavior.mockRejectedValueOnce(mockError);
        
        vi.spyOn(window, 'confirm').mockReturnValueOnce(true);

        render(
            <MemoryRouter initialEntries={['/club/behaviors/1']}>
                <Routes>
                    <Route path="/club/behaviors/:id" element={<BehaviorDetail />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('Ofensivo')).toBeInTheDocument());

        fireEvent.click(screen.getByText('Eliminar'));

        await waitFor(() => {
            // Verificamos que el mensaje del backend se muestra en la pantalla
            expect(screen.getByText('El comportamiento está asignado a un jugador.')).toBeInTheDocument();
        });
    });
});