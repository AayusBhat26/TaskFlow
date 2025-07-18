import type { Metadata } from "next";
import "./globals.css";
import ClientSessionProvider from "@/components/ClientSessionProvider";
export const metadata: Metadata = {
  title: "TaskFlow",
  description: "Task management and collaboration platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClientSessionProvider session ={null}>
          {children}
        </ClientSessionProvider>
        {children}
      </body>
    </html>
  );
}
