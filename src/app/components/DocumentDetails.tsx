import { Divider, Modal, Textarea } from '@mantine/core';
import moment from 'moment';
import VoidDoc from './VoidDoc';
import { DocumentInfo } from "./interfaces"

interface DocumentDetailsProps {
    isVoidDocModalOpen: boolean,
    handleOpenVoidDocModal: () => void,
    handleCloseVoidDocModal: () => void,
    documentDetails: DocumentInfo,
    newRemark: string,
    setNewRemark: (arg0: string) => void,
    fetchDocumentData: (arg0: number) => void,
    closeDetailsModal: () => void,
    detailsModalOpen: boolean,
    detailsFileName: string,
    onDocumentVoided: () => void;
}

export default function DocumentDetails(
    {
        isVoidDocModalOpen, 
        handleOpenVoidDocModal,
        handleCloseVoidDocModal, 
        documentDetails, 
        newRemark, 
        setNewRemark, 
        fetchDocumentData,
        closeDetailsModal, 
        detailsModalOpen, 
        detailsFileName,
        onDocumentVoided
    }: DocumentDetailsProps){
    
    async function addNewRemark(){
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

    return(
        <Modal.Root opened={detailsModalOpen} onClose={closeDetailsModal} size="600" centered data-testid="documentDetails"> 
            <Modal.Overlay />
            <Modal.Content className="" data-testid="documentDetailsContent">
                <Modal.Header>
                    <Modal.Title>
                        <div className="ml-8 text-2xl text-aggie-maroon font-bold">
                            {`${detailsFileName} Details`}
                        </div>
                    </Modal.Title>
                    <Modal.CloseButton style={{color: '#500000'}} size="xl" data-testid="closeButton"/>
                </Modal.Header>
                <Modal.Body className="!h-[44rem]">
                    <div className=" h-full w-full flex flex-col">
                        <div className="basis-4/6">
                            
                            {
                                !documentDetails?.valid ?
                                    <div className="text-2xl text-aggie-maroon font-bold ml-4 flex flex-col mb-2" data-testid="voidDiv">
                                        <div className='mb-2'>Document Voided</div>
                                        <div className=" p-4 text-2xl text-aggie-maroon font-bold flex flex-col border-aggie-maroon border-4 rounded-xl">
                                                <div className="mx-auto text-center">
                                                    {documentDetails?.voidRemarks}
                                                </div>
                                                <div className="flex justify-evenly text-xl">
                                                    <div>{documentDetails?.voidUser}</div>
                                                    <div>{moment.utc(documentDetails?.voidDateTime).format('MMM Do YYYY, hh:mm A')}</div>
                                                </div>
                                            </div>
                                    </div>
                                :
                                <></>
                            }
                            <div className="text-2xl text-aggie-maroon font-bold ml-4 mb-4">Remarks</div>
                            <div className="border-4 border-aggie-maroon rounded-xl py-4 overflow-auto mx-4 max-h-104">
                                {
                                    documentDetails?.remarks.map((remark, idx) => (
                                        <div key={idx}>
                                            <div className="text-2xl text-aggie-maroon font-bold ml-4 flex flex-col" key={idx}>
                                                <div className="mx-auto text-center">
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
                                data-testid="textArea"
                            />
                            <div className="w-full flex justify-between px-4">
                                <button className="text-2xl text-aggie-maroon font-bold border-4 border-aggie-maroon w-fit px-4 mt-4 rounded-xl" onClick={handleOpenVoidDocModal} data-testid="voidDocumentButton">
                                    Void Document
                                </button>
                                <button className="text-2xl text-aggie-maroon font-bold border-4 border-aggie-maroon w-fit px-4 mt-4 rounded-xl" onClick={addNewRemark}>
                                    Add New Remark
                                </button>
                            </div>
                        </div>

                            <div>
                            </div>
                            <Modal.Root opened={isVoidDocModalOpen} onClose={handleCloseVoidDocModal} size="lg">
                                <Modal.Overlay />
                                <Modal.Content data-testid="voidDocumentContent">
                                    <Modal.Header>
                                        <Modal.Title>View Tasks</Modal.Title>
                                        <Modal.CloseButton data-testid="voidCloseButton" />
                                    </Modal.Header>
                                    <Modal.Body>
                                        <VoidDoc docId={documentDetails?.documentId} onClose={() => {handleCloseVoidDocModal(); closeDetailsModal()}} onDocumentVoided={onDocumentVoided} />
                                    </Modal.Body>
                                </Modal.Content>
                            </Modal.Root>
                    </div>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
}