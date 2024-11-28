import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderWithProviders } from '../testingHelpers/renderWithProviders';
import Class from '../src/app/class/[classId]/page';
import { useParams } from 'next/navigation';
import moment from 'moment';

jest.mock('next/navigation', () => ({
    useParams: jest.fn()
}));

const mockClassProps = {
    classId: 1,
    sectionNumber: 100,
    sampleTestDOA: 1,
    syllabus: 1, 
    attendance: 1,
    deptNo: 0,
    taskRequired: -1,
    taskCompleted: -1,
    className: "Test Class",
    crn: 1234,
    documents: [
        {
            documentID: 1,
            type: "Syllabus",
            nameUploader: "Test User",
            timeUploaded: "2023-08-02T00:43:42.5622452",
            valid: true,
            voidRemarks: null,
            fileName: "Test1.pdf",
            tasks: []
        },
        {
            documentID: 2,
            type: "Attendance",
            nameUploader: "Test User",
            timeUploaded: "2023-08-03T00:43:42.5622452",
            valid: false,
            voidRemarks: "testing null",
            fileName: "Test2.pdf",
            tasks: []
        },
    ]
};

const mockClassPropsEngine = {
    ...mockClassProps,
    syllabus: 0,
    deptNo: 1,
    taskRequired: 10,
    taskCompleted: 5
};

const mockDocTypes = [
    { typeId: 1, type: 'Syllabus', docTypeId: 1 },
    { typeId: 2, type: 'Attendance', docTypeId: 2 }
];


const mockTasks = [
    {
        stcwId: 1,
        stcwCode: "stcw-1",
        stcwDescription: "test stcw description",
        nvics: [
            {
                nvicId: 1,
                nvicCode: "nvic-1",
                nvicDescription: "test nvic description",
                tasks: [
                    {
                        taskId: 1,
                        taskCode: "task-1",
                        description: "test task description"
                    }
                ]
            }
        ]
    }
];

const mockDocumentDetails = {
    documentId: 56,
    valid: false,
    voidRemarks: 'Document is voided',
    voidUser: 'Test User 1',
    voidDateTime: '2023-10-20T13:31:28.2834123',
    uploadUser: 'Test User 1',
    uploadDateTime: '2023-10-19T13:31:28.2834123',
    remarks: [
        {
            remark: 'Test remark 1',
            remarkUser: 'Test User 2',
            remarkDate: '2023-10-19T14:31:28.2834123',
        },
        {
            remark: 'Test remark 2',
            remarkUser: 'Test User 3',
            remarkDate: '2023-10-19T15:31:28.2834123',
        },
    ]
};

class MockFileReader {
    onloadend: () => void = () => {};
    result: string | null;
  
    constructor(result: string | null = "data:application/pdf;base64,mockBase64String") {
      this.result = result;
    }
  
    readAsDataURL(blob: Blob) {
      setTimeout(() => {
        this.onloadend();
      }, 0);
    }
  }

  jest.mock('react-pdf', () => ({
    pdfjs: {
      GlobalWorkerOptions: {
        workerSrc: '',
      },
      version: '1.0.0'
    },
    Document: ({ children, file }: { children: React.ReactNode, file: string }) => (
      <div className="react-pdf__Document" data-testid="pdf-document" data-file={file}>
        {children}
      </div>
    ),
    Page: ({ pageNumber }: { pageNumber: number }) => (
      <div data-testid="pdf-page">
        Page {pageNumber}
      </div>
    ),
  }));
  

const mockBlob = new Blob(['mockPdfContent'], { type: 'application/pdf' });

