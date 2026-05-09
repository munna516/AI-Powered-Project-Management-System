"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";
import TopNavbar from "@/components/TopNavbar/TopNavbar";
import TokenGuard from "@/lib/api/TokenGuard";

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const isChatbotPage = pathname === "/project-chatbot";
    const isNotificationsPage = pathname === "/all-notifications";
    const hideTopNavbar = isChatbotPage || isNotificationsPage;

    return (
        <div className="min-h-screen md:h-screen flex flex-col md:flex-row bg-slate-100/50 text-slate-900 md:overflow-hidden">
            <TokenGuard />
            <Sidebar bgColor="bg-[#201B51]" />

            <div className={`flex-1 flex flex-col min-h-0 ${isNotificationsPage ? "overflow-y-auto" : ""}`}>
                {!hideTopNavbar && <TopNavbar />}
                <main className={`flex-1 px-4 pb-8 md:px-10 md:pb-8 ${isChatbotPage ? "pt-2 md:pt-4 overflow-hidden h-full" : "pt-5 md:pt-10 overflow-y-auto"}`}>
                    <div className={`w-full ${isChatbotPage ? "h-full" : ""}`}>{children}</div>
                </main>
            </div>
        </div>
    );
}
