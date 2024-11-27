import React from 'react';
import { screen } from '@testing-library/react';
import TasksView from '../../src/app/components/TasksView';
import { renderWithProviders } from '../../testingHelpers/renderWithProviders';

describe('TasksView Component', () => {
    const sampleTasks = [
        {
            taskId: 1,
            taskCode: 'T1',
            description: 'Description 1',
            nvicCode: 'NVIC1',
            nvicDescription: 'NVIC Description 1',
        },
        {
            taskId: 2,
            taskCode: 'T2',
            description: 'Description 2',
            nvicCode: 'NVIC2',
            nvicDescription: 'NVIC Description 2',
        },
    ];

    test('renders without crashing', () => {
        renderWithProviders(<TasksView tasks={sampleTasks} />);
        const container = screen.getByText('T1');
        expect(container).toBeInTheDocument();
    });
  
    test('renders the correct number of tasks', () => {
        renderWithProviders(<TasksView tasks={sampleTasks} />);
        const taskCodes = screen.getAllByText(/^T\d$/);
        expect(taskCodes.length).toBe(sampleTasks.length);
    });

    test('renders task details correctly', () => {
        renderWithProviders(<TasksView tasks={sampleTasks} />);
        sampleTasks.forEach((task) => {
            const taskCode = screen.getByText(task.taskCode);
            const description = screen.getByText(task.description);
            
            expect(taskCode).toBeInTheDocument();
            expect(description).toBeInTheDocument();
        });
    });
});
