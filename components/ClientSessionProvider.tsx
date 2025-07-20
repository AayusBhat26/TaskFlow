"use client";

import { SessionProvider } from "next-auth/react";
import dynamic from "next/dynamic";

interface Props {
    children: React.ReactNode;
}

// Create a no-SSR wrapper for SessionProvider
const NoSSRSessionProvider = dynamic(
    () => {
        return Promise.resolve(({ children }: { children: React.ReactNode }) => (
            <SessionProvider>
                {children}
            </SessionProvider>
        ));
    },
    {
        ssr: false,
        loading: () => <>{/* Loading placeholder */}</>
    }
);

export default function ClientSessionProvider({ children }: Props) {
    return (
        <NoSSRSessionProvider>
            {children}
        </NoSSRSessionProvider>
    );
}