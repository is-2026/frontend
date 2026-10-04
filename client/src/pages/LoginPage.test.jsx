import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { LoginPage } from './LoginPage';
import { loginUser } from '../services/auth';

// Mock del servicio de autenticación
vi.mock('../services/auth', () => ({
  loginUser: vi.fn(),
}));

// Mock de react-router-dom para verificar la navegación
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage Component', () => {
    // limpiamos el historial de los mocks, para los siguientes test.
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renderiza los inputs solicitados y arranca con el botón deshabilitado', () => {
        render(
            <MemoryRouter>,
            <LoginPage/>,
            </MemoryRouter>,
        );

        const inputEmail = screen.getByLabelText(/correo electrónico/i);
        const inputPassword = screen.getByLabelText(/contraseña/i);
        const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i});

        expect(inputEmail).toBeInTheDocument();
        expect(inputPassword).toBeInTheDocument();
        expect(submitBtn).toBeDisabled();
    });

    test('habilita el botón si se ingreso correctamente el email y la pass tiene >= 5 caracteres', () => {
        render(
        <MemoryRouter>
        <LoginPage />
        </MemoryRouter>
        );

        const inputEmail = screen.getByLabelText(/correo electrónico/i);
        const inputPassword = screen.getByLabelText(/contraseña/i);
        const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i});

        // Si la pass tiene 4 caracteres seguira deshabilitada.
        fireEvent.change(inputEmail, { target: { value: 'usuario@ejemplo.com'}});
        fireEvent.change(inputPassword, { target: { value: '1234'}});
        expect(submitBtn).toBeDisabled();

        // Al llegar a los 5 carac. se habilita
        fireEvent.change(inputPassword, { target: { value: '12345'}});
        expect(submitBtn).not.toBeDisabled();
    });

    test('llama a loginUser y redirige a /friendlies, en caso de exito', async () => {
        loginUser.mockResolvedValueOnce({ token: 'token-false-321'});
        render(
            <MemoryRouter>,
            <LoginPage/>
            </MemoryRouter>
        );

        const inputEmail = screen.getByLabelText(/correo electrónico/i);
        const inputPassword = screen.getByLabelText(/contraseña/i);
        const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i});

        fireEvent.change(inputEmail, { target: { value: 'usuario@ejemplo.com'}});
        fireEvent.change(inputPassword, { target: { value: 'pass12345678'}});
        fireEvent.click(submitBtn);

        expect(loginUser).toHaveBeenCalledWith({
            email: 'usuario@ejemplo.com',
            password: 'pass12345678',
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/friendlies');
        });
    });

    test('muestra mensaje de error si la auntenticación falla', async () => {
        const errorMensagge = 'email o contraseña incorrectos';
        loginUser.mockRejectedValueOnce(new Error(errorMensagge));

        render(
            <MemoryRouter>,
            <LoginPage/>
            </MemoryRouter>
        );

        const inputEmail = screen.getByLabelText(/correo electrónico/i);
        const inputPassword = screen.getByLabelText(/contraseña/i);
        const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i});

        fireEvent.change(inputEmail, { target: { value: 'usuario@ejemplo.com'}});
        fireEvent.change(inputPassword, { target: { value: 'pass12345678'}});
        fireEvent.click(submitBtn);

        const errorAlert = await screen.findByText(errorMensagge);
        expect(errorAlert).toBeInTheDocument();
    });
});
