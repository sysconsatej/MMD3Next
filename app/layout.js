import { Navbar } from "@/components/navbar";
import Sidebar from "@/components/sidebar/sidebar";
import "./globals.css";
import CustomModal from "@/components/customModal/customModal";
import { Suspense } from "react";

export const metadata = {
  title: "MMD3",
  description:
    "MMD3 portal is designed as a single platform for Shipping Lines, CHA, Freight Forwarders, NVOCC, Weighbridge to carry out their Export/Import processes seamlessly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col">
        <div className="flex flex-row">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <Navbar />
            <main className="overflow-y-auto h-[calc(100vh-47px)] ">
              <Suspense>{children}</Suspense>
            </main>
          </div>
        </div>
        <CustomModal />
      </body>
    </html>
  );
}
