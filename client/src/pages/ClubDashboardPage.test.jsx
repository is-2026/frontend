import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClubDashboardPage } from "./ClubDashboardPage";

// mock del hook useNavigate de react-router-dom
const mockNavigate = vi.fn();
let mockParams = {};

vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
}));

vi.mock("../components/ProfileBanner", () => ({ default: () => null }));

describe("ClubDashboardPage Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockParams = {};
    });

    test("debe renderizar el título y la desc. del dashboard", () => {
        render(<ClubDashboardPage />);

        expect(screen.getByRole("heading", { name: /panel de mi club/i })).toBeInTheDocument();
        expect(screen.getByText(/gestioná la plantilla y los comportamientos de tu equipo/i)).toBeInTheDocument();
    });

    test("debe navegar a '/club/players' al hacer clic en 'Ver mi plantilla'", () => {
        render(<ClubDashboardPage />);

        const plantillaBtn = screen.getByRole("button", { name: /ver mi plantilla/i });
        fireEvent.click(plantillaBtn);

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith("/club/players");
    });

    test("debe navegar a '/club/behaviors' al hacer clic en 'Ver mis comportamientos'", () => {
        render(<ClubDashboardPage />);

        const comportamientosBtn = screen.getByRole("button", { name: /ver mis comportamientos/i });
        fireEvent.click(comportamientosBtn);

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith("/club/behaviors");
    });

    test("con id de otro club muestra 'Perfil del club' y oculta los botones", () => {
        mockParams = { id: "c2" };
        render(<ClubDashboardPage />);

        expect(screen.getByRole("heading", { name: /perfil del club/i })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /ver mi plantilla/i })).not.toBeInTheDocument();
    });
});