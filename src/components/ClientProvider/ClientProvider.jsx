"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";


export default function ClientProvider({ children }) {
    const [queryClient] = useState(() => new QueryClient());
    const pathname = usePathname();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

   
    return (
        <QueryClientProvider client={queryClient}>
            {/* <Toaster position="top-center" /> */}
            {children}
        </QueryClientProvider>
    );
}