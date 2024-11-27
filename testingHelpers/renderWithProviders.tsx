import React from 'react';
import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

export const renderWithProviders = (ui: React.ReactNode) => {
    return render(<MantineProvider>{ui}</MantineProvider>);
};
