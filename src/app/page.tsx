'use client'

import NavBar from "./components/NavBar";
import Image from "next/image";

import altDescriptions from "./data/altDescriptions.json";

export default function Home() {

  function logIn(){
    window.location.href = "/classList";
  }

  return (
    <div className="flex flex-col h-screen">
      	<NavBar />
        <div className="relative flex-grow">
          <Image src="/mara.jpg" alt={altDescriptions.kennedy} layout="fill" objectFit="cover"/>
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="text-3xl font-bold px-20 py-6 bg-aggie-maroon text-white rounded-lg hover:bg-darker-aggie-maroon focus:outline-none" onClick={logIn}>
              Log In
            </button>
          </div>
        </div>
    </div>
  );
}
