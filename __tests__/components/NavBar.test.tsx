import React from 'react';
import { render, screen } from '@testing-library/react';
import NavBar from '../../src/app/components/NavBar';

describe('NavBar Component', () => {
    test('renders the navigation bar', () => {
		render(<NavBar />);
		const logo = screen.getByAltText('Texas A&M Logo');
		expect(logo).toBeInTheDocument();
  	});
});