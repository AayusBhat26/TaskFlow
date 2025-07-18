"use client";

import { SessionProvider } from "next-auth/react";
export default function ClientSessionProvider({
    children,
    session
}: Readonly<{
    children: React.ReactNode;
    session:any
}>) {
    return <SessionProvider>{children}</SessionProvider>;
}