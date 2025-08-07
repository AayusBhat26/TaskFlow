import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ToastProvider } from "@/context/ToastContext";
import { QueryProvider } from "@/providers/QueryProvider";
import ClientSessionProvider from "@/components/ClientSessionProvider";
import { SocketProvider } from "@/context/SocketProvider";

export const metadata: Metadata = {
  title: "TaskFlow - Fast Task Management",
  description: "Lightning-fast task management and collaboration platform",
  metadataBase: new URL('https://taskflow.app'),
  keywords: ['task management', 'productivity', 'collaboration', 'workspace'],
  authors: [{ name: 'TaskFlow Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
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
          <ThemeProvider>
            <QueryProvider>
              <SocketProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </SocketProvider>
            </QueryProvider>
          </ThemeProvider>
        </ClientSessionProvider>
      </body>
    </html>
  );
}