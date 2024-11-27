import React from 'react';
import { renderWithProviders } from '../../testingHelpers/renderWithProviders';
import { screen } from '@testing-library/react';
import Wrapper from '../../src/app/components/Wrapper';

describe('Wrapper Component', () => {
    const mockPropsFalse = {
        label: 'Test Label',
        disabled: false,
        className: "",
        children: <></>
    };

    const mockPropsTrue = {
        label: 'Test Label',
        disabled: true,
        className: "",
        children: <></>
    };

    test('renders the Wrapper component with provided label and content', () => {
        renderWithProviders(<Wrapper {...mockPropsFalse} />);

        const labelElement = screen.getByTestId("labelDiv");
        expect(labelElement).toBeInTheDocument();

        const childrenElement = screen.getByTestId("childrenDiv");
        expect(childrenElement).toBeInTheDocument();
    });

    test('renders the Wrapper component with provided label and content', () => {
        renderWithProviders(<Wrapper {...mockPropsTrue} />);

        const labelElement = screen.getByTestId("labelDiv");
        expect(labelElement).toBeInTheDocument();

        const childrenElement = screen.getByTestId("childrenDiv");
        expect(childrenElement).toBeInTheDocument();
    });
});
