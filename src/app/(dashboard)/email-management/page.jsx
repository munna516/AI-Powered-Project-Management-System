"use client";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FiMail, FiStar, FiAlertTriangle, FiFile } from "react-icons/fi";
import { FaLinkedin } from "react-icons/fa";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import PageHeader from "@/components/PageHeader/PageHeader";
import { CiSquareCheck } from "react-icons/ci";
import { PiShootingStar } from "react-icons/pi";
import { LuMessageSquareMore } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import DateFilter, { getDateRangeFromFilter } from "@/components/DateFilter/Datefilter";
import Loading from "@/components/Loading/Loading";
import { apiGet } from "@/lib/api";
import { SiGmail } from "react-icons/si";
import { PiMicrosoftOutlookLogo } from "react-icons/pi";
import { FaUserGroup } from "react-icons/fa6";
import { FaTag } from "react-icons/fa6";
import { FiRefreshCcw } from "react-icons/fi";

// Icon component for different email types
const EmailIcon = ({ category, type, iconLetter }) => {
    if (category === "promotions") {
        return (
            <div className="w-10 h-10 bg-white text-primary flex  items-center justify-center flex-shrink-0">
                <FaTag className="h-7 w-7 text-primary" />
            </div>
        );
    }
    if (category === "social") {
        return (
            <div className="w-10 h-10 bg-white text-primary flex  items-center justify-center flex-shrink-0">
                <FaUserGroup className="h-7 w-7 text-primary" />
            </div>
        );
    }
    if (category === "personal") {
        return (
            <div className="w-10 h-10 bg-white text-primary flex  items-center justify-center flex-shrink-0">
                <FiMail className="h-7 w-7 text-primary" />
            </div>
        );
    }
    if (category === "updated") {
        return (
            <div className="w-10 h-10 bg-white text-primary flex  items-center justify-center flex-shrink-0">
                <FiRefreshCcw className="h-7 w-7 text-primary" />
            </div>
        );
    }
    if (type === "outlook") {
        return (
                <div className="w-10 h-10 bg-white text-primary flex  items-center justify-center flex-shrink-0">
                    <PiMicrosoftOutlookLogo className="h-7 w-7 text-primary" />
                </div>
        );
    }
    if (type === "gmail") {
        return (
            <div className="w-10 h-10 bg-white text-primary flex  items-center justify-center flex-shrink-0">
                <SiGmail className="h-7 w-7 text-primary" />
            </div>
        );
    }
    return null;
};

// Source filter tabs
const sourceTabs = [
    { id: "all", label: "All" },
];

const EMAILS_QUERY_KEY = ["unified-inbox"];

const normalizeCategory = (category) => {
    const normalized = String(category || "").trim().toLowerCase();
    if (normalized === "promotions") return "promotions";
    if (normalized === "social") return "social";
    if (normalized === "personal") return "personal";
    if (normalized === "updated" || normalized === "updates") return "updated";
    return "all";
};

const getDisplayTitle = (email) => {
    return email.subject || email.senderEmail || email.receiverEmail || "Untitled email";
};

const getDisplayDescription = (email) => {
    return email.body || "No preview available";
};

const getEmailDate = (email) => {
    return email.receivedAt || email.createdAt || email.updatedAt || null;
};

const formatTimestamp = (dateValue) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
};

const extractEmailArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];

    const candidates = [
        payload.data,
        payload.data?.data,
        payload.emails,
        payload.items,
        payload.results,
    ];
    for (const candidate of candidates) {
        if (Array.isArray(candidate)) return candidate;
    }

    return [];
};

