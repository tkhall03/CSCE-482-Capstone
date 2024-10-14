'use client'

import NavBar from "../components/NavBar";
import Wrapper from "../components/Wrapper";

import { useState, useEffect } from 'react'
import { Divider } from '@mantine/core';
import { DIVIDER_SIZES } from '@mantine/core';
import { IconAlertTriangleFilled } from '@tabler/icons-react';

interface Section{
    sectionNumber: string
    SampleTestDOA: number,
    Syllabus: number,
    Attendance: number,
    taskComplete: number
}

interface Class{
    primaryKey: number,
    className: string,
    designation: number,
    taskRequired: number,
    sections: Section[]
}

interface ClassList{
    term: string,
    status: boolean,
    classes: Class[]
}


export default function classList(){
    
    const [classes, setClasses] = useState<ClassList[]>([]);
    // {term: "", status: false, classes: []}

    async function fetchClasses(){
        let response = await fetch('http://localhost:4000/classes')
        let data = await response.json()
        console.log(data)
        setClasses(data)
    }

    useEffect(() => {
        fetchClasses()
    }, [])

    function getStatusTasks(classSection: Section, designation: number, numTaskRequired: number, active: boolean){

        let numStatusComplete = classSection.SampleTestDOA + classSection.Attendance + classSection.Syllabus
        let numTaskComplete = classSection.taskComplete

        // <div className={`text-${numStatusComplete == 3 ? "green-600 " : "red-700 "} mx-2 ${active ? "" : "text-opacity-40 "}`}>Status: {numStatusComplete}/3</div>
        // <div className={`text-${numTaskComplete == numTaskRequired ? "green-600 " : "red-700 "} mx-2 ${active ? "" : "text-opacity-40 "}`}>Tasks: {numTaskComplete}/{numTaskRequired}</div>

        if(numStatusComplete == 3){
            console.log("meer");
        }

        return(
            <div className="flex">
                <div className="flex">
                    <div className={`${numStatusComplete == 3 ? "" : "text-ut-orange "} mx-2 ${active ? "" : "text-opacity-40 "}`}>Status: {numStatusComplete}/3</div>
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
                            <Divider size={8} label={term.term}  styles={{ label: { color: `${!term.status? '#50000066' : '#500000'}`,  fontSize: '30px', fontWeight: 'bold'} }} labelPosition="center" color={`${!term.status? '#50000066' : '#500000'}`}/>
                                {
                                    term.classes.map((termClass, idx) => (
                                        <div key={idx}>
                                            <Wrapper label={termClass.className} className="m-2 bg-inherit " disabled={!term.status}>
                                                {
                                                    termClass.sections.map((classSection, i) => (
                                                        <button key={i} className={`z-10 mx-10 font-bold border-4 rounded-xl ${term.status ? "border-aggie-maroon text-aggie-maroon" : "border-fadded-aggie-maroon text-fadded-aggie-maroon" }`}>
                                                            <div className="flex flex-col p-2">
                                                                <div>Section: {classSection.sectionNumber}</div>
                                                                {getStatusTasks(classSection, termClass.designation, termClass.taskRequired, term.status)}
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

