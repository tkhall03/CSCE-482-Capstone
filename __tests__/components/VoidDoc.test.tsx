import React from 'react';
import { renderWithProviders } from '../../testingHelpers/renderWithProviders';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import VoidDoc from '../../src/app/components/VoidDoc';

describe('VoidDoc Component', () => {
  	const mockProps = {
		docId: 123,
		onClose: jest.fn(),
  	};

  	beforeEach(() => {
		jest.clearAllMocks();
		global.fetch = jest.fn(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve({ message: 'Document voided successfully' }),
			})
		) as jest.Mock;
  	});

  	test('renders the form correctly', () => {
		renderWithProviders(<VoidDoc {...mockProps} />);

		expect(screen.getByLabelText(/Void Remark/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Void/i })).toBeInTheDocument();
  	});

  	test('validates required fields', async () => {
		renderWithProviders(<VoidDoc {...mockProps} />);
		const submitButton = screen.getByRole('button', { name: /Void/i });

		fireEvent.click(submitButton);

		expect(await screen.findByText(/void remark is required/i)).toBeInTheDocument();
  	});

  	test('handles form submission', async () => {
		renderWithProviders(<VoidDoc {...mockProps} />);
		const voidRemarkInput = screen.getByTestId('voidRemark');
		const submitButton = screen.getByRole('button', { name: /Void/i });

		fireEvent.change(voidRemarkInput, { target: { value: 'This is a test remark. That will exceed the 50 character minimum' } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith(
				'https://csce482capstone.csce482capstone.me/api/documents/void',
				expect.objectContaining({
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
					body: JSON.stringify({ Remark: 'This is a test remark. That will exceed the 50 character minimum', DocumentId: 123, PersonId: "1"}),
				})
			);
		});

		expect(mockProps.onClose).toHaveBeenCalled();
  	});

  	test('handles form submission error', async () => {
		global.fetch = jest.fn().mockRejectedValueOnce(new Error('Submission failed'));
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
		
		renderWithProviders(<VoidDoc {...mockProps} />);
		const voidRemarkInput = screen.getByTestId('voidRemark');
		const submitButton = screen.getByRole('button', { name: /Void/i });
	
		const testRemark = 'This is a test remark that is at least fifty characters long to pass validation.';
		fireEvent.change(voidRemarkInput, { target: { value: testRemark } });
		fireEvent.click(submitButton);
   
   	 	await waitFor(() => {
      		expect(consoleSpy).toHaveBeenCalledWith('Submission error:', expect.any(Error));
    	});
   
    	consoleSpy.mockRestore();
   	});

   	test('logs error when fetch response is not ok', async () => {

        jest.spyOn(console, 'error').mockImplementation(() => {});

        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ message: 'Internal Server Error' }),
        });

        const mockOnClose = jest.fn();
        renderWithProviders(<VoidDoc {...mockProps} />);

        const voidRemarkInput = screen.getByTestId('voidRemark');
        const submitButton = screen.getByRole('button', { name: /Void/i });
        const testRemark = 'This is a test remark that is at least fifty characters long to pass validation.';

        fireEvent.change(voidRemarkInput, { target: { value: testRemark } });
        fireEvent.click(submitButton);

        await screen.findByTestId('voidRemark');

        expect(console.error).toHaveBeenCalledWith('Error submitting form');
        expect(mockOnClose).not.toHaveBeenCalled();
    });
});
