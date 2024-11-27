// ####################################
//         CLASS PAGE
// ####################################

export interface ClassData{
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

export interface DocumentProp{
    documentID: number,
    type: string,
    nameUploader: string,
    timeUploaded: string,
    valid: boolean,
    fileName: string,
    tasks: Task[]
}

export interface Task { 
    taskId: number,
    taskCode: string,
    description: string,
    nvicCode: string,
    nvicDescription: string
}

export interface Nvic { 
    nvicId: number,
    nvicDescription: string,
    nvicCode: string,
    tasks: Task[]
}

export interface STCW { 
    stcwDescription: string
    stcwId: number,
    stcwCode: string,
    nvics: Nvic[]
}

export interface DocType {
    docTypeId: number,
    type: string
}

export interface DocumentInfo{
    documentId: number,
    valid: boolean,
    voidRemarks: string,
    voidUser: string,
    voidDateTime: string,
    uploadUser: string,
    uploadDateTime: string,
    remarks: Remark[]
}

export interface Remark{
    remark: string,
    remarkUser: string,
    remarkDate: string
}

export interface Remark{
    remark: string,
    remarkUser: string,
    remarkDate: string
}