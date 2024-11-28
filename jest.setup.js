import '@testing-library/jest-dom';

class ResizeObserver{
    observe() {}
    unobserve() {}
    disconnect() {}
}
  
global.ResizeObserver = ResizeObserver;

jest.mock('next/image', () => {
    return function MockImage({ src, alt }) {
        return <img src={src} alt={alt} />;
    };
});

jest.mock('react-pdf', () => ({
    Document: ({ onLoadSuccess, children }) => {
        onLoadSuccess({ numPages: 5 });
        return <div role="document">{children}</div>;
    },
    Page: () => <div role="page">Mocked Page</div>,
    pdfjs: { GlobalWorkerOptions: { workerSrc: 'mockWorkerSrc'}}
}));
