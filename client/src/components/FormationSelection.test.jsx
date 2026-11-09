import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { FormationSelection } from "./FormationSelection";

describe("FormationSelection Component", () => {
    test("1. Renderiza correctamente el label y opciones de formación", () => {
        render(<FormationSelection value="TRIANGLE" onChange={vi.fn()} />);

        // Verificar label
        expect(screen.getByText("Formación táctica")).toBeInTheDocument();

        // Verificar selector
        const select = screen.getByRole("combobox");
        expect(select).toBeInTheDocument();

        // Verificar que existan las 3 opciones con sus textos
        expect(screen.getByRole("option", { name: "Triángulo (TRIANGLE)" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Línea Ofensiva (OFFENSIVE_LINE)" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Línea Defensiva (DEFENSIVE_LINE)" })).toBeInTheDocument();
        expect(screen.getAllByRole("option")).toHaveLength(3);
    });

    test("2. Muestra la opción seleccionada según el prop `value`", () => {
        render(<FormationSelection value="OFFENSIVE_LINE" onChange={vi.fn()} />);

        const select = screen.getByRole("combobox");
        expect(select).toHaveValue("OFFENSIVE_LINE");
    });
});