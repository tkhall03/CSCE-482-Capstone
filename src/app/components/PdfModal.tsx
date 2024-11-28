import { Modal, HoverCard, TextInput } from '@mantine/core';
import { Document, Page, pdfjs } from 'react-pdf';
import { forwardRef } from 'react'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface pdfModalProps{
    pdfModalOpen: boolean,
    pdfModalClose: () => void,
    openFileName: string,
    setNumPages: (arg0: number) => void,
    documentBlob: string,
    pageNumber: number,
    setPageNumber: (arg0: number) => void,
    numPages: number
}

export default function PdfModal(
    {
        pdfModalOpen,
        pdfModalClose,
        openFileName,
        setNumPages,
        documentBlob,
        pageNumber,
        setPageNumber,
        numPages
    }: pdfModalProps
){

    const handlePDFLoadSuccess = ({ numPages }: {numPages: number}) => {
        setNumPages(numPages);
    };

    function handleButtonForward(isForward: boolean){
        if(isForward && pageNumber < numPages){
            setPageNumber(pageNumber + 1);
        }
        else if(!isForward && pageNumber > 1){
            setPageNumber(pageNumber - 1);
        }
    };

    const PdfComponent = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>((props, ref) => (
        <div ref={ref} {...props} className="m-auto w-fit !h-full" data-testid="pdfComponent">
            <Document className="!w-full !h-full" file={`data:application/pdf;base64,${documentBlob}`} onLoadSuccess={handlePDFLoadSuccess}>
                <Page className="!w-full" height={screen.height * .6} pageNumber={pageNumber} />
            </Document>
        </div>
    ));
    PdfComponent.displayName = "PdfComponent";

    return(
        <Modal.Root opened={pdfModalOpen} onClose={pdfModalClose} size="600" centered data-testid="PdfModal">
            <Modal.Overlay />
            <Modal.Content>
                <Modal.Header>
                    <Modal.Title>
                        <div className="ml-8 text-2xl text-aggie-maroon font-bold">
                            {openFileName}
                        </div>
                    </Modal.Title>
                    <Modal.CloseButton style={{color: '#500000'}} size="xl" data-testid="closeButton"/>
                </Modal.Header>
                <Modal.Body className="!h-[44rem]">
                    <HoverCard shadow="md" offset={-screen.height * .1}>
                        <HoverCard.Target>
                            <PdfComponent/>
                        </HoverCard.Target>
                        <HoverCard.Dropdown className='flex place-items-center !py-2 !px-0'>
                                <button className="px-2" onClick={() => handleButtonForward(false)} data-testid="backwardButton">
                                    <IconArrowLeft stroke={2} size='1rem' />
                                </button>
                                <TextInput
                                    value={pageNumber}
                                    onChange={(event) => setPageNumber(Number(event.currentTarget.value))}
                                    inputSize="3"
                                    size="xs"
                                    styles={{input: {textAlign: "center", padding: 0}}}
                                    data-testid="pageNumberInput"
                                />
                                <div className="pl-2 text-xs">{`of ${numPages}`}</div>
                                <button className="px-2" onClick={() => handleButtonForward(true)} data-testid="forwardButton">
                                    <IconArrowRight stroke={2} size='1rem' />
                                </button>
                        </HoverCard.Dropdown>
                    </HoverCard>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
}