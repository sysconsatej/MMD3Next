import { Navbar } from "@/components/navbar";
import Sidebar from "@/components/sidebar/sidebar";
import "./globals.css";
import CustomModal from "@/components/customModal/customModal";

export const metadata = {
  title: "MMD3",
  description:
    "MMD3 portal is designed as a single platform for Shipping Lines, CHA, Freight Forwarders, NVOCC, Weighbridge to carry out their Export/Import processes seamlessly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="h-screen flex flex-col">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <Navbar />
            <main className=" bg-gray-100 overflow-y-auto h-[calc(100vh-46px)] ">
              {children}
            </main>
          </div>
        </div>
        <CustomModal  />
      </body>
    </html>
  );
}