describe('Class Component', () => {

    const originalConsoleError = console.error;

    beforeEach(() => {
        jest.clearAllMocks();
    
        global.fetch = jest.fn().mockImplementation((url) => {
            if (url.includes('/api/classes/getTasksForClass/')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockTasks)
                });
            }
            if (url.includes('/api/classes/')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockClassProps)
                });
            }
            if(url.includes('/api/Documents/info/')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockDocumentDetails)
                });
            }
            if(url.includes('/api/Documents/types')){
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockDocTypes)
                });
            }
            if(url.includes('/api/Documents/') && !url.includes('/info')){
                return Promise.resolve({
                    ok: true,
                    blob: () => Promise.resolve(mockBlob)
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([])
            });
        });

        (useParams as jest.Mock).mockReturnValue({ classId: '1' });

        console.error = jest.fn();

        global.FileReader = MockFileReader as any;
    });

    afterEach(() => {
        jest.resetAllMocks();
        console.error = originalConsoleError;
    });

    test('renders component with initial elements', async () => {
        renderWithProviders(<Class/>);

        await waitFor(() => {
            expect(screen.getByText('Test Class')).toBeInTheDocument();
        });

        expect(screen.getByTestId('NavBar')).toBeInTheDocument();
        expect(screen.getByText('Upload Document')).toBeInTheDocument();
        expect(screen.getByText('Required Documents:')).toBeInTheDocument();
    });

    test('handles array classId correctly', async () => {
        (useParams as jest.Mock).mockReturnValue({ classId: ['1', '2'] });
    
        renderWithProviders(<Class />);
    
        await waitFor(() => {
            expect(screen.getByText('Test Class')).toBeInTheDocument();
            expect(global.fetch).toHaveBeenCalledWith(
                'https://csce482capstone.csce482capstone.me/api/classes/1'
            );
            expect(console.error).not.toHaveBeenCalled();
        });
    });

    test('displays tasks correctly for engine class', async () => {
        global.fetch = jest.fn().mockImplementation((url) => {
            if (url.includes('/api/classes/getTasksForClass/')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockTasks)
                });
            }
            if (url.includes('/api/classes/')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockClassPropsEngine)
                });
            }
            if (url.includes('/api/Documents/types')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockDocTypes)
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([])
            });
        });

        renderWithProviders(<Class />);
    
        await waitFor(() => {
            expect(screen.getByText('Required Tasks:')).toBeInTheDocument();
            expect(screen.getByText('5 / 10')).toBeInTheDocument();
            expect(screen.getByTestId("errorTriangle")).toBeInTheDocument();
        });
        
        const viewTasksButton = screen.getByText('View Tasks');
        fireEvent.click(viewTasksButton);
    
        await waitFor(() => {
            expect(screen.getByTestId('tasksView')).toBeInTheDocument();
        });
    });

    test('logs error when classId is not a valid number', async () => {
        // Mock useParams to return invalid classId
        (useParams as jest.Mock).mockReturnValue({ classId: 'invalid' });
    
        renderWithProviders(<Class />);
    
        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith('classId is not a valid number');
        });
    });

    test('handles successful PDF load with base64 string', async () => {
        global.fetch = jest.fn().mockImplementation((url) => {
            if (url.includes('/api/classes/getTasksForClass/')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockTasks)
                });
            }
            if (url.includes('/api/classes/')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({...mockClassPropsEngine, taskCompleted: 10})
                });
            }
            if(url.includes('/api/Documents/info/')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockDocumentDetails)
                });
            }
            if(url.includes('/api/Documents/types')){
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockDocTypes)
                });
            }
            if(url.includes('/api/Documents/') && !url.includes('/info')){
                return Promise.resolve({
                    ok: true,
                    blob: () => Promise.resolve(mockBlob)
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([])
            });
        });

        global.FileReader = jest.fn().mockImplementation(() => new MockFileReader("data:application/pdf;base64,mockPdfContent"));
      
        renderWithProviders(<Class />);
      
        await waitFor(() => {
            expect(screen.getByText('Test1.pdf')).toBeInTheDocument();
        });
        const documentButton = screen.getByText('Test1.pdf').parentElement;
        fireEvent.doubleClick(documentButton!);
      
        await waitFor(() => {
            expect(screen.getByTestId('PdfModal')).toBeInTheDocument();
            expect(screen.getByTestId('pdfComponent')).toBeInTheDocument();
            expect(screen.getByTestId('pdf-document')).toBeInTheDocument();
            expect(screen.getByTestId('pdf-page')).toBeInTheDocument();
            expect(screen.queryByTestId("errorTriangle")).not.toBeInTheDocument();
        });

        const closeButton = screen.getByTestId("closeButton");
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByTestId('pdf-page')).not.toBeInTheDocument();
        });
    });

    test('handles failed PDF load', async () => {
        global.FileReader = jest.fn().mockImplementation(() => ({
            onloadend: () => {},
            result: null,
            readAsDataURL: function(blob: Blob) {
              setTimeout(() => {
                this.onloadend();
              }, 0);
            }
        }));

        renderWithProviders(<Class />);

        await waitFor(() => {
            expect(screen.getByText('Test1.pdf')).toBeInTheDocument();
        });
        const documentButton = screen.getByText('Test1.pdf').parentElement;
        fireEvent.doubleClick(documentButton!);

        await waitFor(() => {
            const pdfDocument = screen.getByTestId('pdf-document');
            expect(pdfDocument).toHaveAttribute(
                'data-file',
                'data:application/pdf;base64,'
            );
        });
    });

    test('opens and closes document details', async () => {
        
        renderWithProviders(<Class />);
        
        await waitFor(() => {
            expect(screen.getByText('Test1.pdf')).toBeInTheDocument();
        });
        const detailsButton = screen.getAllByTestId('details')[0];
        fireEvent.click(detailsButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
              'https://csce482capstone.csce482capstone.me/api/Documents/info/1'
            );
            expect(screen.getByTestId('documentDetailsContent')).toBeInTheDocument();
        });

        let documentDetailsContent = screen.getByTestId('documentDetailsContent');

        expect(documentDetailsContent).toBeInTheDocument();

        const voidDocumentButton = screen.getByTestId("voidDocumentButton");

        await act(async () => {
            fireEvent.click(voidDocumentButton);
        });

        await waitFor(() => {
            expect(screen.getByTestId('voidDocumentContent')).toBeInTheDocument();
        });

        const closeVoidButton = screen.getByTestId("voidCloseButton");
        fireEvent.click(closeVoidButton);

        await waitFor(() => {
            expect(screen.queryByTestId('voidDocumentContent')).not.toBeInTheDocument();
        });

        const closeButton = screen.getByTestId("closeButton");
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(documentDetailsContent).not.toBeInTheDocument();
        });
    });

    test('opens and closes upload document', async () => {
    
        renderWithProviders(<Class />);
        
        await waitFor(() => {
            expect(screen.getByTestId("uploadDocumentButton")).toBeInTheDocument();
        });
    
        const uploadDocument = screen.getByTestId("uploadDocumentButton");
        await act(async () => {
            fireEvent.click(uploadDocument);
        });
    
        await waitFor(() => {
            expect(screen.getByTestId("uploadDocumentContent")).toBeInTheDocument();
        });
    
        const closeButton = screen.getByTestId("closeButton");
        await act(async () => {
            fireEvent.click(closeButton);
        });
    
        await waitFor(() => {
            expect(screen.queryByTestId("uploadDocumentContent")).not.toBeInTheDocument();
        });
    });

    test('opens and closes view tasks', async () => {
        
        global.fetch = jest.fn().mockImplementation((url) => {
            if (url.includes('/api/classes/getTasksForClass/')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockTasks)
                });
            }
            if (url.includes('/api/classes/')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({...mockClassPropsEngine, taskCompleted: 10})
                });
            }
            if(url.includes('/api/Documents/info/')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockDocumentDetails)
                });
            }
            if(url.includes('/api/Documents/types')){
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockDocTypes)
                });
            }
            if(url.includes('/api/Documents/') && !url.includes('/info')){
                return Promise.resolve({
                    ok: true,
                    blob: () => Promise.resolve(mockBlob)
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([])
            });
        });

        renderWithProviders(<Class />);
        
        await waitFor(() => {
            expect(screen.getByTestId("uploadDocumentButton")).toBeInTheDocument();
            expect(screen.getByText("Test Class")).toBeInTheDocument();
        });
    
        const viewTaskButton = screen.getByTestId("viewTasksButton");
        await act(async () => {
            fireEvent.click(viewTaskButton);
        });
    
        await waitFor(() => {
            expect(screen.getByTestId("viewTasksContent")).toBeInTheDocument();
        });
    
        const closeButton = screen.getByTestId("closeButton");
        await act(async () => {
            fireEvent.click(closeButton);
        });
    
        await waitFor(() => {
            expect(screen.queryByTestId("viewTasksContent")).not.toBeInTheDocument();
        });
    });
    
    test('opens and closes chat with AI', async () => {
    
        renderWithProviders(<Class />);
        
        await waitFor(() => {
            expect(screen.getByTestId("chatButton")).toBeInTheDocument();
        });
    
        const chatButton = screen.getByTestId("chatButton");
        await act(async () => {
            fireEvent.click(chatButton);
        });
    
        await waitFor(() => {
            expect(screen.getByTestId("chatContent")).toBeInTheDocument();
        });
    
        const closeButton = screen.getByTestId("closeButton");
        await act(async () => {
            fireEvent.click(closeButton);
        });
    
        await waitFor(() => {
            expect(screen.queryByTestId("chatContent")).not.toBeInTheDocument();
        });
    });
});