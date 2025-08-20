"use client";
import CustomButton from "@/components/button/button";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Home() {
  return (
    <>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <CustomButton
            text="Increase"
            size="large"
            buttonStyles="text-white !bg-[#000000] hover:!bg-blue-600"
          />
          <CustomButton text="Reset" size="medium" />
          <CustomButton
            text="Go to about page"
            target="_blank"
            size="small"
            cl
            href="https://www.google.com/"
            startIcon={<SendIcon />}
            endIcon={<DeleteIcon />}
          />
        </main>
      </div>
    </>
  );
}
