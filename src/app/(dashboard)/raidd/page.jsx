"use client";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useRouter } from "next/navigation";
import { FiDownload } from "react-icons/fi";
import toast from "react-hot-toast";

const tabs = [
    { id: "risk", label: "Risk" },
    { id: "assumptions", label: "Assumptions" },
    { id: "issues", label: "Issues" },
    { id: "decisions", label: "Decisions" },
    { id: "dependencies", label: "Dependencies" },
];

// Dummy data for each tab
const riskData = [
    { id: 1, projectId: "584685", projectName: "Basketball App", status: "low", mail: "abc@gmail.com", date: "20 Nov, 2025" },
    { id: 2, projectId: "564657", projectName: "Project Alpha", status: "medium", mail: "abc@gmail.com", date: "20 Nov, 2025" },
    { id: 3, projectId: "654645", projectName: "Project Horizon", status: "High", mail: "abc@gmail.com", date: "20 Nov, 2025" },
    { id: 4, projectId: "567890", projectName: "Project Horizon", status: "medium", mail: "efg@gmail.com", date: "25 Nov, 2025" },
    { id: 5, projectId: "765432", projectName: "Project Nova", status: "High", mail: "qrs@gmail.com", date: "05 Dec, 2025" },
    { id: 6, projectId: "123456", projectName: "Mobile App", status: "low", mail: "ijk@gmail.com", date: "22 Nov, 2025" },
    { id: 7, projectId: "789012", projectName: "Web Platform", status: "medium", mail: "mno@gmail.com", date: "28 Nov, 2025" },
    { id: 8, projectId: "345678", projectName: "Dashboard System", status: "High", mail: "xyz@gmail.com", date: "01 Dec, 2025" },
];

const assumptionsData = [
    { id: 1, projectId: "111111", projectName: "E-commerce Site", status: "medium", mail: "assume1@gmail.com", date: "15 Nov, 2025" },
    { id: 2, projectId: "222222", projectName: "Payment Gateway", status: "low", mail: "assume2@gmail.com", date: "18 Nov, 2025" },
    { id: 3, projectId: "333333", projectName: "API Integration", status: "High", mail: "assume3@gmail.com", date: "23 Nov, 2025" },
    { id: 4, projectId: "444444", projectName: "Cloud Migration", status: "medium", mail: "assume4@gmail.com", date: "27 Nov, 2025" },
    { id: 5, projectId: "555555", projectName: "Security Audit", status: "High", mail: "assume5@gmail.com", date: "03 Dec, 2025" },
];

const issuesData = [
    { id: 1, projectId: "666666", projectName: "Bug Tracker", status: "High", mail: "issue1@gmail.com", date: "19 Nov, 2025" },
    { id: 2, projectId: "777777", projectName: "Performance Issue", status: "medium", mail: "issue2@gmail.com", date: "21 Nov, 2025" },
    { id: 3, projectId: "888888", projectName: "Database Error", status: "High", mail: "issue3@gmail.com", date: "24 Nov, 2025" },
    { id: 4, projectId: "999999", projectName: "UI Bug Fix", status: "low", mail: "issue4@gmail.com", date: "26 Nov, 2025" },
    { id: 5, projectId: "101010", projectName: "Authentication Issue", status: "High", mail: "issue5@gmail.com", date: "29 Nov, 2025" },
    { id: 6, projectId: "202020", projectName: "API Timeout", status: "medium", mail: "issue6@gmail.com", date: "02 Dec, 2025" },
];

const decisionsData = [
    { id: 1, projectId: "303030", projectName: "Tech Stack Decision", status: "medium", mail: "dec1@gmail.com", date: "16 Nov, 2025" },
    { id: 2, projectId: "404040", projectName: "Architecture Choice", status: "low", mail: "dec2@gmail.com", date: "17 Nov, 2025" },
    { id: 3, projectId: "505050", projectName: "Framework Selection", status: "medium", mail: "dec3@gmail.com", date: "30 Nov, 2025" },
    { id: 4, projectId: "606060", projectName: "Database Decision", status: "High", mail: "dec4@gmail.com", date: "04 Dec, 2025" },
];

const dependenciesData = [
    { id: 1, projectId: "707070", projectName: "Third-party API", status: "High", mail: "dep1@gmail.com", date: "14 Nov, 2025" },
    { id: 2, projectId: "808080", projectName: "Library Update", status: "medium", mail: "dep2@gmail.com", date: "31 Nov, 2025" },
    { id: 3, projectId: "909090", projectName: "External Service", status: "High", mail: "dep3@gmail.com", date: "06 Dec, 2025" },
    { id: 4, projectId: "111222", projectName: "Infrastructure Setup", status: "medium", mail: "dep4@gmail.com", date: "07 Dec, 2025" },
    { id: 5, projectId: "333444", projectName: "Cloud Service", status: "low", mail: "dep5@gmail.com", date: "08 Dec, 2025" },
];

