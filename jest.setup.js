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
