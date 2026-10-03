import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CreatePlayerPage from "./CreatePlayerPage";
import { createPlayer } from "../services/club";

// mock del serivicio HTTP
vi.mock("../services/club", () => ({
  createPlayer: vi.fn(),
}));

// mock del hook useNavigate de react-router-dom
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// función aux que dibuja el componente en pantalla dentro del contexto de rutas necesario
const renderWithRouter = (ui) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe("CreatePlayerPage Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("renderiza el form con los campos vacíos y la suma de PACSS en 300", () => {
        // montamos el formulario en el entorno de prueba
        renderWithRouter(<CreatePlayerPage />);

        // comprueba que los titulos, inputs y textos iniciales esten visibles
        expect(screen.getByRole("heading", { name: /creación de jugador/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Ingrese el nombre del jugador/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Ingrese el número del jugador/i)).toBeInTheDocument();
        expect(screen.getByText("300 / 300 pts")).toBeInTheDocument();

        // busca el boton de confirmación y verifica que este este habilitado
        const submitBtn = screen.getByRole("button", { name: /confirmar y crear jugador/i });
        expect(submitBtn).toBeInTheDocument();
        expect(submitBtn).not.toBeDisabled();
    });

    test("no permite crear el jugador si la suma de PACSS es MENOR a 300pts", async () => {
        renderWithRouter(<CreatePlayerPage />);

        // completamos datos básicos
        fireEvent.change(screen.getByPlaceholderText(/ingrese el nombre del jugador/i), { target: { value: "Ariel Ortega" } });
        fireEvent.change(screen.getByPlaceholderText(/ingrese el número del jugador/i), { target: { value: "10" } });

        // asignamos 50 a cada atributo
        const inputsNumber = screen.getAllByRole("spinbutton");
        fireEvent.change(inputsNumber[1], { target: { value: "50" } });
        fireEvent.change(inputsNumber[2], { target: { value: "50" } });
        fireEvent.change(inputsNumber[3], { target: { value: "50" } });
        fireEvent.change(inputsNumber[4], { target: { value: "50" } });
        fireEvent.change(inputsNumber[5], { target: { value: "50" } });

        const submitBtn = screen.getByRole("button", { name: /confirmar y crear jugador/i});

        expect(submitBtn).toBeDisabled();

        // Intentamos enviar y verificamos que NO llame al servicio de creación
        fireEvent.click(submitBtn);
        expect(createPlayer).not.toHaveBeenCalled();
    });

    test("no permite crear el jugador si la suma de PACSS es MAYOR a 300pts", async () => {
        renderWithRouter(<CreatePlayerPage />);

        // completamos datos básicos
        fireEvent.change(screen.getByPlaceholderText(/ingrese el nombre del jugador/i), { target: { value: "Ariel Ortega" } });
        fireEvent.change(screen.getByPlaceholderText(/ingrese el número del jugador/i), { target: { value: "10" } });

        const inputsNumber = screen.getAllByRole("spinbutton");
        fireEvent.change(inputsNumber[1], { target: { value: "80" } });
        fireEvent.change(inputsNumber[2], { target: { value: "60" } });
        fireEvent.change(inputsNumber[3], { target: { value: "50" } });
        fireEvent.change(inputsNumber[4], { target: { value: "50" } });
        fireEvent.change(inputsNumber[5], { target: { value: "70" } });

        const submitBtn = screen.getByRole("button", { name: /confirmar y crear jugador/i });
    
        expect(submitBtn).toBeDisabled();

        fireEvent.click(submitBtn);
        expect(createPlayer).not.toHaveBeenCalled();
    });


    test("crea un jugador con éxito, invoca a onPlayerCreated y redirige a /club/players", async () => {
        const mockOnPlayerCreated = vi.fn(); // funcion espia para probar el callback
        const fakePlayer = { id: 1, name: "Fernando Cavenaghi", number: 9 };
        // le indicamos a la API simulada qeu responda con exito devolviendo el jugador falso que creamos
        createPlayer.mockResolvedValueOnce(fakePlayer);

        renderWithRouter(<CreatePlayerPage onPlayerCreated={mockOnPlayerCreated}/>);

        // simulamos que el usuario completa los datos
        fireEvent.change(screen.getByPlaceholderText(/ingrese el nombre del jugador/i), { target: { value: "Fernando Cavenaghi" }});
        fireEvent.change(screen.getByPlaceholderText(/ingrese el número del jugador/i), { target: { value: "9" }});
        
        // obtiene todos los campos de tipo number camiseta y pacss
        const inputsNumber = screen.getAllByRole("spinbutton"); 
  
        // simulamos la edicion de los pacss
        fireEvent.change(inputsNumber[1], { target: { value: "80" } }); // Power
        fireEvent.change(inputsNumber[2], { target: { value: "60" } }); // Agility
        fireEvent.change(inputsNumber[3], { target: { value: "70" } }); // Control
        fireEvent.change(inputsNumber[4], { target: { value: "35" } }); // Speed
        fireEvent.change(inputsNumber[5], { target: { value: "55" } }); // Strength

        // enviamos el formulario
        fireEvent.submit(screen.getByRole("button", { name: /confirmar y crear jugador/i}));

        // espera que se hayan completado las operaciones asincronicas
        await waitFor(() => {
            // verificamos que la API haya recibido exactamente los datos que el usuario ingreso
            expect(createPlayer).toHaveBeenCalledWith({
                name: "Fernando Cavenaghi",
                number: 9,
                power: 80,
                agility: 60,
                control: 70,
                speed: 35,
                strength: 55,
         });
         // verificamos que se ejecute la funcion callback con el jugador que el usuario creo
        expect(mockOnPlayerCreated).toHaveBeenCalledWith(fakePlayer);
        // verificamos que el usuario sea redirigido a la vista de la plantilla
        expect(mockedNavigate).toHaveBeenCalledWith("/club/players"); 
        });
    });

    test("muestra mensaje de error si el servidor devuelve conflicto 409 (num ocupado)", async () => {
        // simulamos que la API falla respondiendo un error 409
        createPlayer.mockRejectedValueOnce({ status: 409 });

        renderWithRouter(<CreatePlayerPage />);
        // simulamos el llenado de datos
        fireEvent.change(screen.getByPlaceholderText(/ingrese el nombre del jugador/i), { target: { value: "Carlos Sanchez" }});
        fireEvent.change(screen.getByPlaceholderText(/ingrese el número del jugador/i), { target: { value: "8" }});
        // lo enviamos
        fireEvent.submit(screen.getByRole("button", { name: /confirmar y crear jugador/i }));

        // esperamos a que el componente procese el error y comprueba que se muestre en la pantalla
        await waitFor(() => {
         expect(screen.getByText("El número de camiseta de jugador está en uso.")).toBeInTheDocument();
        });
    });

    test("redirige a /club/players al presionar el botón de volver", () => {
        renderWithRouter(<CreatePlayerPage />);

        // encontramos el botón de retroceso e interactuamos con él
        const backButton = screen.getByRole("button", { name: /← volver a plantilla/i});
        fireEvent.click(backButton); // simulamos el click del usuario (al botón de volver)

        // verificamos que se haya redirigido inmediatamente a la vista de plantilla de jugadores
        expect(mockedNavigate).toHaveBeenCalledWith("/club/players");
    });
});