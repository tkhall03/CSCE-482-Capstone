'use client'

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { MultiSelect, TextInput, Select } from '@mantine/core';
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { Group, Text, rem } from '@mantine/core';

interface Task { 
    taskId: number,
    taskCode: string,
    description: string,
    nvicCode: string
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
interface UploadDocumentProps{
    classId?: number | null;
    className?: string | null;
}
export default function UploadDoc({
    classId,
    className,
}: UploadDocumentProps) {

    const [tasks, setTasks] = useState<Task[]>([]);
    const [docTypes, setdocTypes] = useState<DocType[]>([]);
    async function fetchTaskData(classId: number){
        let response = await fetch(`https://localhost:7096/classes/getTasksForClass/${classId}`)
        let data = await response.json()
        const fetchedTasks: Task[] = [];

        data.forEach((stcw: STCW) => {
            stcw.nvics.forEach((nvic: Nvic) => {
                nvic.tasks.forEach((task: Task) => {
                    // console.log(task);
                    fetchedTasks.push({
                        ...task,
                        nvicCode: nvic.nvicCode
                    });
                });
            });
        });
        setTasks(fetchedTasks);
    }

    async function fetchDocTypes(){
        let response = await fetch(`https://localhost:7096/api/Documents/types`)
        let data = await response.json() 
        const fetchedDocTypes: DocType[] = [];
        data.forEach((docType: DocType) => {
            fetchedDocTypes.push(docType)
        });
        setdocTypes(fetchedDocTypes);

    }

    const docTypeMap: Record<"Syllabus" | "Attendance" | "Sample Test/DOA", number> = {
        "Syllabus": 2,
        "Attendance": 3,
        "Sample Test/DOA": 1,
    };

    useEffect(() => {
        if (typeof classId === "number") {
            fetchTaskData(classId);
            fetchDocTypes();
        }
    }, []);


    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
    const currentDocRemarks = watch("docRemarks");
    const currentDocType = watch("docType");
    const currentTasks = watch("tasks");
    const [docType, setDocType] = useState<number>();
    const onSubmit = async (data: any) => {
        try {
            const formData = new FormData();
            formData.append("file", data.files[0]);
            formData.append("personId", "1");
            formData.append("classId", (classId?.toString() ?? ""));
            formData.append("docType", data.docType);
            formData.append("remark", data.docRemarks);
            data.tasks.forEach((taskId: number) => {
                formData.append("taskIds", taskId.toString());
            });
    
            const response = await fetch("https://localhost:7096/api/Documents/upload", {
                method: "POST",
                body: formData,
            });
    
            if (response.ok) {
                console.log("Form submitted successfully");
            } else {
                console.error("Error submitting form");
            }
        } catch (e) {
            console.error("Submission error:", e);
        }
    };
    return(
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white w-screen h-screen flex flex-col">
        <Dropzone
        onDrop={(files) => {
            console.log('accepted files', files);
            setValue("files", files);                
        }}
        onReject={(files) => console.log('rejected files', files)}
        maxSize={5 * 1024 ** 2}
        accept={[
            MIME_TYPES.csv,
            MIME_TYPES.doc,
            MIME_TYPES.docx,
            MIME_TYPES.pdf
        ]}
        >
        <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
            <Dropzone.Accept>
            <IconUpload
                style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }}
                stroke={1.5}
            />
            </Dropzone.Accept>
            <Dropzone.Reject>
            <IconX
                style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }}
                stroke={1.5}
            />
            </Dropzone.Reject>
            <Dropzone.Idle>
            <IconPhoto
                style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }}
                stroke={1.5}
            />
            </Dropzone.Idle>

            <div>
            <Text size="xl" inline>
                Drag documents here or select a documet to upload
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
                Attach your documents here
            </Text>
            </div>
        </Group>
        </Dropzone>
        <input type="hidden" {...register("files", { required: true })} />
        {errors.files && <Text color="red">Files are required.</Text>}

        <Select
            label="Document Type"
            placeholder="Pick document type"
            data={docTypes.map((dt) => ({
                label: `${dt.type}`,
                value: dt.docTypeId.toString()
            }))}
            {...register("docType", { required: true })}
            onChange={(value) => {
                setValue("docType", value);
            }}
            
        />

        <TextInput 
            label="Document Remarks" 
            placeholder="Type remarks here" 
            {...register("docRemarks", {required: true})}
            onChange={(e) => setValue("docRemarks", e.currentTarget.value)}
        />
        
        { currentDocType == 1 &&  (
            <MultiSelect
            label={`Tasks for ${className}`}
            placeholder="Pick tasks this document supports"
            data={tasks.map((task) => ({
                label: `Task: ${task.taskCode} - Nvic: ${task.nvicCode}`,
                value: task.taskId.toString(),
            }))}
            {...register("tasks")} 
            onChange={(selectedValues) => {
                setValue("tasks", selectedValues)
                console.log(currentTasks);
            }}
            />
        )}

    <button type="submit">Submit</button>
       


    </form>
    );
    
}
