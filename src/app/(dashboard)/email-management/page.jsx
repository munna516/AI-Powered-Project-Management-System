"use client";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FiMail, FiStar, FiAlertTriangle } from "react-icons/fi";
import { FaLinkedin } from "react-icons/fa";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import PageHeader from "@/components/PageHeader/PageHeader";
import { CiSquareCheck } from "react-icons/ci";
import { PiShootingStar } from "react-icons/pi";
import { LuMessageSquareMore } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Dummy email data
const emailData = [
    {
        id: 1,
        icon: "diamond",
        iconColor: "green",
        title: "Promotions",
        description: "Temu, Kwame from Bolt, Temu, A...",
        timestamp: null,
        newCount: 13,
        badgeColor: "green",
        isStarred: false,
    },
    {
        id: 2,
        icon: "linkedin",
        iconColor: "blue",
        title: "LinkedIn Job Alerts",
        description: '"Real estate manager": Starbucks - r... Starbucks real estate manager - Existing',
        timestamp: "12:58",
        newCount: null,
        isStarred: false,
    },
    {
        id: 3,
        icon: "letter",
        iconLetter: "G",
        iconColor: "grey",
        title: "Guardian Jobs",
        description: '"Real estate manager": Starbucks - r... Starbucks real estate manager - Existing',
        timestamp: "12:58",
        newCount: null,
        isStarred: false,
    },
    {
        id: 4,
        icon: "social",
        iconColor: "blue",
        title: "Social",
        description: "Facebook, Kofi via Messenger, Twitter message",
        timestamp: null,
        newCount: 13,
        badgeColor: "blue",
        isStarred: false,
    },
    {
        id: 5,
        icon: "linkedin",
        iconColor: "blue",
        title: "LinkedIn Job Alerts",
        description: '"Real estate manager": Starbucks - r... Starbucks real estate manager - Existing',
        timestamp: "12:58",
        newCount: null,
        isStarred: false,
    },
    {
        id: 6,
        icon: "linkedin",
        iconColor: "blue",
        title: "LinkedIn Job Alerts",
        description: '"Real estate manager": Starbucks - r... Starbucks real estate manager - Existing',
        timestamp: "12:58",
        newCount: null,
        isStarred: false,
    },

];

// Icon component for different email types
const EmailIcon = ({ icon, iconColor, iconLetter }) => {
    if (icon === "diamond") {
        return (
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <div className="relative w-6 h-6">
                    {/* Outer diamond */}
                    <div className="absolute inset-0 bg-green-600 transform rotate-45 rounded-sm"></div>
                    {/* Inner diamond */}
                    <div className="absolute inset-2 bg-white transform rotate-45 rounded-sm"></div>
                </div>
            </div>
        );
    }
    if (icon === "linkedin") {
        return (
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaLinkedin className="h-5 w-5 text-white" />
            </div>
        );
    }
    if (icon === "letter") {
        return (
            <div className="w-10 h-10 bg-slate-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-lg">{iconLetter}</span>
            </div>
        );
    }
    if (icon === "social") {
        return (
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <HiOutlineChatBubbleLeftRight className="h-5 w-5 text-white" />
            </div>
        );
    }
    return null;
};

// Source filter tabs
const sourceTabs = [
    { id: "all", label: "All" },
    { id: "promotions", label: "Promotions" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "social", label: "Social" },
    { id: "jobs", label: "Jobs" },
];

