'use client'

import NavBar from "../components/NavBar";
import Wrapper from "../components/Wrapper";

import { useState, useEffect } from 'react'
import { Divider } from '@mantine/core';
import { DIVIDER_SIZES } from '@mantine/core';

interface Section{
    sectionNumber: string
}

interface Class{
    primaryKey: number,
    className: string,
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
                                                                <div>Status: 0/3</div>
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

