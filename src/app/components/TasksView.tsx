import { Text, Card, Stack } from '@mantine/core';

interface Task { 
    taskId: number;
    taskCode: string;
    description: string;
    nvicCode: string;
    nvicDescription: string;
}

interface TasksViewProps {
    tasks: Task[];
}

export default function TasksView({ tasks }: TasksViewProps) {
    return (
        <div className="h-screen w-full flex justify-start">
            <Stack gap="md">
                {tasks.map((task: Task) => (
                    <Card key={task.taskCode} shadow="sm" padding="lg" radius="md" withBorder
                    styles={{
                        root: {
                            borderColor: '#500000',
                            borderWidth: '5px',
                            borderStyle: 'solid', 
                        },
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text fw={500}>{task.taskCode}</Text>
                            <Text color="dimmed" size="sm">
                                NVIC Code: {task.nvicCode}
                            </Text>
                        </div>
                        <Text size="sm" color="dimmed" mt="xs">
                            {task.description}
                        </Text>
                    </Card>
                ))}
            </Stack>
        </div>
    );
}
