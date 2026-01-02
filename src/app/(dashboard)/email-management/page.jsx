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

export default function EmailManagement() {
    const [searchValue, setSearchValue] = useState("");
    const [emails, setEmails] = useState(emailData);
    const router = useRouter();
    const filteredEmails = useMemo(() => {
        if (!searchValue.trim()) return emails;
        const searchLower = searchValue.toLowerCase();
        return emails.filter(
            (email) =>
                email.title.toLowerCase().includes(searchLower) ||
                email.description.toLowerCase().includes(searchLower)
        );
    }, [searchValue, emails]);

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
           
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">Email Management</h1>
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
