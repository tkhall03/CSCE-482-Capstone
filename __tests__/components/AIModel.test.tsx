import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../testingHelpers/renderWithProviders';
import AIModal from '../../src/app/components/AIModal';

const mockSetIsAIModalOpen = jest.fn();

const mockAPIResponse = {
    generated_sql: "SELECT c.* FROM Classes c JOIN PersonClasses pc ON c.ClassId = pc.ClassId WHERE pc.PersonId = 1",
    results: [
        {
            CatalogId: 1,
            ClassId: 3,
            CourseRegistrationNumber: 12345,
            CourseRelation: null,
            Schedule: "MWF",
            Section: 100,
            TermId: 1,
            Time: "10:00 - 11:00 am"
        }
    ],
    success: true
};

describe('AIModal Component', () => {
    const originalError = console.error;

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
        console.error = jest.fn();
    });

    afterEach(() => {
        console.error = originalError;
    });

    test('renders AIModal with initial elements', () => {
        renderWithProviders(<AIModal setIsAIModalOpen={mockSetIsAIModalOpen} />);

        expect(screen.getByText('AI Chat')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Type your query here...')).toBeInTheDocument();
        expect(screen.getByText('Clear Chat')).toBeInTheDocument();
        expect(screen.getByText('Submit Query')).toBeInTheDocument();
    });

    test('clears input when Clear Chat button is clicked', () => {
        renderWithProviders(<AIModal setIsAIModalOpen={mockSetIsAIModalOpen} />);

        const input = screen.getByPlaceholderText('Type your query here...');
        fireEvent.change(input, { target: { value: 'test query' } });
        expect(input).toHaveValue('test query');

        const clearButton = screen.getByText('Clear Chat');
        fireEvent.click(clearButton);

        expect(input).toHaveValue('');
    });

    test('handles successful API response', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockAPIResponse)
        });

        renderWithProviders(<AIModal setIsAIModalOpen={mockSetIsAIModalOpen} />);

        const input = screen.getByPlaceholderText('Type your query here...');
        fireEvent.change(input, { target: { value: 'test query' } });

        const submitButton = screen.getByText('Submit Query');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'https://csce482capstone.csce482capstone.me/chat/query',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ input: 'test query' }),
                })
            );
        });

        await waitFor(() => {
            expect(screen.getByTestId('chatContent')).toBeInTheDocument();
            expect(screen.getByText('test query')).toBeInTheDocument();
            expect(screen.getByText('CatalogId:')).toBeInTheDocument();
            expect(screen.getByText('Schedule:')).toBeInTheDocument();
        });

        expect(input).toHaveValue('');
    });

    test('handles API error response', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ message: 'API Error' })
        });

        renderWithProviders(<AIModal setIsAIModalOpen={mockSetIsAIModalOpen} />);

        const input = screen.getByPlaceholderText('Type your query here...');
        fireEvent.change(input, { target: { value: 'test query' } });

        const submitButton = screen.getByText('Submit Query');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Error: API Error')).toBeInTheDocument();
        });
    });

    test('handles API fetch failure', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        renderWithProviders(<AIModal setIsAIModalOpen={mockSetIsAIModalOpen} />);

        const input = screen.getByPlaceholderText('Type your query here...');
        fireEvent.change(input, { target: { value: 'test query' } });

        const submitButton = screen.getByText('Submit Query');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch AI response.')).toBeInTheDocument();
        });
    });

    test('handles empty results from API', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ results: [] })
        });

        renderWithProviders(<AIModal setIsAIModalOpen={mockSetIsAIModalOpen} />);

        const input = screen.getByPlaceholderText('Type your query here...');
        fireEvent.change(input, { target: { value: 'test query' } });

        const submitButton = screen.getByText('Submit Query');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('No results found for the query.')).toBeInTheDocument();
        });
    });
});