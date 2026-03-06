"use client";

import { FaBell } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import { apiGet, logoutAndRedirect } from "@/lib/api";

const PROFILE_QUERY_KEY = ["userProfile"];
const PROFILE_GET_ENDPOINT = "/api/user/profile/me";

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
  const pathname = usePathname();
  const router = useRouter();

  const { data: profileData } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => apiGet(PROFILE_GET_ENDPOINT),
  });

  const profile = profileData?.data;
  const userName = profile ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "User" : "User";
  const avatarUrl = profile?.avatarUrl;
  const avatarInitial = (profile?.firstName || "?").charAt(0).toUpperCase();
  const settingsPath = pathname?.startsWith("/admin") ? "/admin/settings" : "/settings";

  return (
    <header className="h-16 bg-white hidden md:flex items-center justify-end px-3 md:px-10 gap-6">
      {/* Notification icon with dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative h-10 w-10 rounded-full flex items-center justify-center text-primary hover:bg-slate-100 cursor-pointer transition">
            <FaBell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-0 -right-0 h-5 w-5 bg-primary border-2 border-white p-0.5 text-white text-xs font-semibold rounded-full flex items-center justify-center">
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

      {/* Avatar + dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className=" mr-3 flex items-center gap-3 cursor-pointer outline-none focus:outline-none rounded-full">
            <Avatar className="h-12 w-12 border-2 border-primary ring-2 ring-primary/20">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
              <AvatarFallback className="bg-primary text-white text-sm font-semibold">
                {avatarInitial}
              </AvatarFallback>
            </Avatar>
           
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-56 bg-white">
          <DropdownMenuLabel className="font-normal">
            <p className="text-lg font-medium text-slate-900">{userName}</p>
            {profile?.email && (
              <p className="text-sm text-slate-500 truncate">{profile.email}</p>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push(settingsPath)}
            className="cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            <p className="text-lg font-medium text-slate-900">Settings</p>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => logoutAndRedirect()}
            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <p className="text-lg font-medium text-red-600">Logout</p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
