import type { Metadata } from "next";
import "./globals.css";

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
      </body>
    </html>
  );
}