const allData = {
    risk: riskData,
    assumptions: assumptionsData,
    issues: issuesData,
    decisions: decisionsData,
    dependencies: dependenciesData,
};

const getStatusStyle = (status) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
        case "low":
            return "bg-yellow-100 text-yellow-700";
        case "medium":
            return "bg-green-100 text-green-700";
        case "high":
            return "bg-red-100 text-red-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
};

const truncateEmail = (email) => {
    if (!email) return "";
    const [localPart, domain] = email.split("@");
    if (localPart.length > 3) {
        return `${localPart.substring(0, 3)}@${domain.substring(0, 2)}..`;
    }
    return email;
};

export default function RAIDD() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("risk");
    const [searchValue, setSearchValue] = useState("");
    const [dateFilter, setDateFilter] = useState("today");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");

    // Calculate date ranges based on filter type
    const getDateRange = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (dateFilter) {
            case "today": {
                const start = new Date(today);
                const end = new Date(today);
                end.setHours(23, 59, 59, 999);
                return { start, end };
            }
            case "7days": {
                const start = new Date(today);
                start.setDate(start.getDate() - 6); // Last 7 days including today
                const end = new Date(today);
                end.setHours(23, 59, 59, 999);
                return { start, end };
            }
            case "month": {
                const start = new Date(today.getFullYear(), today.getMonth(), 1);
                const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                end.setHours(23, 59, 59, 999);
                return { start, end };
            }
            case "custom": {
                const start = customStartDate ? new Date(customStartDate) : null;
                const end = customEndDate ? new Date(customEndDate) : null;
                if (end) end.setHours(23, 59, 59, 999);
                return { start, end };
            }
            default:
                return { start: today, end: today };
        }
    }, [dateFilter, customStartDate, customEndDate]);

    // Format date for display
    const formatDateRange = () => {
        const { start, end } = getDateRange;

        const formatDate = (date) => {
            if (!date) return "";
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        };

        if (dateFilter === "today") {
            return formatDate(start);
        }
        if (dateFilter === "7days") {
            return `${formatDate(start)} - ${formatDate(end)}`;
        }
        if (dateFilter === "month") {
            return start.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        }
        if (dateFilter === "custom") {
            if (!start || !end) return "Select date range";
            return `${formatDate(start)} - ${formatDate(end)}`;
        }
        return `${formatDate(start)} - ${formatDate(end)}`;
    };

    const handleFilterChange = (value) => {
        setDateFilter(value);
        if (value !== "custom") {
            setCustomStartDate("");
            setCustomEndDate("");
        }
    };

    const handleExport = () => {
        toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} data exported successfully!`);
    };

    const filteredData = useMemo(() => {
        const data = allData[activeTab] || [];
        let filtered = data;

        // Search filtering
        if (searchValue.trim()) {
            const searchLower = searchValue.toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.projectId.toLowerCase().includes(searchLower) ||
                    item.projectName.toLowerCase().includes(searchLower) ||
                    item.mail.toLowerCase().includes(searchLower) ||
                    item.date.toLowerCase().includes(searchLower)
            );
        }

        // Date filtering can be added here if needed
        // For now, we'll just return the filtered data

        return filtered;
    }, [activeTab, searchValue, getDateRange]);

    return (
        <div className="space-y-4 sm:space-y-6">
            <PageHeader
                title="RAIDD"
                description="AI powered insights for all your projects"
                searchPlaceholder="search risk & issues"
                searchValue={searchValue}
                onSearchChange={(e) => setSearchValue(e.target.value)}
            />

            {/* Filter Tabs, Date Filter, and Export Button - All in One Line */}
            <div className="flex flex-col lg:flex-row lg:items-end gap-4 mt-10">
                {/* Tabs - Left Side */}
                <div className="flex flex-wrap gap-3 lg:flex-nowrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === tab.id
                                ? "bg-[#6051E2] text-white"
                                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Date Filter - Middle */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-end lg:flex-1 lg:justify-center">
                    <div className="flex flex-col gap-2 min-w-[200px] sm:min-w-[220px]">
                        <label className="text-xs sm:text-sm font-medium text-slate-700">
                            Filter by Date
                        </label>
                        <Select value={dateFilter} onValueChange={handleFilterChange}>
                            <SelectTrigger className="h-9 sm:h-10 text-sm">
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

                    {/* Custom Date Range Inputs */}
                    {dateFilter === "custom" ? (
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
                    ) : (
                        /* Date Range Display for preset filters */
                        <div className="flex items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 min-w-[180px] sm:min-w-[200px] h-9 sm:h-10">
                            <span className="text-xs sm:text-sm">{formatDateRange()}</span>
                        </div>
                    )}
                </div>

                {/* Export Button - Right Side */}
                <Button
                    onClick={handleExport}
                    className="bg-[#6051E2] hover:bg-[#4a3db8] text-white px-4 py-2 h-9 sm:h-10 text-sm font-medium cursor-pointer flex items-center gap-2 w-full lg:w-auto"
                >
                    <FiDownload className="h-4 w-4" />
                    Export
                </Button>
            </div>

            {/* Show selected custom range below */}
            {dateFilter === "custom" && customStartDate && customEndDate && (
                <div className="flex items-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 w-fit mt-2">
                    <span>{formatDateRange()}</span>
                </div>
            )}

            {/* Table Card */}
            <Card className="overflow-hidden mt-4 sm:mt-6">
                <CardContent className="p-0">
                    {/* Desktop & Large Tablet Table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-[#6051E2] text-white">
                                <TableRow className="border-b-0">
                                    <TableHead className="py-3 px-4 lg:py-4 lg:px-6 text-white font-semibold text-sm lg:text-base">
                                        Project ID
                                    </TableHead>
                                    <TableHead className="py-3 px-4 lg:py-4 lg:px-6 text-white font-semibold text-sm lg:text-base">
                                        Project Name
                                    </TableHead>
                                    <TableHead className="py-3 px-4 lg:py-4 lg:px-6 text-white font-semibold text-center text-sm lg:text-base">
                                        Status
                                    </TableHead>
                                    <TableHead className="py-3 px-4 lg:py-4 lg:px-6 text-white font-semibold text-sm lg:text-base">
                                        Mail
                                    </TableHead>
                                    <TableHead className="py-3 px-4 lg:py-4 lg:px-6 text-white font-semibold text-sm lg:text-base">
                                        Date
                                    </TableHead>
                                    <TableHead className="py-3 px-4 lg:py-4 lg:px-6 text-white font-semibold text-center text-sm lg:text-base">
                                        View Details
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className="border-b border-slate-100 hover:bg-slate-50"
                                    >
                                        <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-slate-800 text-sm lg:text-base">
                                            {item.projectId}
                                        </TableCell>
                                        <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-slate-800 text-sm lg:text-base">
                                            {item.projectName}
                                        </TableCell>
                                        <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-center">
                                            <span
                                                className={`px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-medium capitalize ${getStatusStyle(
                                                    item.status
                                                )}`}
                                            >
                                                {item.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-slate-600 text-sm lg:text-base">
                                            {truncateEmail(item.mail)}
                                        </TableCell>
                                        <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-slate-600 text-sm lg:text-base">
                                            {item.date}
                                        </TableCell>
                                        <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-center">
                                            <button
                                                className="text-primary hover:underline text-xs lg:text-sm font-medium cursor-pointer"
                                                onClick={() => router.push(`/raidd/view/${item.id}`)}
                                            >
                                                view
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Medium Tablet Table - Simplified */}
                    <div className="hidden md:block lg:hidden overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-[#6051E2] text-white">
                                <TableRow className="border-b-0">
                                    <TableHead className="py-3 px-4 text-white font-semibold text-sm">
                                        Project ID
                                    </TableHead>
                                    <TableHead className="py-3 px-4 text-white font-semibold text-sm">
                                        Project Name
                                    </TableHead>
                                    <TableHead className="py-3 px-4 text-white font-semibold text-center text-sm">
                                        Status
                                    </TableHead>
                                    <TableHead className="py-3 px-4 text-white font-semibold text-sm">
                                        Date
                                    </TableHead>
                                    <TableHead className="py-3 px-4 text-white font-semibold text-center text-sm">
                                        View
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className="border-b border-slate-100 hover:bg-slate-50"
                                    >
                                        <TableCell className="py-3 px-4 text-slate-800 text-sm">
                                            {item.projectId}
                                        </TableCell>
                                        <TableCell className="py-3 px-4 text-slate-800 text-sm">
                                            {item.projectName}
                                        </TableCell>
                                        <TableCell className="py-3 px-4 text-center">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyle(
                                                    item.status
                                                )}`}
                                            >
                                                {item.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 px-4 text-slate-600 text-sm">
                                            {item.date}
                                        </TableCell>
                                        <TableCell className="py-3 px-4 text-center">
                                            <button
                                                className="text-primary hover:underline text-xs font-medium cursor-pointer"
                                                onClick={() => router.push(`/raidd/view/${item.id}`)}
                                            >
                                                view
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {filteredData.map((item) => (
                            <div key={item.id} className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-slate-800 text-base">
                                            {item.projectName}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1">
                                            ID: {item.projectId}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyle(
                                            item.status
                                        )}`}
                                    >
                                        {item.status}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Mail</span>
                                        <span className="text-slate-700">{truncateEmail(item.mail)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Date</span>
                                        <span className="text-slate-700">{item.date}</span>
                                    </div>
                                </div>
                                <button
                                    className="w-full text-center text-primary hover:underline text-sm font-medium cursor-pointer pt-2"
                                    onClick={() => router.push(`/raidd/view/${item.id}`)}
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredData.length === 0 && (
                        <div className="text-center py-8 sm:py-10 text-slate-500 text-sm sm:text-base">
                            No {activeTab} found matching your search.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
