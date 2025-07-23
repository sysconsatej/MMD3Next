import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MMD3",
  description:
    "MMD3 portal is designed as a single platform for Shipping Lines, CHA, Freight Forwarders, NVOCC, Weighbridge to carry out their Export/Import processes seamlessly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