export default function EmailManagement() {
    const [searchValue, setSearchValue] = useState("");
    const [dateFilter, setDateFilter] = useState("today");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");
    const [selectedSource, setSelectedSource] = useState("all");

    const handleFilterChange = (value) => {
        setDateFilter(value);
    };

    const handleSourceChange = (sourceId) => {
        setSelectedSource(sourceId);
    };

    const formatDateRange = () => {
        if (dateFilter === "custom" && customStartDate && customEndDate) {
            return `${customStartDate} - ${customEndDate}`;
        } else if (dateFilter === "today") {
            return "Today";
        } else if (dateFilter === "7days") {
            return "Last 7 Days";
        } else if (dateFilter === "month") {
            return "This Month";
        }
        return "";
    };

    const [emails, setEmails] = useState(emailData);
    const router = useRouter();
    const filteredEmails = useMemo(() => {
        let filtered = emails;

        // Filter by source
        if (selectedSource !== "all") {
            filtered = filtered.filter((email) => {
                if (selectedSource === "promotions" && email.icon === "diamond") return true;
                if (selectedSource === "linkedin" && email.icon === "linkedin") return true;
                if (selectedSource === "social" && email.icon === "social") return true;
                if (selectedSource === "jobs" && (email.icon === "letter" || email.title.toLowerCase().includes("job"))) return true;
                return false;
            });
        }

        // Filter by search value
        if (searchValue.trim()) {
            const searchLower = searchValue.toLowerCase();
            filtered = filtered.filter(
                (email) =>
                    email.title.toLowerCase().includes(searchLower) ||
                    email.description.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }, [searchValue, emails, selectedSource]);

    const toggleStar = (id) => {
        setEmails((prev) =>
            prev.map((email) =>
                email.id === id ? { ...email, isStarred: !email.isStarred } : email
            )
        );
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}

            <div className="flex justify-between items-center gap-4">

                <h1 className="text-xl md:text-2xl font-bold text-slate-900">Email Management</h1>

                <Button onClick={() => router.push("/email-management/generate-email")} className="bg-[#6051E2] hover:bg-[#4a3db8] text-white px-6 py-3 text-sm sm:text-base font-semibold cursor-pointer">
                    <FiMail className="h-4 w-4" /> Draft Email
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Task Extracted */}
                <Card className="bg-slate-50 border-slate-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10     h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                <CiSquareCheck className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Task Extracted</p>
                                <p className="text-2xl sm:text-3xl font-bold text-slate-900">47</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Issues Found */}
                <Card className="bg-slate-50 border-slate-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                <FiAlertTriangle className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Issues Found</p>
                                <p className="text-2xl sm:text-3xl font-bold text-slate-900">08</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Processed */}
                <Card className="bg-slate-50 border-slate-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                <PiShootingStar className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 mb-1">AI Processed</p>
                                <p className="text-2xl sm:text-3xl font-bold text-slate-900">08</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Unread Email */}
                <Card className="bg-slate-50 border-slate-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                <LuMessageSquareMore className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Unread Email</p>
                                <p className="text-2xl sm:text-3xl font-bold text-slate-900">08</p>
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
            <div className="flex justify-between items-center gap-4">

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

                {/* here I want to show the global date filter */}
                <div className="flex flex-col gap-3">
                    {/* Filter Row - All on same line for custom range */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                        {/* Date Filter */}
                        <div className="flex flex-col gap-2 min-w-[200px] sm:min-w-[220px]">
                            <label className="text-xs sm:text-sm font-medium text-slate-700">
                                Filter by Date
                            </label>
                            <Select value={dateFilter} onValueChange={handleFilterChange}>
                                <SelectTrigger
                                    className="h-9 sm:h-10 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="7days">Last 7 Days</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                    <SelectItem value="custom">Custom Range</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Custom Date Range Inputs - Same line as Filter */}
                        {dateFilter === "custom" && (
                            <>
                                <div className="flex flex-col gap-1 min-w-[140px]">
                                    <label className="text-xs text-slate-600">Start Date</label>
                                    <Input
                                        type="date"
                                        value={customStartDate}
                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                        className="h-9 sm:h-10 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-1 min-w-[140px]">
                                    <label className="text-xs text-slate-600">End Date</label>
                                    <Input
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                        min={customStartDate}
                                        className="h-9 sm:h-10 text-sm"
                                    />
                                </div>
                            </>
                        )}

                        {/* Date Range Display for preset filters */}
                        {dateFilter !== "custom" && (
                            <div className="flex items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 min-w-[180px] sm:min-w-[200px] h-9 sm:h-10">
                                <span className="text-xs sm:text-sm">{formatDateRange()}</span>
                            </div>
                        )}
                    </div>

                    {/* Show selected custom range below the inputs */}
                    {dateFilter === "custom" && customStartDate && customEndDate && (
                        <div className="flex items-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 w-fit">
                            <span>{formatDateRange()}</span>
                        </div>
                    )}
                </div>
            </div>
            {/* Email List */}
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    {filteredEmails.length === 0 ? (
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
                                    onClick={() => router.push(`/email-management/details/${email.id}`)}
                                    className="p-4 sm:p-6 hover:bg-slate-50 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <EmailIcon
                                            icon={email.icon}
                                            iconColor={email.iconColor}
                                            iconLetter={email.iconLetter}
                                        />

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1 truncate">
                                                        {email.title}
                                                    </h3>
                                                    <p className="text-sm sm:text-base text-slate-600 line-clamp-2">
                                                        {email.description}
                                                    </p>
                                                </div>

                                                {/* Right Side - Timestamp, Badge, Star */}
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    {/* New Badge */}
                                                    {email.newCount && (
                                                        <span
                                                            className={`px-3 py-1 text-white text-xs font-semibold rounded-full whitespace-nowrap ${email.badgeColor === "blue"
                                                                ? "bg-blue-500"
                                                                : "bg-green-500"
                                                                }`}
                                                        >
                                                            {email.newCount} new
                                                        </span>
                                                    )}

                                                    {/* Timestamp */}
                                                    {email.timestamp && (
                                                        <span className="text-sm text-slate-500 whitespace-nowrap">
                                                            {email.timestamp}
                                                        </span>
                                                    )}

                                                    {/* Star Icon */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleStar(email.id);
                                                        }}
                                                        className={`p-1.5  cursor-pointer rounded-full transition-colors ${email.isStarred
                                                            ? "text-yellow-500 bg-yellow-50"
                                                            : "text-slate-400 hover:text-yellow-500 hover:bg-yellow-50"
                                                            }`}
                                                    >
                                                        <FiStar
                                                            className={`h-5 w-5 ${email.isStarred ? "fill-current" : ""
                                                                }`}
                                                        />
                                                    </button>
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
