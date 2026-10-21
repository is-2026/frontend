import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { LeagueInProgress } from "./LeagueInProgress";

describe("LeagueInProgress", () => {
    test("muestra 'Liga en curso' y el nombre si la liga esta iniciada", () => {
        const league = { id: "liga-123", name: "Liga Test", status: "started" };

        render(<LeagueInProgress league={league} />);

        expect(screen.getByText("Liga en curso")).toBeInTheDocument();
        expect(screen.getByText("Liga Test")).toBeInTheDocument();
    });

    test("muestra 'Liga finalizada' si la liga termino", () => {
        const league = { id: "liga-123", name: "Liga Test", status: "finished" };

        render(<LeagueInProgress league={league} />);

        expect(screen.getByText("Liga finalizada")).toBeInTheDocument();
        expect(screen.queryByText("Liga en curso")).not.toBeInTheDocument();
    });
});