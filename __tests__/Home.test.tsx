import React from 'react';
import { renderWithProviders } from '../testingHelpers/renderWithProviders';
import { screen, fireEvent } from '@testing-library/react';
import Home from '../src/app/page';
import altDescriptions from "../data/altDescriptions.json";

describe('Root Layout Wrapper', () => {

    test('renders children components correctly', async () => {
        delete window.location;
        window.location = { href: "" };

        renderWithProviders(<Home/>);

        const bgImg = screen.getByAltText(altDescriptions.kennedy);
        const navBar = screen.getByTestId("NavBar");
        const loginButton = screen.getByTestId("loginButton");

        fireEvent.click(loginButton);
        expect(window.location.href).toBe("/classList");

        expect(bgImg).toBeInTheDocument();
        expect(navBar).toBeInTheDocument();
    });
});
