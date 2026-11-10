import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ClubLink } from "./ClubLink";

describe("ClubLink Component", () => {
    test("1. Renderiza 'Sin club' en texto gris si no se proporciona el nombre", () => {
        render(
            <MemoryRouter>
                <ClubLink id="c123" name="" />
            </MemoryRouter>
        );

        const fallbackSpan = screen.getByText("Sin club");
        expect(fallbackSpan).toBeInTheDocument();
        expect(fallbackSpan.tagName).toBe("SPAN");
        expect(fallbackSpan).toHaveClass("text-slate-400");
    });

    test("2. Renderiza el nombre en un span plano si tiene nombre pero no ID", () => {
        render(
            <MemoryRouter>
                <ClubLink name="Deportivo Córdoba" />
            </MemoryRouter>
        );

        const nameSpan = screen.getByText("Deportivo Córdoba");
        expect(nameSpan).toBeInTheDocument();
        expect(nameSpan.tagName).toBe("SPAN");
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    test("3. Renderiza un Link con la ruta /clubs/:id y el nombre correcto cuando se pasan ID y nombre", () => {
        render(
            <MemoryRouter>
                <ClubLink id="club-456" name="Boca Juniors" />
            </MemoryRouter>
        );

        const linkElement = screen.getByRole("link", { name: "Boca Juniors" });
        expect(linkElement).toBeInTheDocument();
        expect(linkElement).toHaveAttribute("href", "/clubs/club-456");
    });
});