export default function EmailManagement() {
    const [searchValue, setSearchValue] = useState("");
    const [selectedSource, setSelectedSource] = useState("all");
    const [starredIds, setStarredIds] = useState([]);
    const [dateFilterState, setDateFilterState] = useState({
        filter: "all",
        startDate: null,
        endDate: null,
    });
    const router = useRouter();
    const { data: emailsResponse, isLoading, error } = useQuery({
        queryKey: EMAILS_QUERY_KEY,
        queryFn: () => apiGet("/api/project-manager/outlook/unified-inbox", { params: { category: "personal" } }),
    });

    const emails = useMemo(() => {
        const rawEmails = extractEmailArray(emailsResponse);
        return rawEmails.map((email) => ({
            ...email,
            category: normalizeCategory(email.category),
            title: getDisplayTitle(email),
            description: getDisplayDescription(email),
            timestamp: formatTimestamp(getEmailDate(email)),
            iconLetter: (email.type || email.senderEmail || "E").charAt(0).toUpperCase(),
        }));
    }, [emailsResponse]);

    const handleSourceChange = (sourceId) => {
        setSelectedSource(sourceId);
    };

    const filteredEmails = useMemo(() => {
        let filtered = emails;
        const { start, end } = getDateRangeFromFilter(
            dateFilterState.filter,
            dateFilterState.startDate,
            dateFilterState.endDate
        );

        // Filter by source
        if (selectedSource !== "all") {
            filtered = filtered.filter((email) => {
                return email.category === selectedSource;
            });
        }

        // Filter by search value
        if (searchValue.trim()) {
            const searchLower = searchValue.toLowerCase();
            filtered = filtered.filter(
                (email) =>
                    email.title.toLowerCase().includes(searchLower) ||
                    email.description.toLowerCase().includes(searchLower) ||
                    String(email.senderEmail || "").toLowerCase().includes(searchLower) ||
                    String(email.receiverEmail || "").toLowerCase().includes(searchLower)
            );
        }

        // Filter by date
        if (start || end) {
            filtered = filtered.filter((email) => {
                const emailDateValue = getEmailDate(email);
                if (!emailDateValue) return false;

                const emailDate = new Date(emailDateValue);
                if (Number.isNaN(emailDate.getTime())) return false;
                if (start && emailDate < start) return false;
                if (end && emailDate > end) return false;
                return true;
            });
        }

        return filtered;
    }, [searchValue, emails, selectedSource, dateFilterState]);

    const stats = useMemo(() => {
        return emailsResponse?.data?.overallStats || emailsResponse?.overallStats || {};
    }, [emailsResponse]);

    const toggleStar = (id) => {
        setStarredIds((prev) =>
            prev.includes(id)
                ? prev.filter((starredId) => starredId !== id)
                : [...prev, id]
        );
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}

            <div className="flex justify-between items-center gap-4">

                <h1 className="text-xl md:text-2xl font-bold text-slate-900">Email Management</h1>

            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
                {/* Task Extracted */}
                <Card className="bg-slate-50 border-slate-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center shadow-sm">
                                <CiSquareCheck className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Tasks</p>
                                <p className="text-xl font-bold text-slate-900 leading-none">{stats.totalTasks || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Issues Found */}
                <Card className="bg-slate-50 border-slate-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center shadow-sm">
                                <FiAlertTriangle className="h-6 w-6 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Issues</p>
                                <p className="text-xl font-bold text-slate-900 leading-none">{stats.totalIssues || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Risks */}
                <Card className="bg-slate-50 border-slate-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center shadow-sm">
                                <FiAlertTriangle className="h-6 w-6 text-red-500" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Risks</p>
                                <p className="text-xl font-bold text-slate-900 leading-none">{stats.totalRisks || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Assumptions */}
                <Card className="bg-slate-50 border-slate-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center shadow-sm">
                                <FiFile className="h-6 w-6 text-sky-500" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Assumptions</p>
                                <p className="text-xl font-bold text-slate-900 leading-none">{stats.totalAssumptions || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Decisions */}
                <Card className="bg-slate-50 border-slate-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shadow-sm">
                                <FiFile className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Decisions</p>
                                <p className="text-xl font-bold text-slate-900 leading-none">{stats.totalDecisions || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Dependencies */}
                <Card className="bg-slate-50 border-slate-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center shadow-sm">
                                <FiFile className="h-6 w-6 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Dependencies</p>
                                <p className="text-xl font-bold text-slate-900 leading-none">{stats.totalDependencies || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Processed */}
                <Card className="bg-slate-50 border-slate-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="w-10 h-10 bg-[#6051E2]/10 rounded-lg flex items-center justify-center shadow-sm">
                                <PiShootingStar className="h-6 w-6 text-[#6051E2]" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">AI Processed</p>
                                <p className="text-xl font-bold text-slate-900 leading-none">{stats.totalAiPossessed || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search Bar */}
            <PageHeader
                title="Email Management"
                description="Manage your emails efficiently"
                searchPlaceholder="Search emails..."
                searchValue={searchValue}
                onSearchChange={(e) => setSearchValue(e.target.value)}
            />
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                {/* Source Filter Tabs */}
                <div className="flex flex-wrap gap-3 mt-4 sm:mt-6">
                    {sourceTabs.map((tab) => {
                        const isActive = selectedSource === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleSourceChange(tab.id)}
                                className={`px-4 py-2 text-sm sm:text-base font-medium rounded-md transition-colors cursor-pointer flex items-center gap-2 ${isActive
                                    ? "bg-[#6051E2] text-white"
                                    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <DateFilter onFilterChange={setDateFilterState} />
            </div>
            {/* Email List */}
            <Card className="overflow-hidden">
                <CardContent className="p-0 ">
                    {error ? (
                        <div className="text-center py-12 text-slate-500">
                            <FiMail className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                            <p className="text-lg font-medium">Failed to load emails</p>
                            <p className="text-sm">{error.message || "Please try again later."}</p>
                        </div>
                    ) : filteredEmails.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <FiMail className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                            <p className="text-lg font-medium">No emails found</p>
                            <p className="text-sm">Try adjusting your search</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredEmails.map((email) => (
                                <div
                                    key={email.id}
                                    onClick={() =>
                                        router.push(
                                            `/email-management/details/${email.id}?category=${encodeURIComponent(email.category || "all")}`
                                        )
                                    }
                                    className="p-4 sm:p-6 hover:bg-slate-50 transition-colors cursor-pointer group"
                                >
                                    <div className="flex flex-row justify-center items-center gap-4">
                                        {/* Icon */}
                                        <EmailIcon
                                            category={email.category}
                                            type={email.type}
                                            iconLetter={email.iconLetter}
                                        />

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1 truncate">
                                                        Email Subject: {email.title}
                                                    </h3>
                                                    <p className="text-sm sm:text-base text-slate-600 line-clamp-2">
                                                        {String(email.description || "")
                                                            .split(" ")
                                                            .slice(0, 20)
                                                            .join(" ")}...
                                                    </p>
                                                </div>

                                                {/* Right Side - CTA, Timestamp, Badge */}
                                                <div className="flex items-center gap-6 flex-shrink-0">
                                                    {/* Highlighted Call to action text */}
                                                    <div className="hidden lg:flex flex-col items-end leading-tight">
                                                        <span className="text-[10px] font-bold text-[#6051E2] uppercase tracking-wider">
                                                            Click to view insights
                                                        </span>
                                                        <span className="text-[10px] font-bold text-[#6051E2] uppercase tracking-wider">
                                                            & generate AI reply
                                                        </span>
                                                    </div>

                                                    {/* New Badge */}
                                                    {email.category !== "all" && (
                                                        <span
                                                            className={`px-3 py-1 text-white text-xs font-semibold rounded-full whitespace-nowrap ${
                                                                email.category === "social"
                                                                    ? "bg-blue-500"
                                                                    : email.category === "promotions"
                                                                    ? "bg-green-500"
                                                                    : email.category === "personal"
                                                                    ? "bg-slate-500"
                                                                    : "bg-violet-500"
                                                            }`}
                                                        >
                                                            {email.category}
                                                        </span>
                                                    )}

                                                    {/* Timestamp */}
                                                    {email.timestamp && (
                                                        <span className="text-sm text-slate-500 whitespace-nowrap">
                                                            {email.timestamp}
                                                        </span>
                                                    )}

                                                   
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
