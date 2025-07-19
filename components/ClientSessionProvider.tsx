"use client";

// import { SessionProvider } from "next-auth/react";

interface Props {
    children: React.ReactNode;
}

export default function ClientSessionProvider({ children }: Props) {
    return (
        // Temporarily disabled SessionProvider
        // <SessionProvider>
            {children}
        // </SessionProvider>
    );
}