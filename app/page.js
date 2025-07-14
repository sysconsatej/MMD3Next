"use client";
import Image from "next/image";
import { countStore } from "@/store";
import Button from "@/components/button/button";
import Navbar from "@/components/Navbar/Navbar";
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';


export default function Home() {

  const { count, increase, reset } = countStore();
  console.log("Hello World")



  return (
    <>
      <Navbar />
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <p>{count}</p>
          <Button text="Increase" size="large" bg="purple" buttonStyles='!bg-purple-500 hover:bg-purple-600' onClick={increase} />
          <Button text="Reset" size="medium" onClick={reset} />
          <Button text="Go to about page" size="small" href="https://www.google.com/" startIcon={<SendIcon />} endIcon={<DeleteIcon />} />
        </main>
      </div>
    </>
  );
}
