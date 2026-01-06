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
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

// Chart data
const chartData = [
    { date: "Jan 1", Complete: 20, Ongoing: 25, Cancel: 30 },
    { date: "Jan 2", Complete: 25, Ongoing: 28, Cancel: 25 },
    { date: "Jan 3", Complete: 30, Ongoing: 30, Cancel: 20 },
    { date: "Jan 4", Complete: 35, Ongoing: 32, Cancel: 35 },
    { date: "Jan 5", Complete: 40, Ongoing: 30, Cancel: 42 },
    { date: "Jan 7", Complete: 38, Ongoing: 28, Cancel: 10 },
];

// Projects data
const projectsData = [
    {
        id: "584685",
        name: "Basketball App",
        owner: "Mr Mirja",
        status: "Ongoing",
        progress: 80,
        deadline: "20 Nov, 2025",
    },
    {
        id: "564857",
        name: "abcd",
        owner: "Mr Mirja",
        status: "Completed",
        progress: 60,
        deadline: "20 Nov, 2025",
    },
    {
        id: "654645",
        name: "abcd",
        owner: "Mr Mirja",
        status: "Ongoing",
        progress: 60,
        deadline: "20 Nov, 2025",
    },
    {
        id: "457832",
        name: "abcd",
        owner: "Mr Mirja",
        status: "Completed",
        progress: 80,
        deadline: "20 Nov, 2025",
    },
    {
        id: "487525",
        name: "abcd",
        owner: "Mr Mirja",
        status: "cancel",
        progress: 60,
        deadline: "20 Nov, 2025",
    },

];

const getStatusStyle = (status) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
        case "completed":
            return "bg-green-100 text-green-700";
        case "ongoing":
            return "bg-yellow-100 text-yellow-700";
        case "cancel":
            return "bg-red-100 text-red-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
};

