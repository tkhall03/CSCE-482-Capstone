'use client'
import { useState, useEffect } from 'react'
import { Divider, Modal } from '@mantine/core';
import { IconAlertTriangleFilled, IconDotsVertical, IconDownload } from '@tabler/icons-react';
import { pdfjs } from 'react-pdf';
import { useParams } from 'next/navigation'
import moment from 'moment';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import NavBar from "../../components/NavBar";
import UploadDoc from "../../components/UploadDoc";
import TasksView from "../../components/TasksView";
import DocumentDetails from "../../components/DocumentDetails";
import PdfModal from "../../components/PdfModal"
import AIModal from "../../components/AIModal";
import {ClassData, DocumentProp, Task, DocType, DocumentInfo, STCW, Nvic} from "../../components/interfaces"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function Class(){

    const params = useParams();
    
    const [tasks, setTasks] = useState<Task[]>([]);
    const [docTypes, setdocTypes] = useState<DocType[]>([]);
    const [documents, setDocuments] = useState<DocumentProp[]>([]);
    const [classes, setClasses] = useState<ClassData>();
    const [documentBlob, setDocumentBlob] = useState<string>('');
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pdfModalOpen, setPdfModalOpen] = useState<boolean>(false);
    const [numPages, setNumPages] = useState<number>(0);
    const [openFileName, setOpenFileName] = useState<string>("");
    const [detailsFileName, setDetailsFileName] = useState<string>("");
    const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
    const [newRemark, setNewRemark] = useState<string>("");
    const [documentDetails, setDocumentDetails] = useState<DocumentInfo>();
    const [classId, setClassId] = useState<number>();

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isTaskViewModalOpen, setTaskViewModalOpen] = useState(false);
    const [isVoidDocModalOpen, setIsVoidDocModalOpen] = useState(false);

    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    const handleUploadOpenModal = () => setIsUploadModalOpen(true);
    const handleUploadCloseModal = () => setIsUploadModalOpen(false);
    const handleTaskOpenModal = () => setTaskViewModalOpen(true);
    const handleTaskCloseModal = () => setTaskViewModalOpen(false);
    const handleOpenVoidDocModal = () => setIsVoidDocModalOpen(true);
    const handleCloseVoidDocModal = () => setIsVoidDocModalOpen(false);

    async function fetchDocTypes(){
        const response = await fetch(`https://csce482capstone.csce482capstone.me/api/Documents/types`)
        const data = await response.json() 
        const fetchedDocTypes: DocType[] = [];
        data.forEach((docType: DocType) => {
            fetchedDocTypes.push(docType)
        });
        console.log(fetchedDocTypes);
        setdocTypes(fetchedDocTypes);
    }

    
    async function fetchTaskData(classId: number){
        console.log("Fetching tasks");
        const response = await fetch(`https://csce482capstone.csce482capstone.me/api/classes/getTasksForClass/${classId}`)
        const data = await response.json()
        const fetchedTasks: Task[] = [];

        data.forEach((stcw: STCW) => {
            stcw.nvics.forEach((nvic: Nvic) => {
                nvic.tasks.forEach((task: Task) => {
                    fetchedTasks.push({
                        ...task,
                        nvicCode: nvic.nvicCode,
                        nvicDescription: nvic.nvicDescription
                    });
                });
            });
        });
        setTasks(fetchedTasks);
    }

    async function fetchClassData(classId: number){
        const response = await fetch(`https://csce482capstone.csce482capstone.me/api/classes/${classId}`)
        const data = await response.json()
        console.log(data)
        const sortedDocuments = data.documents.sort((a: DocumentProp, b: DocumentProp) => {
            if (a.valid && !b.valid) {
                return -1; 
            }
            if (!a.valid && b.valid) {
                return 1; 
            }
            return 0;
        });
        setClasses(data)
        setDocuments(sortedDocuments)
    }

    async function fetchPdf(documentNum: number){
        const response = await fetch(`https://csce482capstone.csce482capstone.me/api/Documents/${documentNum}`, { headers: {responseType: 'blob'}})
        const file = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(file);
        let base64String;
        reader.onloadend = () => {
            base64String = reader.result;
            if(base64String) {
                setDocumentBlob((base64String as string)?.substr((base64String as string).indexOf(',') + 1));

            } else {
                setDocumentBlob(''); 
            }
        };
    }

    async function downloadDocument(documentNum: number){
        try{
            const response = await fetch(`https://csce482capstone.csce482capstone.me/api/documents/download/${documentNum}`, { method: 'GET' });

            if(!response.ok){
                throw new Error(`Failed to download document. Status: ${response.status}`);
            }

            console.log('Response Headers:', Array.from(response.headers.entries()));

            let fileName = `document_${documentNum}`;
            
            const contentDisposition = response.headers.get('Content-Disposition');
            if(contentDisposition && contentDisposition.includes('filename=')){
                const fileNameMatch = contentDisposition.match(/filename=(["']?)([^;]*)\1/i);
                if(fileNameMatch?.[2]){
                    fileName = fileNameMatch[2].replace(/["']/g, '');
                }
            }

            const blob = await response.blob();
            const link = document.createElement('a');
            const objectUrl = window.URL.createObjectURL(blob);

            link.setAttribute('download', fileName);
            link.setAttribute('href', objectUrl);
            link.setAttribute('target', '_blank');
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(objectUrl);
        }
        catch (error){
            console.error('Error downloading document:', error.message);
        }
    }

    async function fetchDocumentData(documentId: number){
        const response = await fetch(`https://csce482capstone.csce482capstone.me/api/Documents/info/${documentId}`);
        setDocumentDetails(await response.json());
    }
    
    useEffect(() => {
        if (params) {
            const classId = Array.isArray(params.classId) ? params.classId[0] : params.classId;
            const parsedClassId = Number(classId);
    
            if (!isNaN(parsedClassId)) {
                fetchClassData(parsedClassId);
                setClassId(parsedClassId);
                fetchTaskData(parsedClassId);
            } else {
                console.error("classId is not a valid number");
            }
        }
        fetchDocTypes();
    }, [params]);

    function documentHeaders(feild: number){
        const feilds = ["Syllabus", "Attendance", "Sample Test"]
        let feildComplete;
        if(feild == 0){
            feildComplete = (classes?.syllabus == 1);
        }
        else if(feild == 1){
            feildComplete = (classes?.attendance == 1);
        }
        else{
            feildComplete = (classes?.sampleTestDOA == 1);
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
                    {classes?.className}
                    <div className="text-2xl">
                        Section: {classes?.sectionNumber}
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
                        classes?.deptNo == 1 ?
                            <div>
                                <div className="text-3xl">
                                    Required Tasks:
                                </div>
                                <div className={`ml-12 flex w-full text-2xl ${classes?.taskCompleted == classes?.taskRequired ? "text-aggie-maroon" : "text-ut-orange"}`}>
                                    {classes?.taskCompleted} / {classes?.taskRequired}
                                    {classes?.taskCompleted != classes?.taskRequired ? <IconAlertTriangleFilled className="ml-1 m-auto fill-ut-orange" stroke={3} data-testid="errorTriangle"/> : <></>}
                                </div>
                            </div>
                        :
                        <></>
                    }
                </div>
                <div className="text-3xl ml-16 h-full flex">
                    {
                        classes?.deptNo == 1 ?
                            <button className="my-auto border-4 border-aggie-maroon rounded-xl w-full px-4" onClick={handleTaskOpenModal} data-testid="viewTasksButton">
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
                <div className="ml-4 w-1/4">
                    Document Name
                </div>
                <div className="w-1/6">
                    Uploaded By
                </div>
                <div className="w-1/5">
                    Uploaded On
                </div>
                <div className="w-1/6">
                    Type
                </div>
                <div className=" mx-auto">
                    Details
                </div>
                <div className=" mx-auto">
                    Download
                </div>
            </div>
            <div className="w-screen flex mx-auto"> {/* Incase chaning divider width */}
                <Divider size={6} style={{width:'100%', height: '100%'}} color={'#500000'} className="mb-0"/>
            </div>
            <div className="h-full">
                {
                   documents.map((doc, idx) => (
                    <div
                        key={idx}
                        className={`h-20 text-left w-full p-0 m-0 flex flex-col ${doc.valid ? '' : 'bg-gray-200 text-gray-500'}`}
                        onDoubleClick={() => {
                            if (doc.valid) { 
                                fetchPdf(doc.documentID);
                                setPdfModalOpen(true);
                                setOpenFileName(doc.fileName);
                            }
                        }}
                    >
                        <div
                            key={idx}
                            className={`flex w-screen h-max my-0 py-0 px-1 text-aggie-maroon text-lg grow ${doc.valid ? '' : 'opacity-50'}`}
                        >
                            <div className="ml-4 w-1/4 my-auto">
                                {doc.fileName}
                            </div>
                            <div className="w-1/6 my-auto">
                                {doc.nameUploader}
                            </div>
                            <div className="w-1/5 my-auto">
                                {moment.utc(doc.timeUploaded).format('MMM Do YYYY, hh:mm A')}
                            </div>
                            <div className="w-1/6 my-auto">
                                {doc.type}
                            </div>
                            <button
                                className="my-auto mx-auto"
                                onClick={() => {
                                    setDetailsFileName(doc.fileName);
                                    setDetailsModalOpen(true);
                                    fetchDocumentData(doc.documentID);
                                }}
                                data-testid="details"
                            >
                                <IconDotsVertical stroke={3} />
                            </button>
                            <button
                                className="my-auto  mx-auto"
                                onClick={() => {
                                    downloadDocument(doc.documentID);
                                }}
                                data-testid="details"
                            >
                                <IconDownload stroke={3} />
                            </button>
                        </div>
                        <div className="w-screen h-1.5 m-0 p-0 bg-aggie-maroon"/>
                    </div>
                ))
                }
            </div>
            <div className="h-32 bg-aggie-maroon flex justify-between text-white text-2xl font-bold">
                <button 
                    className="ml-8 my-auto border-4 rounded-xl h-3/5 w-64"
                    onClick={handleUploadOpenModal}
                    data-testid="uploadDocumentButton"
                >
                    Upload Document
                </button>
                <button 
                    className="mr-8 my-auto border-4 rounded-xl h-3/5 w-64"
                    onClick={() => {setIsAIModalOpen(true)}}
                    data-testid="chatButton"
                >
                    Chat with AI
                </button>
            </div>

            {isAIModalOpen && (<AIModal setIsAIModalOpen={setIsAIModalOpen}/>)} 

            <Modal.Root opened={isUploadModalOpen} onClose={handleUploadCloseModal} size="lg">
                <Modal.Overlay />
                <Modal.Content data-testid="uploadDocumentContent">
                    <Modal.Header>
                        <Modal.Title>Upload Document</Modal.Title>
                        <Modal.CloseButton data-testid="closeButton" />
                    </Modal.Header>
                    <Modal.Body>
                        <UploadDoc 
                            classId={classes?.classId} 
                            className={classes?.className}
                            docTypes={docTypes}
                            tasks={tasks}
                            onClose={handleUploadCloseModal}
                            refreshDocs={() => (fetchClassData(classId))}
                        />
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>

            <Modal.Root opened={isTaskViewModalOpen} onClose={handleTaskCloseModal} size="lg">
                <Modal.Overlay />
                <Modal.Content data-testid="viewTasksContent">
                    <Modal.Header>
                        <Modal.Title>View Tasks</Modal.Title>
                        <Modal.CloseButton data-testid="closeButton" />
                    </Modal.Header>
                    <Modal.Body>
                        <TasksView tasks={tasks} />
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>

            <PdfModal
                pdfModalOpen={pdfModalOpen}
                pdfModalClose={() => {setPdfModalOpen(false); setPageNumber(1)}}
                openFileName={openFileName}
                setNumPages={setNumPages}
                documentBlob={documentBlob}
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
                numPages={numPages}
            />
            
            <DocumentDetails 
                isVoidDocModalOpen={isVoidDocModalOpen}
                handleOpenVoidDocModal={handleOpenVoidDocModal}
                handleCloseVoidDocModal={handleCloseVoidDocModal}
                documentDetails={documentDetails}
                newRemark={newRemark}
                setNewRemark={setNewRemark}
                getClassData={() => fetchClassData(Number(Array.isArray(params.classId) ? params.classId[0] : params.classId))}
                fetchDocumentData={fetchDocumentData}
                closeDetailsModal={() => {setDetailsModalOpen(false); setNewRemark("")}}
                detailsModalOpen={detailsModalOpen}
                detailsFileName={detailsFileName}
            />
        </div>
    );
}
