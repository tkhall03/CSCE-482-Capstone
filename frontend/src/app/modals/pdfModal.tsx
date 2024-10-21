import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf';
import { HoverCard, TextInput } from '@mantine/core';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

export default function pdfModal(closeModal: () => void, pageNumber: number, setPageNumber: (pageNum: number) => void, documentBlob: string, handlePDFLoadSuccess: () => void, numPages: number){

    return(
        <div className="h-5/6 z-10">
        <HoverCard width={280} shadow="md">
            <HoverCard.Target>
                <Document className="h-full" file={`data:application/pdf;base64,${documentBlob}`}>
                    <Page pageNumber={pageNumber} />
                </Document>
            </HoverCard.Target>
        <HoverCard.Dropdown>
            <div className='flex'>
                <button>
                    <IconArrowRight stroke={2} />
                </button>
                <TextInput
                    value={pageNumber}
                    onChange={(event) => setPageNumber(Number(event.currentTarget.value))}
                />
                <div> of </div>
                <div>{numPages}</div>
                <button>
                    <IconArrowRight stroke={2} />
                </button>
            </div>
        </HoverCard.Dropdown>
      </HoverCard>
        </div>
    );
}