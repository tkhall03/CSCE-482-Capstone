import React from 'react';
import { renderWithProviders } from '../../testingHelpers/renderWithProviders';
import { screen, fireEvent, act } from '@testing-library/react';
import UploadDoc from '../../src/app/components/UploadDoc';

describe('UploadDoc Component', () => {
    const mockProps = {
        classId: 1,
        className: 'Test Class',
        docTypes: [
            { docTypeId: 1, type: 'Type 1' },
            { docTypeId: 2, type: 'Type 2' },
        ],
        tasks: [
            { taskId: 1, taskCode: 'T1', nvicCode: 'NVIC1', description: 'Task 1' },
            { taskId: 2, taskCode: 'T2', nvicCode: 'NVIC2', description: 'Task 2' },
        ],
        onClose: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders the component correctly', () => {
        renderWithProviders(<UploadDoc {...mockProps} />);

        const documentTypeSelection = screen.getByTestId("documentTypeSelection");
        const documentRemarks = screen.getByTestId("documentRemarks");
        const dropzone = screen.getByTestId("dropzone");
        const submit = screen.getByTestId("upload");
        
        expect(submit).toBeInTheDocument();
        expect(documentTypeSelection).toBeInTheDocument();
        expect(documentRemarks).toBeInTheDocument();
        expect(dropzone).toBeInTheDocument();
    });

    test('accepts valid files on drag and drop', async () => {
        renderWithProviders(<UploadDoc {...mockProps} />);

        const dropzone = screen.getByTestId('dropzone');
        const validFile = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });

        const dataTransfer = {
            files: [validFile],
            items: [
                {
                    kind: 'file',
                    type: validFile.type,
                    getAsFile: () => validFile,
                },
            ],
            types: ['Files'],
        };

        await act(async () => {
            fireEvent.drop(dropzone, { dataTransfer} );
        });

        const uploadedDocCard = await screen.getByTestId('uploadedDocCard');
        expect(uploadedDocCard).toBeInTheDocument();
    });

    test('rejects invalid files on drag and drop', async () => {

        const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => {});

        renderWithProviders(<UploadDoc {...mockProps} />);

        const dropzone = screen.getByTestId('dropzone');
        const validFile = new File(['dummy content'], 'test.invalid', { type: 'application/invalid' });

        const dataTransfer = {
            files: [validFile],
            items: [
                {
                    kind: 'file',
                    type: validFile.type,
                    getAsFile: () => validFile,
                },
            ],
            types: ['Files'],
        };

        await act(async () => {
            fireEvent.drop(dropzone, { dataTransfer} );
        });

        expect(consoleLogMock).toHaveBeenCalledWith(
            'rejected files',
            expect.objectContaining({})
        );

        const uploadedDocCard = await screen.queryByTestId('uploadedDocCard');
        expect(uploadedDocCard).not.toBeInTheDocument();
    });

    test('renders tasks selection only when docTypeId is 1', async () => {
        renderWithProviders(<UploadDoc {...mockProps} />);

        let tasksSelection = screen.queryByTestId('tasksSelection');
        expect(tasksSelection).not.toBeInTheDocument();

        const documentTypeSelection = screen.getByTestId('documentTypeSelection');
        fireEvent.click(documentTypeSelection);
        const option = await screen.findByText('Type 1');
        fireEvent.click(option);

        tasksSelection = screen.getByTestId('tasksSelection');
        expect(tasksSelection).toBeInTheDocument();
    });

    test('submits the form successfully', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Upload successful' }),
        });

        renderWithProviders(<UploadDoc {...mockProps} />);

        const documentTypeSelection = screen.getByTestId('documentTypeSelection');
        fireEvent.click(documentTypeSelection);
        const option = await screen.findByText('Type 1');
        fireEvent.click(option);

        const tasksSelection = screen.getByTestId('tasksSelection');
        fireEvent.click(tasksSelection);
        const taskOption = await screen.findByText('NVIC1', {exact: false});
        fireEvent.click(taskOption);

        const documentRemarksInput = screen.getByTestId('documentRemarks');
        fireEvent.change(documentRemarksInput, { target: { value: 'Test remarks' } });

        const dropzone = screen.getByTestId('dropzone');
        const validFile = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
        const dataTransfer = {
            files: [validFile],
            items: [
                {
                    kind: 'file',
                    type: validFile.type,
                    getAsFile: () => validFile,
                },
            ],
            types: ['Files'],
        };
        await act(async () => {
            fireEvent.drop(dropzone, { dataTransfer });
        });

        const submitButton = screen.getByTestId('upload');
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/Documents/upload'),
            expect.objectContaining({
                method: 'POST',
            })
        );
        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    test('not response.ok on upload document call', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Upload failed' }),
        });

        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

        renderWithProviders(<UploadDoc {...mockProps} />);

        const documentTypeSelection = screen.getByTestId('documentTypeSelection');
        fireEvent.click(documentTypeSelection);
        const option = await screen.findByText('Type 1');
        fireEvent.click(option);

        const tasksSelection = screen.getByTestId('tasksSelection');
        fireEvent.click(tasksSelection);
        const taskOption = await screen.findByText('NVIC1', {exact: false});
        fireEvent.click(taskOption);

        const documentRemarksInput = screen.getByTestId('documentRemarks');
        fireEvent.change(documentRemarksInput, { target: { value: 'Test remarks' } });

        const dropzone = screen.getByTestId('dropzone');
        const validFile = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
        const dataTransfer = {
            files: [validFile],
            items: [
                {
                    kind: 'file',
                    type: validFile.type,
                    getAsFile: () => validFile,
                },
            ],
            types: ['Files'],
        };
        await act(async () => {
            fireEvent.drop(dropzone, { dataTransfer });
        });

        const submitButton = screen.getByTestId('upload');
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/Documents/upload'),
            expect.objectContaining({
                method: 'POST',
            })
        );
        expect(alertMock).toHaveBeenCalledWith('error uploading document');
        expect(mockProps.onClose).not.toHaveBeenCalledTimes(1);

        alertMock.mockRestore();
    });
    
    test('test try fail on upload document call', async () => {

        global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

        renderWithProviders(<UploadDoc {...mockProps} />);

        const documentTypeSelection = screen.getByTestId('documentTypeSelection');
        fireEvent.click(documentTypeSelection);
        const option = await screen.findByText('Type 1');
        fireEvent.click(option);

        const tasksSelection = screen.getByTestId('tasksSelection');
        fireEvent.click(tasksSelection);
        const taskOption = await screen.findByText('NVIC1', {exact: false});
        fireEvent.click(taskOption);

        const documentRemarksInput = screen.getByTestId('documentRemarks');
        fireEvent.change(documentRemarksInput, { target: { value: 'Test remarks' } });

        const dropzone = screen.getByTestId('dropzone');
        const validFile = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
        const dataTransfer = {
            files: [validFile],
            items: [
                {
                    kind: 'file',
                    type: validFile.type,
                    getAsFile: () => validFile,
                },
            ],
            types: ['Files'],
        };
        await act(async () => {
            fireEvent.drop(dropzone, { dataTransfer });
        });

        const submitButton = screen.getByTestId('upload');
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/Documents/upload'),
            expect.objectContaining({
                method: 'POST',
            })
        );
        expect(alertMock).toHaveBeenCalledWith('error uploading document. Error: Network error');
        expect(mockProps.onClose).not.toHaveBeenCalledTimes(1);

        alertMock.mockRestore();
    });
});
