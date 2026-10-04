import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ClubPage } from './ClubPage';
import * as clubService from '../services/club';

// Mock para react route (useNavigate)
const mockNavigate = vi.fn();
// interceptamos react-router-dom para que no  use el navegador real durante el test
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate, // ahora cuando pida el navegador real, le pasamos el mock
}));

// Mock para el service de club
// intercepta la carpeta de servicios para no hacer llamadas HTTP reales a internet
vi.mock('../services/club', () => ({
    createClub: vi.fn(), // reemplaza la funcion createClub por una falsa
    DEFAULT_AVATAR: 'https://placehold.co/150x150/png?text=Club',
}));

describe('ClubPage Component', () => {
    // limpiamos el historial de los mocks, para los siguientes test.
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // definimos escenarios de prueba especificos
    test('renderiza el titulo y el boton que esta deshabilitado por defecto (Crear club)', () => {
        render(<ClubPage/>); // cargamos la pagina

        expect(screen.getByText('Creación de Club')).toBeInTheDocument();
        const submitBtn = screen.getByRole('button', { name: /confirmar y crear club/i});
        expect(submitBtn).toBeDisabled();
    });

    test('habilita el boton al ingresar el nombre del club', () => {
        render(<ClubPage/>); // cargamos la pagina

        const inputName = screen.getByLabelText(/nombre del club/i);
        const submitBtn = screen.getByRole('button', { name: /confirmar y crear club/i});

        fireEvent.change(inputName, { target: { value: 'River Plate'}}); // insertamos un nombre de ejemplo.
        expect(submitBtn).not.toBeDisabled() // habilitamos el boton, cuando se ingrese el nombre.
    });

    test('notifica error al ingresar una URL que no termina en .png', () => {
        render(<ClubPage/>); // cargamos la pagina

        const inputName = screen.getByLabelText(/nombre del club/i);
        const inputAvatar = screen.getByLabelText(/url del avatar/i);
        const submitBtn = screen.getByRole('button', { name: /confirmar y crear club/i});
        
        fireEvent.change(inputName, { target: { value: 'River Plate'}}); // insertamos un nombre de ejemplo. (ya que es obligatorio)
        fireEvent.change(inputAvatar, { target: { value: 'https://avatarejemplo.com/ej.jpg'}}) // creamos un evento donde la url este mal colocada, no cumple con lo pedido
        fireEvent.click(submitBtn); // hacemos click en el boton

        expect(screen.getByText('La URL del avatar debe terminar en (.png)')).toBeInTheDocument();
        expect(clubService.createClub).not.toHaveBeenCalled(); // si la funcion createClub no se llamo, esta todo ok, si no, salta error
    });

    test('envia el formulario completo, con exito y navega hacia /club', async () => {
        clubService.createClub.mockResolvedValueOnce({ id : 123, club_name : 'River Plate'}) // damos una respuesta una unica vez, pasandole parametros "falsos"

        render(<ClubPage/>); // cargamos la pagina

        const inputName = screen.getByLabelText(/nombre del club/i);
        const submitBtn = screen.getByRole('button', { name: /confirmar y crear club/i});

        fireEvent.change(inputName, { target: { value: 'River Plate'}}); // insertamos un nombre de ejemplo. (ya que es obligatorio)
        fireEvent.click(submitBtn); // hacemos click en el boton

        await waitFor(() => {
            expect(clubService.createClub).toHaveBeenCalledWith({
                club_name : 'River Plate',
                avatar_url : '',
            });
            expect(mockNavigate).toHaveBeenCalledWith('/club/players');
        }, { timeout:2500 }); // timeout de espera para la redireccion
    });

    test('muestra mensaje de error si el backend devuelve conflicto 409 (club ya creado)', async () => {
        clubService.createClub.mockRejectedValueOnce({
            status : 409,
            message : "El usuario ya tiene un club creado.",
        });

        render(<ClubPage/>); // cargamos la pagina

        const inputName = screen.getByLabelText(/nombre del club/i);
        const submitBtn = screen.getByRole('button', { name: /confirmar y crear club/i});

        fireEvent.change(inputName, { target: { value: 'River Plate'}}); // insertamos un nombre de ejemplo. (ya que es obligatorio)
        fireEvent.click(submitBtn); // hacemos click en el boton

        await waitFor(() => {
            expect(screen.getByText('El usuario ya tiene un club creado.')).toBeInTheDocument();
        });
    });
});