'use client'

import NavBar from "../components/NavBar";
import Wrapper from "../components/Wrapper";
import pdfModal from "../modals/pdfModal";

import { useState, useEffect, forwardRef } from 'react'
import { Divider, DIVIDER_SIZES, Overlay, Modal, HoverCard, TextInput } from '@mantine/core';
import { IconAlertTriangleFilled, IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

interface ClassData{
    ClassPK: number,
    CRN: string,
    SectionNum: string, 
    SampleTestDOA: number,
    Syllabus: number,
    Attendance: number,
    taskRequired: number,
    taskComplete: number,
    Documents: Document[]
}

interface Document{
    DocumentPK: number,
    Type: string,
    NameUploader: string,
    TimeUploaded: string,
    valid: boolean,
    FileName: string,
    supportedTask: Task[]
}

interface Task{
    TaskPK: number,
    TaskNum: string,
    TaskDescription: string
}

export default function classList(){
    
    const [documentBlob, setDocumentBlob] = useState<string>('');
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pdfModalOpen, setPdfModalOpen] = useState<boolean>(false);
    const [numPages, setNumPages] = useState<number>(0);
    const [openFileName, setOpenFileName] = useState<string>('test.pdf');

    async function fetchPdf(){
        let response = await fetch('http://localhost:5248/api/Documents/1', { headers: {responseType: 'blob'}})
        let file = await response.blob();
        let reader = new FileReader();
        reader.readAsDataURL(file);
        let base64String;
        reader.onloadend = () => {
            base64String = reader.result;
            setDocumentBlob(base64String.substr(base64String.indexOf(',') + 1));
        };
    }

    useEffect(() => {
        // fetchPdf()
    }, [])

    // when document loaded sets total number of pages of the document
    const handlePDFLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const PdfComponent = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>((props, ref) => (
        <div ref={ref} {...props} className="m-auto w-fit h-fit">
            <Document className="w-fit h-fit"file={`data:application/pdf;base64,${documentBlob}`} onLoadSuccess={handlePDFLoadSuccess}>
                <Page className="w-fit h-fit"  height={screen.height * .6} pageNumber={pageNumber} />
            </Document>
        </div>
    ));

    function handleButtonForward(isForward: boolean){
        if(isForward && pageNumber != numPages){
            setPageNumber(pageNumber + 1);
        }
        else if(!isForward && pageNumber != 1){
            setPageNumber(pageNumber - 1);
        }
    }

    return (
        <div className="bg-white w-full flex">
            <button className="h-1/3 w-1/6 bg-aggie-maroon" onClick={() => {setPdfModalOpen(!pdfModalOpen), fetchPdf()}}>Click me</button>
            <Modal opened={pdfModalOpen} onClose={() => (setPdfModalOpen(false), setPageNumber(1))} title={openFileName} size="600" centered>
                <HoverCard shadow="md" offset={-screen.height * .1} disabled={numPages === 0}>
                    <HoverCard.Target className='h-full'>
                        <PdfComponent/>
                    </HoverCard.Target>
                    <HoverCard.Dropdown className='flex place-items-center !py-2 !px-0'>
                            <button className="px-2" onClick={() => handleButtonForward(false)}>
                                <IconArrowLeft stroke={2} size='1rem' />
                            </button>
                            <TextInput
                                value={pageNumber}
                                onChange={(event) => setPageNumber(Number(event.currentTarget.value))}
                                inputSize="3"
                                size="xs"
                                styles={{input: {textAlign: "center", padding: 0}}}
                            />
                            <div className="pl-2 text-xs">{`of ${numPages}`}</div>
                            <button className="px-2" onClick={() => handleButtonForward(true)}>
                                <IconArrowRight stroke={2} size='1rem' />
                            </button>
                    </HoverCard.Dropdown>
                </HoverCard>
            </Modal>
        </div>
    );
}