import { render, screen, fireEvent } from '@testing-library/react';
import DocumentDetails from '../../src/app/components/DocumentDetails';
import moment from 'moment';

const mockProps = {
    isVoidDocModalOpen: false,
    handleOpenVoidDocModal: jest.fn(),
    handleCloseVoidDocModal: jest.fn(),
    documentDetails: {
        valid: true,
        voidRemarks: 'Document is voided.',
        voidUser: 'Admin User',
        uploadDateTime: '2024-11-25T12:00:00Z',
        remarks: [
            {
                remark: 'Initial Remark',
                remarkUser: 'User1',
                remarkDate: '2024-11-20T10:00:00Z',
            },
            {
                remark: 'Follow-up Remark',
                remarkUser: 'User2',
                remarkDate: '2024-11-22T15:30:00Z',
            },
        ],
        documentId: 1,
    },
    newRemark: '',
    setNewRemark: jest.fn(),
    addNewRemark: jest.fn(),
    closeDetailsModal: jest.fn(),
    detailsModalOpen: true,
    detailsFileName: 'Sample Document',
};

describe('DocumentDetails Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders modal with correct title', () => {
        render(<DocumentDetails {...mockProps} />);
        expect(screen.getByText('Sample Document Details')).toBeInTheDocument();
    });

    test('renders void document message when document is invalid', () => {
        const invalidDocProps = {
            ...mockProps,
            documentDetails: {
                ...mockProps.documentDetails,
                valid: false,
            },
        };
        render(<DocumentDetails {...invalidDocProps} />);
        expect(screen.getByText('Document Voided')).toBeInTheDocument();
        expect(screen.getByText('Document is voided.')).toBeInTheDocument();
        expect(screen.getByText('Admin User')).toBeInTheDocument();
        expect(screen.getByText(moment.utc('2024-11-25T12:00:00Z').format('MMM Do YYYY, hh:mm A'))).toBeInTheDocument();
    });

    test('renders remarks correctly', () => {
        render(<DocumentDetails {...mockProps} />);
        expect(screen.getByText('Initial Remark')).toBeInTheDocument();
        expect(screen.getByText('User1')).toBeInTheDocument();
        expect(screen.getByText(moment.utc('2024-11-20T10:00:00Z').format('MMM Do YYYY, hh:mm A'))).toBeInTheDocument();

        expect(screen.getByText('Follow-up Remark')).toBeInTheDocument();
        expect(screen.getByText('User2')).toBeInTheDocument();
        expect(screen.getByText(moment.utc('2024-11-22T15:30:00Z').format('MMM Do YYYY, hh:mm A'))).toBeInTheDocument();
    });

    test('calls setNewRemark when typing in new remark input', () => {
        render(<DocumentDetails {...mockProps} />);
        const textarea = screen.getByPlaceholderText('New Remark');
        fireEvent.change(textarea, { target: { value: 'New Remark Content' } });
        expect(mockProps.setNewRemark).toHaveBeenCalledWith('New Remark Content');
    });

    test('calls addNewRemark when Add New Remark button is clicked', () => {
        render(<DocumentDetails {...mockProps} />);
        const addRemarkButton = screen.getByText('Add New Remark');
        fireEvent.click(addRemarkButton);
        expect(mockProps.addNewRemark).toHaveBeenCalledTimes(1);
    });

    test('calls handleOpenVoidDocModal when Void Document button is clicked', () => {
        render(<DocumentDetails {...mockProps} />);
        const voidButton = screen.getByText('Void Document');
        fireEvent.click(voidButton);
        expect(mockProps.handleOpenVoidDocModal).toHaveBeenCalledTimes(1);
    });

    test('renders VoidDoc modal when isVoidDocModalOpen is true', () => {
        const voidDocProps = { ...mockProps, isVoidDocModalOpen: true };
        render(<DocumentDetails {...voidDocProps} />);
        expect(screen.getByText('Void Document')).toBeInTheDocument(); // From VoidDoc component
    });

    test('closes details modal when close button is clicked', () => {
        render(<DocumentDetails {...mockProps} />);
        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);
        expect(mockProps.closeDetailsModal).toHaveBeenCalledTimes(1);
    });
});
