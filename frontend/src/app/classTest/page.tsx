'use client'

import NavBar from "../components/NavBar";

import { useState, useEffect, forwardRef } from 'react'
import { Divider, DIVIDER_SIZES, Modal, HoverCard, TextInput } from '@mantine/core';
import { IconAlertTriangleFilled, IconDotsVertical, IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
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
    ClassName: string,
    designation: number,
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

export async function getServerSideProps(context) {
    console.log(context.query) 
    // returns { id: episode.itunes.episode, title: episode.title}
      
    //you can make DB queries using the data in context.query
    return {
        props: { 
            title: context.query.title //pass it to the page props
        }
    }
}

export default function classList(){
    
    const [documents, setDocuments] = useState<Document[]>([]);
    const [classes, setClasses] = useState<ClassData>();
    const [documentBlob, setDocumentBlob] = useState<string>('');
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pdfModalOpen, setPdfModalOpen] = useState<boolean>(false);
    const [numPages, setNumPages] = useState<number>(0);
    const [openFileName, setOpenFileName] = useState<string>('test.pdf');

    async function fetchClassData(){
        let response = await fetch('http://localhost:4000/GetSectionByID:1')
        let data = await response.json()
        console.log(data)
        setClasses(data)
        setDocuments(data.Documents)
    }

    useEffect(() => {
        fetchClassData()
    }, [])

    export const getServerSideProps = (context) => {
        console.log(context.query) 
        return {
            props: { 
               title: context.query.title //pass it to the page props
            }
        }
    }

    async function fetchPdf(documentNum: number){
        let response = await fetch(`http://localhost:5248/api/Documents/9`, { headers: {responseType: 'blob'}})
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

    function documentHeaders(feild: number){
        const feilds = ["Syllabus", "Attendance", "Sample Test"]
        let feildComplete;
        if(feild == 0){
            feildComplete = (classes?.Syllabus == 1);
        }
        else if(feild == 1){
            feildComplete = (classes?.Attendance == 1);
        }
        else{
            feildComplete = (classes?.SampleTestDOA == 1);
        }

        return(
            <div className="text-aggie-maroon flex mx-4">
                <div className="">
                    {feilds[feild]}:
                </div>
                <div className={`ml-2 ${!feildComplete ?  "text-ut-orange" : ""}`}>
                    {feildComplete ? "Uploaded" : "Missing"}
                </div>
                <div className="h-full flex">
                    {!feildComplete ? <IconAlertTriangleFilled className="ml-1 m-auto fill-ut-orange" stroke={2}/> : <></>}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white w-screen h-screen flex flex-col">
            <NavBar/>
            <div className="h-1/5 w-fill flex text-aggie-maroon font-bold"> 
                <div className="mt-4 ml-4 text-4xl w-1/6">
                    {classes?.ClassName}
                    <div className="text-2xl">
                        Section: {classes?.SectionNum}
                    </div>
                </div>
                <div className="text-2xl w-1/2 mt-4">
                    <div className="text-3xl">
                        Required Documents:
                    </div>
                    <div className="ml-12 flex w-full">
                        {documentHeaders(0)}
                        {documentHeaders(1)}
                        {documentHeaders(2)}
                    </div>
                </div>
                <div className="text-3xl mt-4 ml-16">
                    {
                        classes?.designation == 1 ?
                            <div>
                                <div className="text-3xl">
                                    Required Tasks:
                                </div>
                                <div className={`ml-12 flex w-full text-2xl ${classes?.taskComplete == classes?.taskRequired ? "text-aggie-maroon" : "text-ut-orange"}`}>
                                    {classes?.taskComplete} / {classes?.taskRequired}
                                    {classes?.taskComplete != classes?.taskRequired ? <IconAlertTriangleFilled className="ml-1 m-auto fill-ut-orange" stroke={3}/> : <></>}
                                </div>
                            </div>
                        :
                        <></>
                    }
                </div>
                <div className="text-3xl ml-16 h-full flex">
                    {
                        classes?.designation == 1 ?
                            <button className="my-auto border-4 border-aggie-maroon rounded-xl w-full px-4">
                                View Tasks
                            </button>
                        :
                        <></>
                    }
                </div>
            </div>
            <div className="w-screen flex mx-auto"> {/* Incase chaning divider width */}
                <Divider size={6} style={{width:'100%', height: '100%'}} color={'#500000'}/>
            </div>
            <div className="flex w-screen text-xl font-bold my-2 text-aggie-maroon">
                <div className="ml-4 w-1/3">
                    Document Name
                </div>
                <div className="w-1/5">
                    Uploaded By
                </div>
                <div className="w-1/5">
                    Uploaded On
                </div>
                <div className="w-1/6">
                    Type
                </div>
                <div className="">
                    Details
                </div>
            </div>
            <div className="w-screen flex mx-auto -mb-2"> {/* Incase chaning divider width */}
                <Divider size={6} style={{width:'100%', height: '100%'}} color={'#500000'} className="mb-0"/>
            </div>
            <div className="h-full">
                {
                    documents.map((document, idx) => (
                        <button className="h-20 text-left w-full" onDoubleClick={() => (fetchPdf(document.DocumentPK), setPdfModalOpen(true), setOpenFileName(document.FileName))}>
                            <div key={idx} className={"flex w-screen h-full m-auto text-aggie-maroon p-1 text-lg"}>
                                <div className="ml-4 w-1/3 my-auto">
                                    {document.FileName}
                                </div>
                                <div className="w-1/5 my-auto">
                                    {document.NameUploader}
                                </div>
                                <div className="w-1/5 my-auto">
                                    {document.TimeUploaded}
                                </div>
                                <div className="w-1/6 my-auto">
                                    {document.Type}
                                </div>
                                <button className="my-auto">
                                    <IconDotsVertical stroke={3} />
                                </button>
                            </div>
                            <div className="w-screen flex mx-auto"> {/* Incase chaning divider width */}
                                <Divider size={6} style={{width:'100%', height: '100%'}} color={'#500000'}/>
                            </div>
                        </button>
                    ))
                }
            </div>
            <div className="h-32 bg-aggie-maroon flex text-white text-2xl font-bold">
                <button className="ml-8 my-auto border-4 rounded-xl h-3/5 w-64">
                    Upload Document
                </button>
            </div>
            <Modal.Root opened={pdfModalOpen} onClose={() => (setPdfModalOpen(false), setPageNumber(1))} size="600" centered>
                <Modal.Overlay />
                <Modal.Content>
                    <Modal.Header>
                        <Modal.Title>
                            <div className="ml-8 text-2xl text-aggie-maroon font-bold">
                                {openFileName}
                            </div>
                        </Modal.Title>
                        <Modal.CloseButton style={{color: '#500000'}} size="xl"/>
                    </Modal.Header>
                    <Modal.Body>
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
                    </Modal.Body>
                </Modal.Content>
            {/* </Modal> */}
            </Modal.Root>
        </div>
    );
}
