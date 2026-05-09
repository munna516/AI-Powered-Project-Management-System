"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FiBell, FiCheck, FiSearch, FiFilter } from "react-icons/fi";
import { IoCheckmarkDone } from "react-icons/io5";
import { apiGet, apiPatch } from "@/lib/api";
import Loading from "@/components/Loading/Loading";
import toast from "react-hot-toast";
import PageHeader from "@/components/PageHeader/PageHeader";

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

function groupNotifications(notifications) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = {
        Today: [],
        Yesterday: [],
        Older: [],
    };

    notifications.forEach((n) => {
        const date = new Date(n.createdAt);
        if (date >= today) groups.Today.push(n);
        else if (date >= yesterday) groups.Yesterday.push(n);
        else groups.Older.push(n);
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
}

export default function AllNotifications() {
    const queryClient = useQueryClient();
    const [searchValue, setSearchValue] = useState("");
    const [filter, setFilter] = useState("all"); // all, unread, read

    const { data: notificationsResponse, isLoading, isError, error } = useQuery({
        queryKey: NOTIFICATIONS_QUERY_KEY,
        queryFn: () => apiGet("/api/project-manager/notifications"),
    });

    const readAllMutation = useMutation({
        mutationFn: () => apiPatch("/api/project-manager/notifications/read-all"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
            toast.success("All notifications marked as read");
        },
    });

    const readSingleMutation = useMutation({
        mutationFn: (id) => apiPatch(`/api/project-manager/notifications/read/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
            toast.success("Marked as read");
        },
        onError: (err) => {
            toast.error(err.message || "Failed to mark as read");
        },
    });

    const notifications = useMemo(() => {
        const raw = Array.isArray(notificationsResponse?.data)
            ? notificationsResponse.data
            : Array.isArray(notificationsResponse?.data?.data)
                ? notificationsResponse.data.data
                : [];

        console.log("Notifications Data:", raw);

        return raw
            .map((n) => ({
                ...n,
                id: n.id || n._id,
                isRead: n.status === "READ",
            }))
            .filter((n) => {
                const textContent = (n.message || n.content || "").toLowerCase();
                const matchesSearch = textContent.includes(searchValue.toLowerCase());
                const matchesFilter = filter === "all" || (filter === "unread" ? !n.isRead : n.isRead);
                return matchesSearch && matchesFilter;
            });
    }, [notificationsResponse, searchValue, filter]);

    const groupedNotifications = useMemo(() => groupNotifications(notifications), [notifications]);

    if (isLoading) return <Loading />;

    if (isError) {
        return (
            <div className="p-8 text-center text-red-500">
                {error?.message || "Failed to load notifications"}
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <PageHeader
                title="All Notifications"
                description="Stay updated with your latest project insights"
                searchPlaceholder="Search notifications..."
                searchValue={searchValue}
                onSearchChange={(e) => setSearchValue(e.target.value)}
            />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                    {["all", "unread", "read"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all cursor-pointer ${filter === f
                                    ? "bg-white text-[#6051E2] shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <Button
                    onClick={() => readAllMutation.mutate()}
                    disabled={readAllMutation.isPending || notifications.filter(n => !n.isRead).length === 0}
                    className="bg-[#6051E2] hover:bg-[#4a3db8] text-white font-bold cursor-pointer"
                >
                    <FiCheck className="mr-2" /> Mark all as read
                </Button>
            </div>

            <div className="space-y-8 pb-10">
                {groupedNotifications.length === 0 ? (
                    <Card className="bg-slate-50 border-dashed border-2 border-slate-200">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <FiBell className="h-12 w-12 mb-4 opacity-20" />
                            <p className="font-medium italic">No notifications found matching your criteria</p>
                        </CardContent>
                    </Card>
                ) : (
                    groupedNotifications.map(([group, items]) => (
                        <div key={group} className="space-y-4">
                            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-3">
                                {group}
                                <div className="h-px bg-slate-200 flex-1" />
                            </h2>
                            <div className="grid gap-3">
                                {items.map((n) => (
                                    <Card
                                        key={n.id}
                                        className={`group transition-all duration-300 hover:shadow-md border-slate-200 ${!n.isRead 
                                            ? "bg-[#6051E2]/8 border-l-4 border-l-[#6051E2]" 
                                            : "bg-white shadow-sm"
                                        }`}
                                    >
                                        <CardContent className="p-4 sm:p-5">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <p className={`text-sm sm:text-base leading-relaxed ${!n.isRead ? "text-slate-900 font-bold" : "text-slate-600"
                                                        }`}>
                                                        {n.content || n.message}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-2 font-medium">
                                                        {formatRelativeTime(n.createdAt)}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        if (n.isRead) return;
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        readSingleMutation.mutate(n.id);
                                                    }}
                                                    disabled={readSingleMutation.isPending || n.isRead}
                                                    className={`h-9 w-9 rounded-full border flex items-center justify-center transition-all duration-300 ${n.isRead
                                                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 cursor-default"
                                                            : "bg-white border-slate-200 text-[#6051E2] shadow-sm hover:bg-[#6051E2] hover:text-white hover:border-[#6051E2] cursor-pointer"
                                                        }`}
                                                    title={n.isRead ? "Marked as Read" : "Mark as read"}
                                                >
                                                    {n.isRead ? (
                                                        <IoCheckmarkDone className="h-5 w-5" />
                                                    ) : (
                                                        <FiCheck className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
