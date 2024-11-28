import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '../../testingHelpers/renderWithProviders';
import PdfModal from '../../src/app/components/PdfModal';

const pdfModalProps = {
    pdfModalOpen: true,
    pdfModalClose: jest.fn(),
    openFileName: 'Test PDF',
    setNumPages: jest.fn(),
    documentBlob: 'dummyBase64EncodedString',
    pageNumber: 1,
    handleButtonForward: jest.fn(),
    setPageNumber: jest.fn(),
    numPages: 5,
};

describe('DocumentDetails Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    test('renders modal with correct title', () => {
        renderWithProviders(<PdfModal {...pdfModalProps} />);

        expect(screen.getByText('Test PDF')).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('calls setNumPages on PDF load sucess', () => {
        renderWithProviders(<PdfModal {...pdfModalProps} />);

        expect(pdfModalProps.setNumPages).toHaveBeenCalledWith(5);
    });

    test('handles next page button click', async () => {
        renderWithProviders(<PdfModal {...pdfModalProps} />);

        const pdfComponent = screen.getByTestId("pdfComponent");
        act(() => {
            fireEvent.mouseEnter(pdfComponent);
        });

        const nextButton = await screen.findByTestId("forwardButton");
        fireEvent.click(nextButton);

        expect(pdfModalProps.setPageNumber).toHaveBeenCalledWith(2);
    });

    test('handles prev page button click', async () => {
        const pdfModalPropsSecPage = {...pdfModalProps, pageNumber: 2};
        renderWithProviders(<PdfModal {...pdfModalPropsSecPage} />);

        const pdfComponent = screen.getByTestId("pdfComponent");
        act(() => {
            fireEvent.mouseEnter(pdfComponent);
        });

        const backButton = await screen.findByTestId("backwardButton");
        fireEvent.click(backButton);

        expect(pdfModalProps.setPageNumber).toHaveBeenCalledWith(1);
    });

    test('updates page number on input change', async () => {
        renderWithProviders(<PdfModal {...pdfModalProps} />);

        const pdfComponent = screen.getByTestId("pdfComponent");
        act(() => {
            fireEvent.mouseEnter(pdfComponent);
        });
        const pageNumberInput = await screen.findByTestId("pageNumberInput");
        fireEvent.change(pageNumberInput, { target: { value: '3' } });

        expect(pdfModalProps.setPageNumber).toHaveBeenCalledWith(3);
    });
});
