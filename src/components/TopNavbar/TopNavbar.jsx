"use client";

import { FaBell } from "react-icons/fa";
import { FiCheck } from "react-icons/fi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import { apiGet, apiPatch, logoutAndRedirect } from "@/lib/api";
import toast from "react-hot-toast";

const PROFILE_QUERY_KEY = ["userProfile"];
const PROFILE_GET_ENDPOINT = "/api/user/profile/me";
const NOTIFICATIONS_QUERY_KEY = ["notifications"];

function formatRelativeTime(dateString) {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Just now";
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

export default function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedNotification, setSelectedNotification] = useState(null);

  const { data: profileData } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => apiGet(PROFILE_GET_ENDPOINT),
  });

  const { data: notificationsResponse } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => apiGet("/api/project-manager/notifications"),
  });

  const readAllMutation = useMutation({
    mutationFn: () => apiPatch("/api/project-manager/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      toast.success("All notifications marked as read");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to mark as read");
    }
  });

  const readSingleMutation = useMutation({
    mutationFn: (id) => apiPatch(`/api/project-manager/notifications/read/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to mark as read");
    }
  });

  const rawNotifications = useMemo(() => {
    return Array.isArray(notificationsResponse?.data)
      ? notificationsResponse.data
      : Array.isArray(notificationsResponse?.data?.data)
        ? notificationsResponse.data.data
        : [];
  }, [notificationsResponse]);

  const notifications = useMemo(() => {
    return rawNotifications.map(n => ({
      id: n.id || n._id,
      title: n.title,
      type: n.type,
      link: n.link,
      message: n.message || n.content || "",
      timestamp: formatRelativeTime(n.createdAt),
      isRead: n.status === "READ",
      previousProjectSummary: n.previousProjectSummary
    }));
  }, [rawNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

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
          <button className="relative h-10 w-10 rounded-full flex items-center justify-center text-primary hover:bg-slate-100 cursor-pointer transition outline-none">
            <FaBell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0 -right-0 h-5 w-5 bg-primary border-2 border-white p-0.5 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
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
            <button 
              onClick={() => readAllMutation.mutate()}
              disabled={readAllMutation.isPending || unreadCount === 0}
              className="w-full bg-[#6051E2] text-white px-4 py-2.5 rounded-md flex items-center justify-center gap-2 font-medium hover:bg-[#4a3db8] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaBell className={`h-4 w-4 ${readAllMutation.isPending ? 'animate-bounce' : ''}`} />
              <span>{readAllMutation.isPending ? "Marking..." : "Mark as Read"}</span>
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
                <div key={notification.id} className="group/item">
                  <div 
                    onClick={() => {
                        setSelectedNotification(notification);
                        if (!notification.isRead) {
                            readSingleMutation.mutate(notification.id);
                        }
                    }}
                    className={`px-3 sm:px-4 py-4 hover:bg-slate-50 transition-colors cursor-pointer relative ${!notification.isRead ? 'bg-[#6051E2]/5' : ''}`}>
                    {!notification.isRead && (
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#6051E2] rounded-r-full" />
                    )}
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1">
                        <p className={`text-xs sm:text-sm leading-relaxed ${!notification.isRead ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                          {notification.message}
                        </p>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {notification.timestamp}
                        </span>
                      </div>
                      
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            readSingleMutation.mutate(notification.id);
                          }}
                          disabled={readSingleMutation.isPending}
                          className="h-7 w-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#6051E2] shadow-sm hover:bg-[#6051E2] hover:text-white hover:border-[#6051E2] transition-all duration-300 opacity-0 group-hover/item:opacity-100 scale-90 group-hover/item:scale-100 cursor-pointer"
                          title="Mark as read"
                        >
                          <FiCheck className="h-4 w-4" />
                        </button>
                      )}
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

      <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedNotification?.title || "Meeting Summary"}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4 text-sm text-slate-700">
            {selectedNotification?.type && (
                <div>
                    <span className="font-semibold text-slate-900">Type: </span>
                    {selectedNotification.type}
                </div>
            )}
            {selectedNotification?.message && (
                <div>
                    <span className="font-semibold text-slate-900">Message: </span>
                    {selectedNotification.message}
                </div>
            )}
            {selectedNotification?.link && (
                <div>
                    <span className="font-semibold text-slate-900">Link: </span>
                    <a href={selectedNotification.link} target="_blank" rel="noreferrer" className="text-[#6051E2] hover:underline break-all">
                        {selectedNotification.link}
                    </a>
                </div>
            )}
            <div>
                <h2 className="text-lg font-bold text-slate-900 mb-2 mt-4">Project Summary</h2>
                <div className="whitespace-pre-wrap">{selectedNotification?.previousProjectSummary || "Not Found"}</div>
            </div>
            {!selectedNotification?.title && !selectedNotification?.message && !selectedNotification?.previousProjectSummary && (
                <div>No summary available.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
