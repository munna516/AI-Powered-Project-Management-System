"use client";
import { useMemo, useState } from "react";
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
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

const MONTHS = [
    { value: "jan", label: "January" },
    { value: "feb", label: "February" },
    { value: "mar", label: "March" },
    { value: "apr", label: "April" },
    { value: "may", label: "May" },
    { value: "jun", label: "June" },
    { value: "jul", label: "July" },
    { value: "aug", label: "August" },
    { value: "sep", label: "September" },
    { value: "oct", label: "October" },
    { value: "nov", label: "November" },
    { value: "dec", label: "December" },
];

const toTitleCase = (value) => {
    if (!value) return "";
    return String(value)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusStyle = (status) => {
    const statusLower = String(status ?? "").toLowerCase();
    switch (statusLower) {
        case "completed":
            return "bg-green-100 text-green-700";
        case "ongoing":
        case "in_progress":
            return "bg-yellow-100 text-yellow-700";
        case "cancel":
        case "cancelled":
            return "bg-red-100 text-red-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
};

export default function Dashboard() {
    const router = useRouter();
    const now = useMemo(() => new Date(), []);
    const currentYear = now.getFullYear();

    const [year, setYear] = useState(currentYear);
    // Empty string means "all months" (filter by year only)
    const [month, setMonth] = useState("");

    const { data, isLoading, isFetching, isError, error } = useQuery({
        queryKey: ["pm-dashboard", { year, month }],
        queryFn: async () => {
            const params = { year, ...(month ? { month } : {}) };
            const res = await apiGet("/api/project-manager/dashboard", {
                params,
            });
            return res?.data ?? res;
        },
        keepPreviousData: true,
        staleTime: 30_000,
    });

    const stats = data?.stats;
    const projectsData = Array.isArray(data?.projects?.data) ? data.projects.data : [];
    const chartData = Array.isArray(data?.kpiChart)
        ? data.kpiChart.map((row) => ({
            month: `${toTitleCase(row?.month)} ${row?.year ?? ""}`.trim(),
            Complete: Number(row?.completed ?? 0),
            Ongoing: Number(row?.ongoing ?? 0),
            Cancel: Number(row?.cancelled ?? 0),
        }))
        : [];

    const yearOptions = useMemo(() => {
        const years = [];
        for (let y = currentYear - 3; y <= currentYear + 1; y += 1) years.push(y);
        return years;
    }, [currentYear]);

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
                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                className="px-3 py-1.5 border border-slate-300 rounded-md text-sm bg-white cursor-pointer"
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                            >
                                {yearOptions.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="px-3 py-1.5 border border-slate-300 rounded-md text-sm bg-white cursor-pointer"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                            >
                                <option value="">All months</option>
                                {MONTHS.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                            {isFetching && (
                                <span className="text-xs text-slate-500">Updating…</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Overall Project Health */}
                <Card className="bg-green-50 border-green-100">
                    <CardContent className="p-4 sm:p-6">
                        <p className="text-sm sm:text-base text-slate-600 mb-2">Overall Project Health</p>
                        <p className="text-3xl sm:text-4xl font-bold text-slate-900">
                            {isLoading ? "—" : `${Number(stats?.overallHealth ?? 0)}%`}
                        </p>
                    </CardContent>
                </Card>

                {/* Upcoming Deadlines */}
                <Card className="bg-pink-50 border-pink-100">
                    <CardContent className="p-4 sm:p-6">
                        <p className="text-sm sm:text-base text-slate-600 mb-2">Upcoming Deadlines</p>
                        <p className="text-3xl sm:text-4xl font-bold text-slate-900">
                            {isLoading ? "—" : Number(stats?.upcomingDeadlines ?? 0)}
                        </p>
                    </CardContent>
                </Card>

                {/* Active Projects */}
                <Card className="bg-purple-50 border-purple-100">
                    <CardContent className="p-4 sm:p-6">
                        <p className="text-sm sm:text-base text-slate-600 mb-2">Active Projects</p>
                        <p className="text-3xl sm:text-4xl font-bold text-slate-900">
                            {isLoading ? "—" : Number(stats?.activeProjects ?? 0)}
                        </p>
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
                        {isError && (
                            <span className="text-xs text-red-600">
                                {error?.message || "Failed to load dashboard data"}
                            </span>
                        )}
                    </div>
                    <div className="w-full h-64 sm:h-80 md:h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="month"
                                    stroke="#6b7280"
                                    style={{ fontSize: "12px" }}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    allowDecimals={false}
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
                                                {project.projectId}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-slate-800 text-sm lg:text-base">
                                                {project.projectName}
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
                                                            style={{ width: `${Number(project.progress ?? 0)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs sm:text-sm">{Number(project.progress ?? 0)}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-slate-600 text-sm lg:text-base">
                                                {project.deadline}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-center">
                                                <button
                                                    className="text-primary hover:underline text-xs lg:text-sm font-medium cursor-pointer"
                                                    onClick={() => router.push(`/projects/project-details/${project.projectId}`)}
                                                >
                                                    view
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {!isLoading && projectsData.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-6 text-center text-sm text-slate-500">
                                                No projects found.
                                            </TableCell>
                                        </TableRow>
                                    )}
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
                                                {project.projectId}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-slate-800 text-sm">
                                                {project.projectName}
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
                                                            style={{ width: `${Number(project.progress ?? 0)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs">{Number(project.progress ?? 0)}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-center">
                                                <button
                                                    className="text-primary hover:underline text-xs font-medium cursor-pointer"
                                                    onClick={() => router.push(`/projects/project-details/${project.projectId}`)}
                                                >
                                                    view
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {!isLoading && projectsData.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-6 text-center text-sm text-slate-500">
                                                No projects found.
                                            </TableCell>
                                        </TableRow>
                                    )}
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
                                                {project.projectName}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1">
                                                ID: {project.projectId}
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
                                                        style={{ width: `${Number(project.progress ?? 0)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-slate-700 font-medium text-xs">
                                                    {Number(project.progress ?? 0)}%
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
                                        onClick={() => router.push(`/projects/project-details/${project.projectId}`)}
                                    >
                                        View
                                    </button>
                                </div>
                            ))}
                            {!isLoading && projectsData.length === 0 && (
                                <div className="p-4 text-center text-sm text-slate-500">No projects found.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
