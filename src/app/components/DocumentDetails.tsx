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
    addNewRemark: () => void,
    closeDetailsModal: () => void,
    detailsModalOpen: boolean,
    detailsFileName: string
}

export default function DocumentDetails(
    {
        isVoidDocModalOpen, 
        handleOpenVoidDocModal,
        handleCloseVoidDocModal, 
        documentDetails, 
        newRemark, 
        setNewRemark, 
        addNewRemark,
        closeDetailsModal, 
        detailsModalOpen, 
        detailsFileName
    }: DocumentDetailsProps){
    
    return(
        <Modal.Root opened={detailsModalOpen} onClose={closeDetailsModal} size="600" centered>
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
                                        <div key={idx}>
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
                                <button className="text-2xl text-aggie-maroon font-bold border-4 border-aggie-maroon w-fit px-4 mt-4 rounded-xl" onClick={handleOpenVoidDocModal}>
                                    Void Document
                                </button>
                                <button className="text-2xl text-aggie-maroon font-bold border-4 border-aggie-maroon w-fit px-4 mt-4 rounded-xl" onClick={addNewRemark}>
                                    Add New Remark
                                </button>
                            </div>
                        </div>

                            <div>
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
    );
}