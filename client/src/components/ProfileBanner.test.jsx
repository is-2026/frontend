import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import ProfileBanner from './ProfileBanner';
import * as clubService from '../services/club';

vi.mock('../services/club', () => ({
    getMyClub: vi.fn(),
    getClubInfo: vi.fn(),
    DEFAULT_AVATAR: 'default.png',
}));

const mockClub = {
    id: 'c1', club_name: 'River', avatar_url: 'river.png', ranking_position: 2,
    points: 10, matches_played: 5, won: 3, won_penalties: 1, drawn: 1, lost: 0, goals_for: 8, goals_against: 3,
};

describe('ProfileBanner', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('1. sin clubId busca mi club y muestra su perfil', async () => {
        clubService.getMyClub.mockResolvedValue({ id: 'c1' });
        clubService.getClubInfo.mockResolvedValue(mockClub);
        render(<ProfileBanner />);

        await waitFor(() => expect(screen.getByText('River')).toBeInTheDocument());
        expect(clubService.getClubInfo).toHaveBeenCalledWith('c1');
    });

    test('2. con clubId busca el club de otro sin llamar a getMyClub', async () => {
        clubService.getClubInfo.mockResolvedValue(mockClub);
        render(<ProfileBanner clubId="c1" />);

        await waitFor(() => expect(screen.getByText('River')).toBeInTheDocument());
        expect(clubService.getMyClub).not.toHaveBeenCalled();
    });

    test('3. muestra el ranking y las estadísticas', async () => {
        clubService.getClubInfo.mockResolvedValue(mockClub);
        render(<ProfileBanner clubId="c1" />);

        await waitFor(() => expect(screen.getByText('Ranking: 2')).toBeInTheDocument());
        expect(screen.getByText('PG pen.')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
    });

    test('4. muestra "Sin ranking" si ranking_position es null', async () => {
        clubService.getClubInfo.mockResolvedValue({ ...mockClub, ranking_position: null });
        render(<ProfileBanner clubId="c1" />);

        await waitFor(() => expect(screen.getByText('Ranking: Sin ranking')).toBeInTheDocument());
    });

    test('5. muestra "El club no existe" si falla la petición', async () => {
        clubService.getClubInfo.mockRejectedValue({ status: 404, message: 'El club no existe' });
        render(<ProfileBanner clubId="x" />);

        await waitFor(() => expect(screen.getByText('El club no existe')).toBeInTheDocument());
    });

    test('6. usa el avatar por defecto si el club no tiene avatar', async () => {
        clubService.getClubInfo.mockResolvedValue({ ...mockClub, avatar_url: null });
        render(<ProfileBanner clubId="c1" />);

        await waitFor(() => expect(screen.getByAltText('River').getAttribute('src')).toBe('default.png'));
    });
});