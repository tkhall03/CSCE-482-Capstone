import Image from 'next/image'

export default function DocumentItem({document, edit, className}: {document: string, edit: string, className: string}) { //supports upload, delete, edit, etc
    return (
        <div className={"flex w-[98%] border-b-2 m-auto text-slate-500 p-1 " + className}>
            <div className="text-left grow-[0.5] pl-8">{document.name}</div>
            <div className="text-right grow">  {`${(edit.type === "Delete"? edit.type + "d": edit.type + "ed")} by ${edit.name} - ${edit.date}`}</div>
            <button className="text-right grow-[0.5] text-black pr-8">More Details</button>
        </div>
    );
}