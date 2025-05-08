import type { Metadata } from "next";
import { Toaster } from 'sonner';
import "./globals.css";
import 'react-calendar/dist/Calendar.css';
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

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
      <body>
          {children}
          <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
