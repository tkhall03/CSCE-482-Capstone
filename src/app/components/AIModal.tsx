import { Textarea } from '@mantine/core';
import { useState } from 'react'

interface AIModalProps {
  setIsAIModalOpen: (arg0: boolean) => void
}

export default function AIModal({ setIsAIModalOpen }: AIModalProps){

    const [aiModalContent, setAiModalContent] = useState([]);

    const [userInput, setUserInput] = useState('');

    async function fetchAIResponse(inputData: string) {
        try {
            const response = await fetch('https://csce482capstone.csce482capstone.me/chat/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ input: inputData }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorData = data;
                setAiModalContent([...aiModalContent, [inputData, `Error: ${errorData.message}`]]);
            } else {
                setAiModalContent([...aiModalContent, [inputData, data.results]]);
            }

            setUserInput("");

        } catch (error) {
            console.error("Error fetching AI response:", error);
            setAiModalContent([...aiModalContent, [inputData, "Failed to fetch AI response."]]);
        }
    }

    const AIChatLog = ({ className }: { className: string }) => {
        return (
            <div className={className} data-testid="chatContent">
                {aiModalContent.map((log, index) => (
                    <div key={index}>
                        <div className="h-fit text-white p-2.5 m-4 mr-12 border-2 border-aggie-maroon bg-aggie-maroon mb-4 rounded-md relative">
                            <div className="absolute bottom-2 -left-4 w-0 h-0 border-l-[16px] border-r-[16px] border-b-0 border-t-8 border-l-transparent border-r-transparent border-aggie-maroon"/>
                            {log[0]}
                        </div>
                        <div className="h-fit p-2.5 m-4 ml-12 border-2 border-slate-200 bg-slate-200 mb-4 rounded-md relative">
                            <div className="absolute bottom-2 -right-4 w-0 h-0 border-l-[16px] border-r-[16px] border-b-0 border-t-8 border-l-transparent border-r-transparent border-slate-200"/>
                            {Array.isArray(log[1]) && log[1].length > 0?
                                (log[1].map((row, rowIndex) => (
                                       <div key={rowIndex}>
                                           {Object.entries(row).map(([key, value]: [string, string | number | null], entryIndex) => (
                                               <div key={entryIndex}>
                                                   <strong>{key}:</strong> {value}
                                               </div>
                                           ))}
                                       </div>
                                   )
                                 )
                                )
                            :
                                (log[1] && log[1].length > 0 ? log[1] : "No results found for the query.")
                            }
                        </div>
                    </div>))
                }
            </div>
        );
    }

    return(
        <div className={`fixed bottom-4 right-4 z-50 w-96 bg-white border-4 border-aggie-maroon rounded-lg h-[30rem]`}>
            <div className="flex justify-between items-center p-2 bg-aggie-maroon text-white">
                <span className="font-bold">AI Chat</span>
                <button
                    className="text-white"
                    onClick={() => setIsAIModalOpen(false)}
                    data-testid="closeButton"
                >
                    Close
                </button>
            </div>

            <div className="h-[87.5%] overflow-y-auto flex flex-col relative">
                <AIChatLog className="grow" />

                <div className="sticky bottom-0 h-fit bg-white">
                    <Textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type your query here..."
                        className="m-4"
                        autosize
                        minRows={4}
                        maxRows={4}
                    />

                    <div className="flex justify-around">
                        <button
                            onClick={() => {setUserInput("")}}
                            className="p-2 bg-aggie-maroon text-white rounded"
                        >
                            Clear Chat
                        </button>

                        <button
                            onClick={() => fetchAIResponse(userInput)}
                            className="p-2 bg-aggie-maroon text-white rounded"
                        >
                            Submit Query
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}