import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import ClientSessionProvider from "@/components/ClientSessionProvider";
import { SocketProvider } from "@/context/SocketProvider";

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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground transition-colors duration-300">
        <ClientSessionProvider>
          <SocketProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </SocketProvider>
        </ClientSessionProvider>
      </body>
    </html>
  );
}
