'use client'

import NavBar from "../../components/NavBar";

import { useState, useEffect, forwardRef } from 'react'
import { Divider, Modal, HoverCard, TextInput, Textarea, Button } from '@mantine/core';
import { IconAlertTriangleFilled, IconDotsVertical, IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useParams } from 'next/navigation'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import UploadDoc from "../../components/UploadDoc";
import TasksView from "../../components/TasksView";
import moment from 'moment';
import VoidDoc from "../../components/VoidDoc";

interface ClassData{
    classId: number,
    crn: string,
    sectionNumber: string, 
    sampleTestDOA: number,
    syllabus: number,
    attendance: number,
    taskRequired: number,
    taskCompleted: number,
    documents: DocumentProp[]
    className: string,
    deptNo: number,
}

interface DocumentProp{
    documentID: number,
    type: string,
    nameUploader: string,
    timeUploaded: string,
    valid: boolean,
    fileName: string,
    tasks: Task[]
}

interface Task { 
    taskId: number,
    taskCode: string,
    description: string,
    nvicCode: string,
    nvicDescription: string
}
interface Nvic { 
    nvicId: number,
    nvicDescription: string,
    nvicCode: string,
    tasks: Task[]
}

interface STCW { 
    stcwDescription: string
    stcwId: number,
    stcwCode: string,
    nvics: Nvic[]
}

interface DocType {
    docTypeId: number,
    type: string
}

interface DocumentInfo{
    documentId: number,
    valid: boolean,
    voidRemarks: string,
    voidUser: string,
    voidDateTime: string,
    uploadUser: string,
    uploadDateTime: string,
    remarks: Remark[]
}

interface Remark{
    remark: string,
    remarkUser: string,
    remarkDate: string
}

interface Remark{
    remark: string,
    remarkUser: string,
    remarkDate: string
}

