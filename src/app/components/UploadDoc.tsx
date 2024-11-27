import { useForm } from 'react-hook-form';
import { MultiSelect, TextInput, Select, Card } from '@mantine/core';
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { Group, Text, rem } from '@mantine/core';


interface Task { 
    taskId: number,
    taskCode: string,
    description: string,
    nvicCode: string,
    nvicDescription: string
}

// interface Nvic { 
//     nvicId: number,
//     nvicDescription: string,
//     nvicCode: string,
//     tasks: Task[]
// }

// interface STCW { 
//     stcwDescription: string
//     stcwId: number,
//     stcwCode: string,
//     nvics: Nvic[]
// }

interface DocType {
    docTypeId: number,
    type: string
}
interface UploadDocumentProps{
    classId?: number | null;
    className?: string | null;
    docTypes: DocType[];
    tasks: Task[];
    onClose: () => void;
}

interface FormDataProps {
    files: FileList;
    docType: string;
    docRemarks: string;
    tasks?: number[];
}

export default function UploadDoc({
    classId,
    className,
    docTypes,
    tasks,
    onClose
}: UploadDocumentProps) {
    const uniqueTasks = Array.from(new Map(tasks.map(task => [task.taskId, task])).values());
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
    const currentDocType = watch("docType");
    // const currentTasks = watch("tasks");
    const uploadedFile = watch("files");

    const onSubmit = async (data: FormDataProps) => {
        try {
            const formData = new FormData();
            formData.append("file", data.files[0]);
            formData.append("personId", "1");
            formData.append("classId", (classId?.toString()));
            formData.append("docType", data.docType);
            formData.append("remark", data.docRemarks);
            if (data.tasks) {
                data.tasks.forEach((taskId: number) => {
                    formData.append("taskIds", taskId.toString());
                });
            }

            const response = await fetch("https://csce482capstone.csce482capstone.me/api/Documents/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                console.log("Form submitted successfully");
                onClose();
            } else {
                alert("error uploading document");
            }
        } catch (e) {
            alert("error uploading document. " + e);
        }
    };

    return (
        <div className="bg-white h-screen flex flex-col p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white flex flex-col space-y-4">
                <Dropzone
                    data-testid="dropzone"
                    onDrop={(files) => {
                        console.log('accepted files', files);
                        setValue("files", files);                
                    }}
                    onReject={(files) => console.log('rejected files', files)}
                    maxSize={5 * (1024 ** 2)}
                    accept={[
                        MIME_TYPES.csv,
                        MIME_TYPES.doc,
                        MIME_TYPES.docx,
                        MIME_TYPES.pdf
                    ]}
                >
                    <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                        <Dropzone.Accept>
                            <IconUpload style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }} stroke={1.5} />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <IconX style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }} stroke={1.5} />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                            <IconPhoto style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }} stroke={1.5} />
                        </Dropzone.Idle>
                        <div>
                            <Text size="xl" inline>
                                Drag documents here or select a document to upload
                            </Text>
                            <Text size="sm" c="dimmed" inline mt={7}>
                                Attach your documents here
                            </Text>
                        </div>
                    </Group>
                </Dropzone>

                {uploadedFile && uploadedFile[0] && (
                    <Card 
                        data-testid="uploadedDocCard"
                        shadow="sm" 
                        padding="lg" 
                        withBorder
                        styles={{
                            root: {
                                width: '100%', 
                                backgroundColor: '#e6ffe6', // Light green background color
                                borderColor: '#90EE90',
                                borderWidth: '2px',
                                borderStyle: 'solid',
                                display: 'flex',
                                justifyContent: 'flex-start',
                                padding: '20px',
                                marginTop: '10px',
                            },
                        }}
                    >
                        <Text size="lg" inline>
                            {uploadedFile[0].name}
                        </Text>
                    </Card>
                )}

                <input type="hidden" {...register("files", { required: true })} />
                {errors.files && <Text color="red">Files are required.</Text>}

                <Select
                    data-testid="documentTypeSelection"
                    label="Document Type"
                    placeholder="Pick document type"
                    data={docTypes.map((dt) => ({
                        label: `${dt.type}`,
                        value: dt.docTypeId.toString()
                    }))}
                    {...register("docType", { required: true })}
                    onChange={(value) => {console.log("Selected value:", value); setValue("docType", value)}}
                />

                <TextInput 
                    data-testid="documentRemarks"
                    label="Document Remarks" 
                    placeholder="Type remarks here" 
                    {...register("docRemarks", { required: true })}
                    onChange={(e) => setValue("docRemarks", e.currentTarget.value)}
                />
                
                {currentDocType == 1 && (
                    <MultiSelect
                        data-testid="tasksSelection"
                        label={`Tasks for ${className}`}
                        placeholder="Pick tasks this document supports"
                        data={uniqueTasks.map((task) => ({
                            label: `Task: ${task.taskCode} - Nvic: ${task.nvicCode}`,
                            value: task.taskId.toString(),
                        }))}
                        {...register("tasks")} 
                        onChange={(selectedValues) => setValue("tasks", selectedValues)}
                    />
                )}

                <button 
                    data-testid="upload"
                    className="mt-4 px-4 py-2 bg-aggie-maroon text-white rounded-md border-2 border-aggie-maroon hover:bg-white hover:text-aggie-maroon transition-colors"
                    type="submit"
                >
                    Submit
                </button>
            </form>
        </div>
    );
}