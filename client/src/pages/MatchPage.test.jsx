import { render, screen, act, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MatchPage } from './MatchPage';
import { useMatchSocket } from '../hooks/useMatchSocket';
import { getPlayers } from '../services/club';
import { changeLiveBehavior, scheduleSubstitution, cancelSubstitution } from "../services/matches";
import { getBehaviors } from "../services/behaviors";

vi.mock('../hooks/useMatchSocket', () => ({
    useMatchSocket: vi.fn() //vi.fn es función espía de esta función
}));

vi.mock('../services/club', () => ({
    getPlayers: vi.fn().mockResolvedValue([])
}));

vi.mock('../services/behaviors', () => ({
    getBehaviors: vi.fn().mockResolvedValue([])
}));

vi.mock('../services/matches', () => ({
    changeLiveBehavior: vi.fn(),
    scheduleSubstitution: vi.fn(),
    cancelSubstitution: vi.fn()
}));

describe('MatchPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    //Testeo para interacción durante el match
    //el finished = null es si es undefined, vale null, 
    // y el = {} indica que la función se puede llamar sin pasar argumentos
    function mockMatch({ finished = null, pause = null, pausesEnded = 0 } = {}) {
        useMatchSocket.mockReturnValue({
            teams: { home: { id: 'h', name: 'Local' }, away: { id: 'a', name: 'Visitante' } },
            lineups: {
                home: [
                    {
                        player_id: 'h1', number: 1, 
                        name: 'h-tit-1', is_starter: true, 
                        behavior_id: 'b1', behavior_name: 'Atacante' 
                    },
                    {
                        player_id: 'h2',
                        number: 2,
                        name: 'h-sup-1',
                        is_starter: false
                    }

                    
                ],
                away: [{ player_id: 'a1', number: 4, name: 'a-tit-1', is_starter: true, behavior_id: 'b2', behavior_name: 'Defensor' }],
            },
            scores: { home: 0, away: 0 },
            state: { 
                matchId: '123', 
                tick: 0, 
                players: [
                    { playerId: 'h1', x: -20, y: 0 },    
                    { playerId: 'a1', x: 20, y: 0 }
                ],
                ballPosition: { x: 0, y: 0 } },
            goalInfo: null,
            finished,
            pause,
            pausesEnded,
        });
    }

    async function renderMatch() {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/match/123']}>
                    <Routes>
                        <Route path="/match/:matchId" element={<MatchPage />} />
                    </Routes>
                </MemoryRouter>
            );
        });
    }

    test('1. El inicio del partido renderiza la interfaz completa, la cancha, jugadores y pelota', async() => {
        getPlayers.mockResolvedValue([{ id: 'h1' }]);
        mockMatch();

        const { container } = render(
            <MemoryRouter initialEntries={['/match/123']}>
                <Routes>
                    <Route path="/match/:matchId" element={<MatchPage />} />
                </Routes>
            </MemoryRouter>
        );

        // Verificación de Header y Paneles
        expect(screen.getByText('Local')).toBeInTheDocument();
        expect(screen.getByText('Visitante')).toBeInTheDocument();
        expect(screen.getByText('00:00')).toBeInTheDocument();
        expect(screen.getAllByText('Titulares')).toHaveLength(2);
        expect(screen.getAllByText('Suplentes')).toHaveLength(2);
        const changeButton = await screen.findByRole('button', { name: /realizar cambios/i });
        expect(changeButton).toBeInTheDocument();

        // Verificación de los jugadores por sus clases de color (bg-blue-500 y bg-red-500)
        const homePlayers = container.querySelectorAll('.bg-blue-500'); 
        const awayPlayers = container.querySelectorAll('.bg-red-500');
        //query a diferencia de get, si no encuentra devuelve null

        expect(homePlayers.length).toBe(1);
        expect(awayPlayers.length).toBe(1);

        // Verificación de la Pelota
        expect(screen.getByTestId('ball')).toBeInTheDocument();
    });

    test('2. Renderiza correctamente el banner de gol cuando recibe data en goalInfo', () => {
        useMatchSocket.mockReturnValue({
            lineups: {
                home: [{ player_id: 'p1' }],
                away: [{ player_id: 'p2' }]
            },
            scores: { home: 1, away: 0 },
            state: {
                matchId: '123',
                tick: 120,
                players: [{ playerId: 'p1', x: 0, y: 0 }],
                ballPosition: { x: 20, y: 0 }
            },
            goalInfo: {
                tick: 120,
                minute: 2,
                playerId: 'p1',
                team: 'home'
            },
            finished: { matchEnd: false }
        });

        render(
            <MemoryRouter initialEntries={['/match/123']}>
                <Routes>
                    <Route path="/match/:matchId" element={<MatchPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('¡GOL!')).toBeInTheDocument();
        expect(screen.getByText("Equipo Local - minuto 2'")).toBeInTheDocument();
    });

    test('3. Muestra el resultado final y banner al finalizar el partido (finished.matchEnd = true)', () => {
        useMatchSocket.mockReturnValue({
            lineups: {
                home: [{ player_id: 'p1' }],
                away: [{ player_id: 'p2' }]
            },
            scores: { home: 2, away: 1 },
            state: {
                matchId: '123',
                tick: 5400,
                players: [],
                ballPosition: { x: 0, y: 0 }
            },
            goalInfo: null,
            finished: {
                matchEnd: true,
                homeScore: 2,
                awayScore: 1
            }
        });

        render(
            <MemoryRouter initialEntries={['/match/123']}>
                <Routes>
                    <Route path="/match/:matchId" element={<MatchPage />} />
                </Routes>
            </MemoryRouter>
        );

        // Verifica el título del banner
        expect(screen.getByText(/PARTIDO FINALIZADO/i)).toBeInTheDocument();

        // Busca el texto "2 - 1"
        expect(screen.getByText('Equipo Local 2 - 1 Equipo Rival')).toBeInTheDocument();
    });

    test('4. Tolera coordenadas fuera de rango en la simulación sin romper el componente', () => {
        useMatchSocket.mockReturnValue({
            lineups: {
                home: [{ player_id: 'p1' }],
                away: [{ player_id: 'p2' }]
            },
            scores: { home: 0, away: 0 },
            state: {
                matchId: '123',
                tick: 10,
                players: [
                    { playerId: 'p1', x: -50, y: -30 },
                    { playerId: 'p2', x: 50, y: 30 }
                ],
                ballPosition: { x: 100, y: -50 }
            },
            goalInfo: null,
            finished: { matchEnd: false }
        });

        const { container } = render(
            <MemoryRouter initialEntries={['/match/123']}>
                <Routes>
                    <Route path="/match/:matchId" element={<MatchPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(container.querySelectorAll('.bg-blue-500').length).toBe(1);
        expect(container.querySelectorAll('.bg-red-500').length).toBe(1);
        expect(screen.getByTestId('ball')).toBeInTheDocument();
    });

    test('5. Actualiza los marcadores en el header al convertir un gol', () => {
        const { rerender } = render(
            <MemoryRouter initialEntries={['/match/123']}>
                <Routes>
                    <Route path="/match/:matchId" element={<MatchPage />} />
                </Routes>
            </MemoryRouter>
        );

        // Estado inicial del marcador: 0 - 0
        useMatchSocket.mockReturnValue({
            lineups: { home: [{ player_id: 'p1' }], away: [{ player_id: 'p2' }] },
            scores: { home: 0, away: 0 },
            state: { matchId: '123', tick: 0, players: [], ballPosition: { x: 0, y: 0 } },
            goalInfo: null,
            finished: { matchEnd: false }
        });

        rerender(
            <MemoryRouter initialEntries={['/match/123']}>
                <Routes>
                    <Route path="/match/:matchId" element={<MatchPage />} />
                </Routes>
            </MemoryRouter>
        );

        const score0Elements = screen.getAllByText('0');
        expect(score0Elements.length).toBeGreaterThanOrEqual(2); // Local 0 y Visitante 0

        // Simulación del evento de Gol del equipo local: pasa a 1 - 0
        useMatchSocket.mockReturnValue({
            lineups: { home: [{ player_id: 'p1' }], away: [{ player_id: 'p2' }] },
            scores: { home: 1, away: 0 },
            state: { matchId: '123', tick: 300, players: [], ballPosition: { x: 20, y: 0 } },
            goalInfo: { tick: 300, minute: 5, playerId: 'p1', team: 'home' },
            finished: { matchEnd: false }
        });

        rerender(
            <MemoryRouter initialEntries={['/match/123']}>
                <Routes>
                    <Route path="/match/:matchId" element={<MatchPage />} />
                </Routes>
            </MemoryRouter>
        );

        // Verifica que el nuevo valor '1' se muestre en pantalla
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    test('6. Los paneles muestran mi equipo y rival con sus números (#), selector y sus 5 estadísticas PACC (suma = 300)', async () => {
        // 💡 Estadísticas PACC que suman EXACTAMENTE 300 puntos:
        // a-tit-1: 85 + 75 + 65 + 45 + 30 = 300
        // h-tit-1: 80 + 70 + 60 + 50 + 40 = 300
        const myLineup = [
            { 
                player_id: 'a1', number: 7, name: 'a-tit-1', is_starter: true, 
                behavior_name: 'Atacante', power: 85, agility: 75, control: 65, speed: 45, strength: 30 
            },
        ];

        const rivalLineup = [
            { 
                player_id: 'h1', number: 1, name: 'h-tit-1', is_starter: true, 
                behavior_name: 'Atacante', power: 80, agility: 70, control: 60, speed: 50, strength: 40 
            }
        ];

        useMatchSocket.mockReturnValue({
            teams: { home: { id: 'h', name: 'Local' }, away: { id: 'a', name: 'Visita' } },
            lineups: { home: rivalLineup, away: myLineup },
            scores: { home: 0, away: 0 },
            state: { matchId: '123', tick: 0, players: [{ playerId: 'a1', x: 5, y: 0 }], ballPosition: { x: 0, y: 0 } },
            goalInfo: null,
            finished: null,
        });

        // Mis jugadores son los del visitante (away: a1)
        getPlayers.mockResolvedValue([{ id: 'a1' }]);

        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/match/123']}>
                    <Routes>
                        <Route path="/match/:matchId" element={<MatchPage />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        // --- 1. VALIDACIÓN DE MI JUGADOR (a-tit-1)

        const myElements = await screen.findAllByText('a-tit-1');
        const myCard = myElements[myElements.length - 1].closest('li');
        expect(myCard).toBeInTheDocument();

        const myUtils = within(myCard);
        expect(myUtils.getByText('#7')).toBeInTheDocument();
        expect(myUtils.getByText('a-tit-1')).toBeInTheDocument();

        expect(myUtils.getByText('POW')).toBeInTheDocument();
        expect(myUtils.getByText('85')).toBeInTheDocument();
        expect(myUtils.getByText('AGI')).toBeInTheDocument();
        expect(myUtils.getByText('75')).toBeInTheDocument();
        expect(myUtils.getByText('CON')).toBeInTheDocument();
        expect(myUtils.getByText('65')).toBeInTheDocument();
        expect(myUtils.getByText('SPE')).toBeInTheDocument();
        expect(myUtils.getByText('45')).toBeInTheDocument();
        expect(myUtils.getByText('STR')).toBeInTheDocument();
        expect(myUtils.getByText('30')).toBeInTheDocument();

        // Selector de comportamiento presente sólo en mi jugador
        expect(myUtils.getByRole('combobox')).toBeInTheDocument();

        // --- 2. VALIDACIÓN DEL JUGADOR RIVAL (h-tit-1) ---

        const rivalElements = await screen.findAllByText('h-tit-1');
        const rivalCard = rivalElements[rivalElements.length - 1].closest('li');
        expect(rivalCard).toBeInTheDocument();

        const rivalUtils = within(rivalCard);
        expect(rivalUtils.getByText('#1')).toBeInTheDocument();
        expect(rivalUtils.getByText('h-tit-1')).toBeInTheDocument();

        expect(rivalUtils.getByText('POW')).toBeInTheDocument();
        expect(rivalUtils.getByText('80')).toBeInTheDocument();
        expect(rivalUtils.getByText('AGI')).toBeInTheDocument();
        expect(rivalUtils.getByText('70')).toBeInTheDocument();
        expect(rivalUtils.getByText('CON')).toBeInTheDocument();
        expect(rivalUtils.getByText('60')).toBeInTheDocument();
        expect(rivalUtils.getByText('SPE')).toBeInTheDocument();
        expect(rivalUtils.getByText('50')).toBeInTheDocument();
        expect(rivalUtils.getByText('STR')).toBeInTheDocument();
        expect(rivalUtils.getByText('40')).toBeInTheDocument();

        // El rival NO debe tener selector de comportamiento
        expect(rivalUtils.queryByRole('combobox')).not.toBeInTheDocument();

        // --- 3. FICHA EN CANCHA ---
        expect(screen.getByTestId('player-a1')).toHaveTextContent('7');
    });

    // --- Cambio de comportamiento en vivo ---

    const behaviorsMock = [
        { id: 'b1', name: 'Atacante' },
        { id: 'b2', name: 'Defensor' },
    ];

    test('7. Aparece selector de comportamientos con comportamiento actual durante el partido', async () => {
        getPlayers.mockResolvedValue([{ id: 'h1' }]);
        getBehaviors.mockResolvedValue([{ id: 'b1', name: 'Atacante' }]);
        mockMatch();
        await renderMatch();
        expect(await screen.findByRole('combobox')).toHaveDisplayValue('Atacante');
    });

    test('8. Un espectador no puede modificar comportamientos del partido', async () => {
        getPlayers.mockResolvedValue([{ id: 'otro-club' }]);
        getBehaviors.mockResolvedValue(behaviorsMock);
        mockMatch();
        await renderMatch();
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        expect(screen.queryByText('Atacante')).not.toBeInTheDocument();
    });

    test('9. Con el partido terminado no hay selector', async () => {
        getPlayers.mockResolvedValue([{ id: 'h1' }]);
        getBehaviors.mockResolvedValue(behaviorsMock);
        mockMatch({ finished: { matchEnd: true, tick: 5400, homeScore: 0, awayScore: 0 } });
        await renderMatch();
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        expect(screen.queryByText('Atacante')).not.toBeInTheDocument();
    });

    test('10. Cambio rechazado por backend, se muestra mensaje de error y se mantiene el comportamiento anterior', async () => {
        getPlayers.mockResolvedValue([{ id: 'h1' }]);
        getBehaviors.mockResolvedValue(behaviorsMock);
        changeLiveBehavior.mockRejectedValue(
            Object.assign(new Error('El comportamiento seleccionado fue eliminado o es inválido'), { status: 400 })
        );
        mockMatch();
        await renderMatch();
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'b2' } });
        expect(await screen.findByText('El comportamiento seleccionado fue eliminado o es inválido')).toBeInTheDocument();
        expect(changeLiveBehavior).toHaveBeenCalledWith('123', 'h1', 'b2');
        expect(screen.getByRole('combobox')).toHaveDisplayValue('Atacante');
    });

    test.each([
        ['cooling_break_1', 'Primera pausa de hidratación'],
        ['halftime', 'Entretiempo'],
        ['cooling_break_2', 'Segunda pausa de hidratación'],
    ])('11. Se ve cartel de pausa en una pausa, y se muestra el nombre de %s', async (type, name) => {
        const startTime = new Date().toISOString()
        mockMatch({ pause: { type, endsAt: new Date(Date.now() + 15000).toISOString() } });
        await renderMatch();
        
        expect(screen.getByText(name)).toBeInTheDocument();
        expect(screen.getByTestId('countdown')).toHaveTextContent('15');
        
    });

    test('12. Sin pausa no se muestra el cartel', async () => {
        mockMatch();
        await renderMatch();

        expect(screen.queryByTestId('countdown')).not.toBeInTheDocument();
    });

    test('13. Permite Realizar cambios con pausesEnded < 3 y muestra el cartel de cambio pendiente', async () => {
        getPlayers.mockResolvedValue([{ id: 'h1' }]);
        getBehaviors.mockResolvedValue(behaviorsMock);
        
        mockMatch({ pausesEnded: 1 }); // Usás tu misma función

        scheduleSubstitution.mockResolvedValueOnce({
            status: 'pending',
            player_out_id: 'h1',
            player_in_id: 'h2'
        });

        await renderMatch();

        
        //Abre panel de cambios, selecciona quien sale y quién entra y comportamiento, confirma
        fireEvent.click(screen.getByRole('button', { name: /Realizar cambios/i }));
        fireEvent.change(screen.getByDisplayValue('Quién sale...'), { target: { value: 'h1' } });
        fireEvent.change(screen.getByDisplayValue('Quién entra...'), { target: { value: 'h2' } });
        fireEvent.change(screen.getByDisplayValue('Qué comportamiento tendrá'), { target: { value: 'b1' } });
        fireEvent.click(screen.getByRole('button', { name: /Confirmar cambio/i })); 
        expect(await screen.findByText('Se realizará al fin de la pausa')).toBeInTheDocument();
    });

    test('14. Permite realizar cambios durante una pausa activa', async () => {
        getPlayers.mockResolvedValue([{ id: 'h1' }]);
        getBehaviors.mockResolvedValue(behaviorsMock);
    
        //Pasa una pausa activa
        mockMatch({ 
            pause: { type: 'halftime', endsAt: new Date(Date.now() + 15000).toISOString() }, 
            pausesEnded: 1 
        });

        //El cambio debería ejecutarse al instante
        scheduleSubstitution.mockResolvedValueOnce({
            status: 'success',
            player_out_id: 'h1',
            player_in_id: 'h99' // ID distinto al suplente del array para forzar el estado 'executed'
        });

        await renderMatch();

  
        fireEvent.click(screen.getByRole('button', { name: /Realizar cambios/i }));
        fireEvent.change(screen.getByDisplayValue('Quién sale...'), { target: { value: 'h1' } });
        fireEvent.change(screen.getByDisplayValue('Quién entra...'), { target: { value: 'h2' } });
        fireEvent.change(screen.getByDisplayValue('Qué comportamiento tendrá'), { target: { value: 'b1' } });
        fireEvent.click(screen.getByRole('button', { name: /Confirmar cambio/i }));
        expect(await screen.findByText('Se realizará al fin de la pausa')).toBeInTheDocument();
    });

    test('15. No se pueden Realizar cambios con pausesEnded == 3', async () => {
        getPlayers.mockResolvedValue([{ id: 'h1' }]);
        getBehaviors.mockResolvedValue(behaviorsMock);
        
        mockMatch({ pausesEnded: 3 });

        await renderMatch();

        fireEvent.click(screen.getByRole('button', { name: /Realizar cambios/i }));

        expect(await screen.findByText(/ya se han alcanzado las 3 pausas permitidas/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Confirmar cambio/i })).toBeDisabled();
    });

    test('16. Permite cancelar un cambio planificado antes de la pausa', async () => {
        getPlayers.mockResolvedValue([{ id: 'h1' }]);
        getBehaviors.mockResolvedValue(behaviorsMock);
        
        mockMatch({ pausesEnded: 1 });

        //Mock de cambio planificado (pending)
        scheduleSubstitution.mockResolvedValueOnce({
            status: 'pending',
            player_out_id: 'h1',
            player_in_id: 'h2'
        });

        //Mock de cancelación exitosa
        cancelSubstitution.mockResolvedValueOnce({ status: 'cancelled' });

        await renderMatch();

        //Abre panel de sustituciones
        fireEvent.click(screen.getByRole('button', { name: /Realizar cambios/i }));

        //Selecciona el cambio en el formulario
        fireEvent.change(screen.getByDisplayValue('Quién sale...'), { target: { value: 'h1' } });
        fireEvent.change(screen.getByDisplayValue('Quién entra...'), { target: { value: 'h2' } });
        fireEvent.change(screen.getByDisplayValue('Qué comportamiento tendrá'), { target: { value: 'b1' } });

        //Confirma el cambio para activar el estado 'pending'
        fireEvent.click(screen.getByRole('button', { name: /Confirmar cambio/i })); 

        //Espera al botón de cancelar generado por el estado pendiente
        const cancelButton = await screen.findByRole('button', { name: /Cancelar cambio/i });
        expect(cancelButton).toBeInTheDocument();

        //Click en cancelar
        fireEvent.click(cancelButton);

        //Valida que se llamó al servicio de cancelación con el ID del partido
        expect(cancelSubstitution).toHaveBeenCalledWith('123');

        //Await para verificar que desaparece de la interfaz
        await waitFor(() => {
            expect(screen.queryByText(/Pendiente:/i)).not.toBeInTheDocument();
        });
    });

});