export default function ClassList(){

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

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isTaskViewModalOpen, setTaskViewModalOpen] = useState(false);
    const [isVoidDocModalOpen, setIsVoidDocModalOpen] = useState(false);

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
        setClasses(data)
        setDocuments(data.documents)
    }

    async function fetchPdf(documentNum: number){
        const response = await fetch(`https://csce482capstone.csce482capstone.me/api/Documents/${documentNum}`, { headers: {responseType: 'blob'}})
        const file = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(file);
        let base64String;
        reader.onloadend = () => {
            base64String = reader.result;
            if (base64String) {
                setDocumentBlob((base64String as string)?.substr((base64String as string).indexOf(',') + 1) ?? '');

            } else {
                setDocumentBlob(''); 
            }
            
        };
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
                fetchTaskData(parsedClassId);
            } else {
                console.error("classId is not a valid number");
            }
        }
        fetchDocTypes();
    }, [params]);

    // when document loaded sets total number of pages of the document
    const handlePDFLoadSuccess = ({ numPages }: {numPages: number}) => {
        setNumPages(numPages);
    };
    
    const PdfComponent = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>((props, ref) => (
        <div ref={ref} {...props} className="m-auto w-fit !h-full">
            <Document className="!w-full !h-full" file={`data:application/pdf;base64,${documentBlob}`} onLoadSuccess={handlePDFLoadSuccess}>
                <Page className="!w-full" height={screen.height * .6} pageNumber={pageNumber} />
            </Document>
        </div>
    ));
    PdfComponent.displayName = "PdfComponent";

    function handleButtonForward(isForward: boolean){
        if(isForward && pageNumber != numPages){
            setPageNumber(pageNumber + 1);
        }
        else if(!isForward && pageNumber != 1){
            setPageNumber(pageNumber - 1);
        }
    }

    async function addNewRemark(){
        documentDetails

        if(newRemark.length > 20){

            fetch(`https://csce482capstone.csce482capstone.me/api/Documents/addRemark`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                  },
                body: JSON.stringify({
                    documentId: documentDetails.documentId,
                    personId: 2,
                    remark: newRemark,
                }),
            })
            .then((response) => {
                if(response.ok){
                    fetchDocumentData(documentDetails.documentId);
                }
            });
        }
        else{
            alert("New Remarks must be more then 20 characters long");
        }
    }

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
                                    {classes?.taskCompleted != classes?.taskRequired ? <IconAlertTriangleFilled className="ml-1 m-auto fill-ut-orange" stroke={3}/> : <></>}
                                </div>
                            </div>
                        :
                        <></>
                    }
                </div>
                <div className="text-3xl ml-16 h-full flex">
                    {
                        classes?.deptNo == 1 ?
                            <button className="my-auto border-4 border-aggie-maroon rounded-xl w-full px-4" onClick={handleTaskOpenModal}>
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
                   documents.map((doc, idx) => (
                    <button
                        key={idx}
                        className={`h-20 text-left w-full ${doc.valid ? '' : 'bg-gray-200 text-gray-500'}`}
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
                            className={`flex w-screen h-full m-auto text-aggie-maroon p-1 text-lg ${doc.valid ? '' : 'opacity-50'}`}
                        >
                            <div className="ml-4 w-1/3 my-auto">
                                {doc.fileName}
                            </div>
                            <div className="w-1/5 my-auto">
                                {doc.nameUploader}
                            </div>
                            <div className="w-1/5 my-auto">
                                {moment.utc(doc.timeUploaded).format('MMM Do YYYY, hh:mm A')}
                            </div>
                            <div className="w-1/6 my-auto">
                                {doc.type}
                            </div>
                            <button
                                className="my-auto"
                                onClick={() => {
                                    if (doc.valid) {
                                        setDetailsFileName(doc.fileName);
                                        setDetailsModalOpen(true);
                                        fetchDocumentData(doc.documentID);
                                    }
                                }}
                            >
                                <IconDotsVertical stroke={3} />
                            </button>
                        </div>
                        <div className="w-screen flex mx-auto">
                            <Divider
                                size={6}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                }}
                                color={doc.valid ? '#500000' : '#CCCCCC'}
                            />
                        </div>
                    </button>
                ))
                }
            </div>
            <div className="h-32 bg-aggie-maroon flex text-white text-2xl font-bold">
                <button 
                    className="ml-8 my-auto border-4 rounded-xl h-3/5 w-64"
                    onClick={handleUploadOpenModal}
                >
                    Upload Document
                </button>

                <Modal 
                    opened={isUploadModalOpen} 
                    onClose={handleUploadCloseModal} 
                    title="Upload Document"
                    size="lg" 
                >
                    
                    <UploadDoc 
                        classId={classes?.classId} 
                        className={classes?.className}
                        docTypes={docTypes}
                        tasks={tasks}
                        onClose={handleUploadCloseModal}
                    />
                </Modal>
                <Modal 
                    opened={isTaskViewModalOpen} 
                    onClose={handleTaskCloseModal} 
                    title="View Tasks"
                    size="lg" 
                >
                    
                    <TasksView tasks={tasks} />
                </Modal>
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
                    <Modal.Body className="!h-[44rem]">
                        <HoverCard shadow="md" offset={-screen.height * .1}>
                            <HoverCard.Target>
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
            </Modal.Root>
            <Modal.Root opened={detailsModalOpen} onClose={() => (setDetailsModalOpen(false), setNewRemark(""))} size="600" centered>
                <Modal.Overlay />
                <Modal.Content className="">
                    <Modal.Header>
                        <Modal.Title>
                            <div className="ml-8 text-2xl text-aggie-maroon font-bold">
                                {`${detailsFileName} Details`}
                            </div>
                        </Modal.Title>
                        <Modal.CloseButton style={{color: '#500000'}} size="xl"/>
                    </Modal.Header>
                    <Modal.Body className="!h-[44rem]">
                        <div className=" h-full w-full flex flex-col">
                            <div className="basis-4/6">
                                
                                {
                                    !documentDetails?.valid ?
                                        <div className="text-2xl text-aggie-maroon font-bold ml-4 flex flex-col">
                                            <div>Document Voided</div>
                                            <div className="mx-auto">
                                                {documentDetails?.voidRemarks}
                                            </div>
                                            <div className="flex justify-evenly text-xl">
                                                <div>{documentDetails?.voidUser}</div>
                                                <div>{moment.utc(documentDetails?.uploadDateTime).format('MMM Do YYYY, hh:mm A')}</div>
                                            </div>
                                        </div>
                                    :
                                    <></>
                                }
                                <div className="text-2xl text-aggie-maroon font-bold ml-4 mb-4">Remarks</div>
                                <div className="border-4 border-aggie-maroon rounded-xl py-4 overflow-auto mx-4 max-h-104">
                                    {
                                        documentDetails?.remarks.map((remark, idx) => (
                                                <div>
                                                    <div className="text-2xl text-aggie-maroon font-bold ml-4 flex flex-col" key={idx}>
                                                        <div className="mx-auto">
                                                            {remark.remark}
                                                        </div>
                                                        <div className="flex justify-evenly text-xl">
                                                            <div>{remark.remarkUser}</div>
                                                            <div>{moment.utc(remark.remarkDate).format('MMM Do YYYY, hh:mm A')}</div>
                                                        </div>
                                                    </div>
                                                    {
                                                        idx != documentDetails.remarks.length - 1 ?
                                                            <div className="w-full flex justify-center my-2">
                                                                <Divider size={4} style={{width:'90%', height: '100%'}} color={'#500000'}/>
                                                            </div>
                                                        :
                                                            <></>
                                                    }
                                                </div>
                                        ))
                                    }
                                </div>
                            </div>
                            <div className="basis-2/6 flex flex-col w-full">
                                <div className="px-4 text-2xl font-bold pt-2 text-aggie-maroon">
                                    New Remark
                                </div>
                                <Textarea
                                    value={newRemark}
                                    onChange={(event) => setNewRemark(event.currentTarget.value)}
                                    className="!w-full px-4 mx-auto mt-4 !border-aggie-maroon"
                                    radius="md"
                                    placeholder="New Remark"
                                    size="md"
                                    styles={{input: {height: "7rem", borderColor: "#500000", borderWidth: "4px"}}}
                                />
                                <div className="w-full flex justify-between px-4">
                                    <button className="text-2xl text-aggie-maroon font-bold border-4 border-aggie-maroon w-fit px-4 mt-4 rounded-xl">
                                        Void Document
                                    </button>
                                    <button className="text-2xl text-aggie-maroon font-bold border-4 border-aggie-maroon w-fit px-4 mt-4 rounded-xl" onClick={addNewRemark}>
                                        Add New Remark
                                    </button>
                                </div>
                            </div>

                                <div>
                                    <button 
                    className="mt-4 px-4 py-2 bg-aggie-maroon text-white rounded-md border-2 border-aggie-maroon hover:bg-white hover:text-aggie-maroon transition-colors"
                    type="submit"
                    onClick={handleOpenVoidDocModal}
                >
                    Void
                </button>
                                </div>
                                <Modal 
                                    opened={isVoidDocModalOpen} 
                                    onClose={handleCloseVoidDocModal}
                                    size="lg" 
                                >
                                    <VoidDoc docId={documentDetails?.documentId} onClose={handleCloseVoidDocModal}/>


                                </Modal>
                        </div>
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>
        </div>
    );
}
