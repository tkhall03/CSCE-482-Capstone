import React from 'react';
import { renderWithProviders } from '../testingHelpers/renderWithProviders';
import { screen, fireEvent, act } from '@testing-library/react';
import ClassList from '../src/app/classList/page';
import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}))

describe('ClassList Page', () => {
    const mockProps = [
        {
            termCode: "Test Term 1",
            termId: 1,
            status: true,
            catalogs: [
                {
                    catalogId: 1,
                    catalogName: "Test Class 1",
                    designation: 0, // deck
                    classes: [
                        {
                            classId: 1,
                            sectionNumber: 100,
                            deptNo: 0,
                            sampleTestDOA: 0,
                            syllabus: 0,
                            attendance: 0,
                            taskRequired: -1,
                            taskCompleted: -1,
                            className: null,
                            crn: 0,
                            documents: null,
                        }
                    ]
                },
                {
                    catalogId: 2,
                    catalogName: "Test Class 2",
                    designation: 1, // engine
                    classes: [
                        {
                            classId: 2,
                            sectionNumber: 101,
                            deptNo: 1,
                            sampleTestDOA: 0,
                            syllabus: 0,
                            attendance: 0,
                            taskRequired: 5,
                            taskCompleted: 0,
                            className: null,
                            crn: 1,
                            documents: null,
                        }
                    ]
                }
            ]
        },
        {
            termCode: "Test Term 2",
            termId: 2,
            status: false,
            catalogs: [
                {
                    catalogId: 3,
                    catalogName: "Test Class 3",
                    designation: 1, // engine
                    classes: [
                        {
                            classId: 3,
                            sectionNumber: 102,
                            deptNo: 1,
                            sampleTestDOA: 1,
                            syllabus: 1,
                            attendance: 1,
                            taskRequired: 5,
                            taskCompleted: 5,
                            className: null,
                            crn: 2,
                            documents: null,
                        }
                    ]
                }
            ]
        }

    ];

    beforeEach(() => {
        jest.clearAllMocks();

        const mockRouter = {
            push: jest.fn()
        };
        (useRouter as jest.Mock).mockReturnValue(mockRouter);

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve(mockProps)
            })
        ) as jest.Mock;
    });

    test('renders the components correctly and button routes', async () => {
        const { push } = useRouter();

        await act(async () => {
            renderWithProviders(<ClassList {...mockProps} />);
        });

        const navBar = screen.getByTestId("NavBar");
        const wrappers = screen.queryAllByTestId("Wrapper");
        const dividers = screen.queryAllByTestId("Divider");

        expect(navBar).toBeInTheDocument();

        expect(wrappers).toHaveLength(3);
        wrappers.forEach((wrapper) => {
            expect(wrapper).toBeInTheDocument();
        });

        expect(dividers).toHaveLength(2);
        dividers.forEach((divider) => {
            expect(divider).toBeInTheDocument();
        });
        
        const classButton = screen.getByRole('button', { name: /Section: 100/i });
        fireEvent.click(classButton);

        expect(push).toHaveBeenCalledWith('/class/1');
    });
});
