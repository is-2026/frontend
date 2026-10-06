import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { RegisterPage } from '../pages/RegisterPage';
import * as authService from '../services/auth';

expect.extend(matchers);

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal<typeof import("react-router-dom")>();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
            <a href={to}>{children}</a>
        ),
    };
});

vi.mock('../services/auth', () => ({
    registrarUsuario: vi.fn(),
}));

describe('RegisterPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ESTO LIMPIA LA PANTALLA ENTRE CADA TEST PARA QUE NO SE ACUMULEN
    afterEach(() => {
        cleanup();
    });

    test('el botón está deshabilitado por defecto', () => {
        render(<RegisterPage />);
        expect(screen.getByRole('button', { name: /registrar usuario/i })).toBeDisabled();
    });

    test('habilita botón, envía datos y navega a /crear-club en éxito', async () => {
        authService.registrarUsuario.mockResolvedValueOnce({ token: '123' });
        render(<RegisterPage />);

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@gmail.com' } });
        fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: '123456' } });
        
        const submitBtn = screen.getByRole('button', { name: /registrar usuario/i });
        expect(submitBtn).not.toBeDisabled();
        
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(authService.registrarUsuario).toHaveBeenCalledWith('test@gmail.com', '123456');
            expect(mockNavigate).toHaveBeenCalledWith('/create-club');
        });
    });

    test('muestra error 409 si el email ya existe', async () => {
        authService.registrarUsuario.mockRejectedValueOnce({ status: 409 });
        render(<RegisterPage />);

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@gmail.com' } });
        fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: '123456' } });
        fireEvent.click(screen.getByRole('button', { name: /registrar usuario/i }));

        await waitFor(() => {
            expect(screen.getByText('Este email ya está registrado.')).toBeInTheDocument();
        });
    });
});