import React from 'react';
import Image from 'next/image'

export default function NavBar(){
    return (
        <div className="bg-aggie-maroon h-18 w-full flex justify-start" data-testid="NavBar">
            <Image src="/images/TAM-white.png" width="400" height="200" className='m-2 w-auto' alt="Texas A&M Logo" priority />
        </div>
    );
}