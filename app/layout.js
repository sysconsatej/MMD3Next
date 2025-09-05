import { Navbar } from "@/components/navbar";
import "./globals.css";

export const metadata = {
  title: "MMD3",
  description:
    "MMD3 portal is designed as a single platform for Shipping Lines, CHA, Freight Forwarders, NVOCC, Weighbridge to carry out their Export/Import processes seamlessly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
