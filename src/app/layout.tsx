import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/sidebar/Sidebar";

export const metadata: Metadata = {
  title: "Quan trắc chất lượng nước",
  description: "Tạo bởi The Innovators",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head></head>
      <body className="h-screen w-screen flex">
          <Sidebar />
          {children}
      </body>
    </html>
  );
}
