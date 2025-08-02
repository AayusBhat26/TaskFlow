import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/context/ToastContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { GlobalRouteLoading } from "@/components/common/GlobalRouteLoading";
import { PerformanceMonitor } from "@/components/common/PerformanceMonitor";
import { Suspense } from "react";

const locales = ["en"];

export const metadata: Metadata = {
  title: "TaskFlow - Fast Task Management",
  description: "Lightning-fast task management and collaboration platform",
  metadataBase: new URL('https://taskflow.app'),
  keywords: ['task management', 'productivity', 'collaboration', 'workspace'],
  authors: [{ name: 'TaskFlow Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://taskflow.app',
    siteName: 'TaskFlow',
    title: 'TaskFlow - Fast Task Management',
    description: 'Lightning-fast task management and collaboration platform',
  },
};

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const isValidLocale = locales.some((cur) => cur === locale);
  if (!isValidLocale) notFound();

  //@ts-ignore
  const messages = await getMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root{--background:0 0% 100%;--foreground:240 10% 3.9%;--primary:221 83% 53%;--primary-foreground:210 40% 98%}
            [data-theme='dark']{--background:240 10% 3.9%;--foreground:0 0% 98%}
            *{border-color:hsl(var(--border))}
            body{background-color:hsl(var(--background));color:hsl(var(--foreground));font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto',sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
            .container{width:100%;margin-left:auto;margin-right:auto;padding-left:2rem;padding-right:2rem}
            @media(min-width:1400px){.container{max-width:1400px}}
            .btn-primary{background-color:hsl(var(--primary));color:hsl(var(--primary-foreground));padding:0.5rem 1rem;border-radius:0.375rem;font-weight:500;transition:background-color 0.2s}
            .btn-primary:hover{background-color:hsl(var(--primary)/0.9)}
            @keyframes spin{to{transform:rotate(360deg)}}
            .loading{animation:spin 1s linear infinite}
          `
        }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://github.com" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://utfs.io" />
        <link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <QueryProvider>
              <ThemeProvider>
                <ToastProvider>
                  <Suspense fallback={null}>
                    <Toaster />
                  </Suspense>
                  <Suspense fallback={null}>
                    <GlobalRouteLoading />
                  </Suspense>
                  <PerformanceMonitor />
                  {children}
                </ToastProvider>
              </ThemeProvider>
            </QueryProvider>
          </Suspense>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
