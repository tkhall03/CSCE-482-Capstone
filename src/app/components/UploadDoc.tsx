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
    taskDescription: string
}

interface UploadDocumentProps{
    classId: number;
    className: string;
    deptNo: number;
}
export default function UploadDoc({
    classId = 15,
    className = "MART 102",
    deptNo = 1
}){

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
    const currentDocRemarks = watch("docRemarks");
    const currentDocType = watch("docType");
    const currentTasks = watch("tasks");

    const onSubmit = async (data: any) => {
        try {
            console.log("Form submitted with data:", data);
            // Make your async request here, e.g., an API call
        } catch (e) {
            console.error("Submission error:", e);
        }
    };
    return(
        <form onSubmit={handleSubmit(onSubmit)}>
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
            data={['Syllabus', 'Attendance', 'Sample Test/DOA']}
            {...register("docType", { required: true })}
            onChange={(value) => setValue("docType", value)}
        />

        <TextInput 
            label="Document Remarks" 
            placeholder="Type remarks here" 
            {...register("docRemarks", {required: true})}
            onChange={(e) => setValue("docRemarks", e.currentTarget.value)}
        />
        
        { currentDocType === 1 &&  (
            <MultiSelect
            label={`Tasks for ${className}`}
            placeholder="Pick tasks this document supports"
            data={['1', '2', '3', '4']}
            {...register("tasks")} 
            onChange={(selectedValues) => setValue("tasks", selectedValues)}
            />
        )}

    <button type="submit">Submit</button>
       


    </form>
    );
    
}