export default function Dashboard() {
    const router = useRouter();
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard</h1>
                        <p className="text-sm md:text-base text-slate-500 mt-2">
                            Overview of your projects and team performance
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        {/* Filter Row - All on same line for custom range */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                            {/* Date Filter */}
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
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Overall Project Health */}
                <Card className="bg-green-50 border-green-100">
                    <CardContent className="p-4 sm:p-6">
                        <p className="text-sm sm:text-base text-slate-600 mb-2">Overall Project Health</p>
                        <p className="text-3xl sm:text-4xl font-bold text-slate-900">85%</p>
                    </CardContent>
                </Card>

                {/* Upcoming Deadlines */}
                <Card className="bg-pink-50 border-pink-100">
                    <CardContent className="p-4 sm:p-6">
                        <p className="text-sm sm:text-base text-slate-600 mb-2">Upcoming Deadlines</p>
                        <p className="text-3xl sm:text-4xl font-bold text-slate-900">3</p>
                    </CardContent>
                </Card>

                {/* Active Projects */}
                <Card className="bg-purple-50 border-purple-100">
                    <CardContent className="p-4 sm:p-6">
                        <p className="text-sm sm:text-base text-slate-600 mb-2">Active Projects</p>
                        <p className="text-3xl sm:text-4xl font-bold text-slate-900">36</p>
                    </CardContent>
                </Card>
            </div>

            {/* Key Performance Indicators Heading */}
            <div className="mt-10">
                <h2 className="text-lg md:text-xl font-bold text-slate-900">Key Performance Indicators</h2>
            </div>

            {/* Line Chart */}
            <Card className="p-4 sm:p-6">
                <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 sm:mb-0">
                            Project Trends
                        </h3>
                        <div className="flex items-center gap-2">
                            <select className="px-3 py-1.5 border border-slate-300 rounded-md text-sm bg-white cursor-pointer">
                                <option>2025</option>
                                <option>2024</option>
                                <option>2023</option>
                            </select>
                        </div>
                    </div>
                    <div className="w-full h-64 sm:h-80 md:h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#6b7280"
                                    style={{ fontSize: "12px" }}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    domain={[0, 50]}
                                    ticks={[0, 20, 30, 40, 50]}
                                    style={{ fontSize: "12px" }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                    }}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: "12px" }}
                                    iconType="square"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Complete"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Ongoing"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Cancel"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* All Projects List */}
            <div className="mt-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900">All Projects List</h2>
                    <button
                        onClick={() => router.push("/projects/all-projects-list")}
                        className="text-primary hover:underline text-sm sm:text-base font-medium cursor-pointer mt-2 sm:mt-0"
                    >
                        view all
                    </button>
                </div>

                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        {/* Desktop Table */}
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
                                        <TableHead className="py-3 px-4 lg:py-4 lg:px-6 text-white font-semibold text-sm lg:text-base">
                                            Owner
                                        </TableHead>
                                        <TableHead className="py-3 px-4 lg:py-4 lg:px-6 text-white font-semibold text-center text-sm lg:text-base">
                                            Status
                                        </TableHead>
                                        <TableHead className="py-3 px-4 lg:py-4 lg:px-6 text-white font-semibold text-sm lg:text-base">
                                            Progress
                                        </TableHead>
                                        <TableHead className="py-3 px-4 lg:py-4 lg:px-6 text-white font-semibold text-sm lg:text-base">
                                            Deadline
                                        </TableHead>
                                        <TableHead className="py-3 px-4 lg:py-4 lg:px-6 text-white font-semibold text-center text-sm lg:text-base">
                                            Details view
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {projectsData.map((project, index) => (
                                        <TableRow
                                            key={index}
                                            className="border-b border-slate-100 hover:bg-slate-50"
                                        >
                                            <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-slate-800 text-sm lg:text-base">
                                                {project.id}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-slate-800 text-sm lg:text-base">
                                                {project.name}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-slate-600 text-sm lg:text-base">
                                                {project.owner}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-center">
                                                <span
                                                    className={`px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-medium capitalize ${getStatusStyle(
                                                        project.status
                                                    )}`}
                                                >
                                                    {project.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-slate-600 text-sm lg:text-base">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-500 h-2 rounded-full"
                                                            style={{ width: `${project.progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs sm:text-sm">{project.progress}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-slate-600 text-sm lg:text-base">
                                                {project.deadline}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-center">
                                                <button
                                                    className="text-primary hover:underline text-xs lg:text-sm font-medium cursor-pointer"
                                                    onClick={() => router.push(`/projects/project-details/${project.id}`)}
                                                >
                                                    view
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Medium Tablet Table */}
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
                                            Progress
                                        </TableHead>
                                        <TableHead className="py-3 px-4 text-white font-semibold text-center text-sm">
                                            View
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {projectsData.map((project, index) => (
                                        <TableRow
                                            key={index}
                                            className="border-b border-slate-100 hover:bg-slate-50"
                                        >
                                            <TableCell className="py-3 px-4 text-slate-800 text-sm">
                                                {project.id}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-slate-800 text-sm">
                                                {project.name}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-center">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyle(
                                                        project.status
                                                    )}`}
                                                >
                                                    {project.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-slate-600 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-500 h-2 rounded-full"
                                                            style={{ width: `${project.progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs">{project.progress}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-center">
                                                <button
                                                    className="text-primary hover:underline text-xs font-medium cursor-pointer"
                                                    onClick={() => router.push(`/projects/project-details/${project.id}`)}
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
                            {projectsData.map((project, index) => (
                                <div key={index} className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-800 text-base">
                                                {project.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1">
                                                ID: {project.id}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyle(
                                                project.status
                                            )}`}
                                        >
                                            {project.status}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Owner</span>
                                            <span className="text-slate-700 font-medium">
                                                {project.owner}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Progress</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-slate-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full"
                                                        style={{ width: `${project.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-slate-700 font-medium text-xs">
                                                    {project.progress}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Deadline</span>
                                            <span className="text-slate-700 font-medium">
                                                {project.deadline}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        className="w-full text-center text-primary hover:underline text-sm font-medium cursor-pointer pt-2"
                                        onClick={() => router.push(`/projects/project-details/${project.id}`)}
                                    >
                                        View
                                    </button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
