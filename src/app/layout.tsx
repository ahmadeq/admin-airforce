import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SideMenu } from "@/components/shared/Sidemenu";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Assesment Exam Admin Area",
  description: "Air Force Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-black`}>
        <div className="flex h-screen">
          {/* <SideMenu /> */}
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
