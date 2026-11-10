import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { SubstitutionMadeNotice } from "./SubstitutionMadeNotice";

describe("SubstitutionMadeNotice", () => {
    test("renderiza correctamente el mensaje 'Cambio realizado'", () => {
        render(<SubstitutionMadeNotice />);
        expect(screen.getByText("Cambio realizado")).toBeInTheDocument();
    });
});