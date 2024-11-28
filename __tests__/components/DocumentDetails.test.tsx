import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../testingHelpers/renderWithProviders';
import DocumentDetails from '../../src/app/components/DocumentDetails';
import moment from 'moment';

const mockProps = {
    isVoidDocModalOpen: false,
    handleOpenVoidDocModal: jest.fn(),
    handleCloseVoidDocModal: jest.fn(),
    documentDetails: {
        documentId: 56,
        valid: false,
        voidRemarks: 'Document is voided',
        voidUser: 'Test User 1',
        voidDateTime: '2023-10-20T13:31:28.2834123',
        uploadUser: 'Test User 1',
        uploadDateTime: '2023-10-19T13:31:28.2834123',
        remarks: [
            {
                remark: 'Test remark 1',
                remarkUser: 'Test User 2',
                remarkDate: '2023-10-19T14:31:28.2834123',
            },
            {
                remark: 'Test remark 2',
                remarkUser: 'Test User 3',
                remarkDate: '2023-10-19T15:31:28.2834123',
            },
        ]
    },
    newRemark: '',
    setNewRemark: jest.fn(),
    fetchDocumentData: jest.fn(),
    closeDetailsModal: jest.fn(),
    detailsModalOpen: true,
    detailsFileName: 'Test Document',
};

const nonVoidDocProps = {
    ...mockProps,
    documentDetails: {
        ...mockProps.documentDetails,
        valid: true,
        voidUser: '',
        voidDateTime: '',
        voidRemarks: ''
    },
};

describe('DocumentDetails Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders void document message when document is invalid', () => {

        renderWithProviders(<DocumentDetails {...mockProps} />);

        expect(screen.getByText('Test Document Details')).toBeInTheDocument();
        expect(screen.getByText('Document Voided')).toBeInTheDocument();
        expect(screen.getByText('Document is voided')).toBeInTheDocument();
        expect(screen.getByText('Test User 1')).toBeInTheDocument();
        expect(screen.getByText('Test User 2')).toBeInTheDocument();
        expect(screen.getByText('Test User 3')).toBeInTheDocument();
        expect(screen.getByText(moment.utc('2023-10-20T13:31:28.2834123').format('MMM Do YYYY, hh:mm A'))).toBeInTheDocument();
        expect(screen.getByText(moment.utc('2023-10-19T14:31:28.2834123').format('MMM Do YYYY, hh:mm A'))).toBeInTheDocument();
        expect(screen.getByText(moment.utc('2023-10-19T15:31:28.2834123').format('MMM Do YYYY, hh:mm A'))).toBeInTheDocument();
    });

    test('doesnt render void document message when document is invalid', () => {

        renderWithProviders(<DocumentDetails {...nonVoidDocProps} />);

        expect(screen.getByText('Test Document Details')).toBeInTheDocument();

        expect(screen.queryByTestId('voidDiv')).not.toBeInTheDocument();
        expect(screen.getByText('Test User 2')).toBeInTheDocument();
        expect(screen.getByText('Test User 3')).toBeInTheDocument();
        expect(screen.getByText(moment.utc('2023-10-19T14:31:28.2834123').format('MMM Do YYYY, hh:mm A'))).toBeInTheDocument();
        expect(screen.getByText(moment.utc('2023-10-19T15:31:28.2834123').format('MMM Do YYYY, hh:mm A'))).toBeInTheDocument();
    });

    test('calls setNewRemark when typing in new remark input', () => {
        renderWithProviders(<DocumentDetails {...mockProps} />);

        const textarea = screen.getByTestId('textArea');
        fireEvent.change(textarea, { target: { value: 'New Remark Content' } });

        expect(mockProps.setNewRemark).toHaveBeenCalledWith('New Remark Content');
    });

    test('successfully adds new remark when length is more than 20 characters', async () => {
        const longRemarkProps = {
            ...mockProps,
            newRemark: 'This is a valid remark that is definitely longer than twenty characters'
        };
    
        global.fetch = jest.fn().mockImplementationOnce(() => 
            Promise.resolve({
                ok: true
            })
        );
        
        renderWithProviders(<DocumentDetails {...longRemarkProps} />);
        
        const addButton = screen.getByText('Add New Remark');
        fireEvent.click(addButton);
        
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'https://csce482capstone.csce482capstone.me/api/Documents/addRemark',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        documentId: 56,
                        personId: 2,
                        remark: longRemarkProps.newRemark,
                    })
                })
            );

            expect(longRemarkProps.fetchDocumentData).toHaveBeenCalledWith(56);
        });
    });

    test('shows alert when trying to add remark less than 20 characters', async () => {
        const shortRemarkProps = {
            ...mockProps,
            newRemark: 'Short remark'
        };
        
        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
        
        renderWithProviders(<DocumentDetails {...shortRemarkProps} />);
        
        const addButton = screen.getByText('Add New Remark');
        fireEvent.click(addButton);
        
        expect(alertMock).toHaveBeenCalledWith('New Remarks must be more then 20 characters long');
        alertMock.mockRestore();
    });
    
});
