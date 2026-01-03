"use client";

import Image from "next/image";
import { FaBell } from "react-icons/fa";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

// Dummy notification data
const notifications = [
    {
        id: 1,
        message: "AI analyzed meetings, emails and docs and identified potential delivery risks. Timeline may be affected if delays occur.",
        timestamp: "30m ago",
    },
    {
        id: 2,
        message: "AI analyzed meetings, emails and docs and identified potential delivery risks. Timeline may be affected if delays occur.",
        timestamp: "30m ago",
    },
    {
        id: 3,
        message: "AI analyzed meetings, emails and docs and identified potential delivery risks. Timeline may be affected if delays occur.",
        timestamp: "30m ago",
    },
];

export default function TopNavbar() {
    const [notificationCount] = useState(notifications.length);

    return (
        <header className="h-16 bg-white hidden md:flex items-center justify-end px-3 md:px-10 gap-6">
            {/* Notification icon with dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="relative h-10 w-10 rounded-full flex items-center justify-center text-primary hover:bg-slate-100 cursor-pointer transition">
                        <FaBell className="h-5 w-5" />
                        {notificationCount > 0 && (
                            <span className="absolute -top-0 -right-0 h-5 w-5 bg-primary  border-2 border-white p-0.5 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                                {notificationCount > 9 ? "9+" : notificationCount}
                            </span>
                        )}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-[calc(100vw-2rem)] sm:w-80 md:w-96 bg-white border-slate-200 shadow-lg p-0 mt-2 rounded-lg"
                >
                    {/* Header */}
                    <div className="px-3 sm:px-4 py-3 border-b border-slate-200 bg-slate-50">
                        <button className="w-full bg-[#6051E2] text-white px-4 py-2.5 rounded-md flex items-center justify-center gap-2 font-medium hover:bg-[#4a3db8] transition-colors cursor-pointer">
                            <FaBell className="h-4 w-4" />
                            <span>Notification</span>
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-slate-500 text-sm">
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification, index) => (
                                <div key={notification.id}>
                                    <div className="px-3 sm:px-4 py-4 hover:bg-slate-50 transition-colors cursor-pointer">
                                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                                            <p className="text-xs sm:text-sm text-slate-700 flex-1 leading-relaxed">
                                                {notification.message}
                                            </p>
                                            <span className="text-xs text-slate-500 flex-shrink-0 whitespace-nowrap mt-0.5">
                                                {notification.timestamp}
                                            </span>
                                        </div>
                                    </div>
                                    {index < notifications.length - 1 && (
                                        <div className="h-px bg-slate-200 mx-3 sm:mx-4" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Avatar + name */}
            <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 rounded-full overflow-hidden">
                    <Image
                        src="https://t3.ftcdn.net/jpg/00/07/32/48/360_F_7324855_mx4CEBWTr81XLOrlQccCROtP2uNR7xbk.jpg"
                        alt="Robert Smith"
                        fill
                        sizes="36px"
                        className="object-cover"
                    />
                </div>
                <p className="text-sm font-medium text-slate-800">Robert Smith</p>
            </div>
        </header>
    );
}
