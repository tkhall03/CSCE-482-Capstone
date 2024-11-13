'use client'

import NavBar from "../components/NavBar";
import Wrapper from "../components/Wrapper";

import { useState, useEffect } from 'react'
import { Divider } from '@mantine/core';
import { IconAlertTriangleFilled } from '@tabler/icons-react';
import { useRouter } from 'next/navigation'

interface Section{
    classId: number,
    sectionNumber: string,
    sampleTestDOA: number,
    syllabus: number,
    attendance: number,
    taskRequired: number,
    taskCompleted: number,
    crn: number,
}

interface Class{
    catalogId: number,
    catalogName: string,
    designation: number,
    classes: Section[]
}

interface ClassList{
    termCode: string,
    termId: number,
    status: boolean,
    catalogs: Class[]
}


export default function ClassList(){
    
    const router = useRouter();

    const [classes, setClasses] = useState<ClassList[]>([]);

    async function fetchClasses(){
        const response = await fetch('https://localhost:7096/persons/getClasses/1');
        const data = await response.json()
        setClasses(data)
    }

    useEffect(() => {
        fetchClasses()
    }, [])

    function getStatusTasks(classSection: Section, designation: number, numTaskRequired: number, active: boolean){

        const numStatusComplete = classSection.sampleTestDOA + classSection.attendance + classSection.syllabus
        const numTaskComplete = classSection.taskCompleted

        return(
            <div className="flex">
                <div className="flex">
                    <div className={`${numStatusComplete == 3 ? "" : "text-ut-orange "} mx-2 ${active ? "" : "text-opacity-40 "}`}>Documents: {numStatusComplete}/3</div>
                    {
                        numStatusComplete != 3 ?
                            <IconAlertTriangleFilled className="fill-ut-orange"/>
                        :
                            <></>
                    }
                </div>
                    {
                        designation == 1 ?
                            <div className="flex">
                                <div className={`text-${numTaskComplete == numTaskRequired ? "" : "ut-orange "} mx-2 ${active ? "" : "text-opacity-40 "}`}>Tasks: {numTaskComplete}/{numTaskRequired}</div>
                                {
                                    numTaskComplete != numTaskRequired ?
                                        <IconAlertTriangleFilled className="fill-ut-orange"/>
                                    :
                                    <></>
                                }
                            </div>
                        :
                            <></>
                    }
            </div>
        )
    }

    return (
        <div className="bg-white w-full">
      	    <NavBar/>

            <div className="flex-col h-screen">
                {
                    classes.map((term, index) => (
                        <div key={index} className="w-full ">
                            <Divider size={8} label={term.termCode}  styles={{ label: { color: `${!term.status? '#50000066' : '#500000'}`,  fontSize: '30px', fontWeight: 'bold'} }} labelPosition="center" color={`${!term.status? '#50000066' : '#500000'}`}/>
                                {
                                    term.catalogs.map((termClass, idx) => (
                                        <div key={idx}>
                                            <Wrapper label={termClass.catalogName} className="m-2 bg-inherit " disabled={!term.status}>
                                                {
                                                    termClass.classes.map((classSection, i) => (
                                                            <button key={i} className={`z-10 mx-10 font-bold border-4 rounded-xl ${term.status ? "border-aggie-maroon text-aggie-maroon" : "border-fadded-aggie-maroon text-fadded-aggie-maroon" }`} 
                                                                onClick={() => router.push(`/class/${classSection.classId}`)}
                                                                            >
                                                                <div className="flex flex-col p-2">
                                                                    <div>Section: {classSection.sectionNumber}</div>
                                                                    {getStatusTasks(classSection, termClass.designation, classSection.taskRequired, term.status)}
                                                                </div>
                                                            </button>
                                                    ))
                                                }
                                            </Wrapper>
                                        </div>
                                    ))
                                }
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

