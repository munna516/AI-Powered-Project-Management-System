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
import PageHeader from "@/components/PageHeader/PageHeader";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import DateFilter, { getDateRangeFromFilter } from "@/components/DateFilter/Datefilter";
import { FiDownload } from "react-icons/fi";

// All projects data
const allProjectsData = [
    { id: "584685", name: "Basketball App", owner: "Jenny Wilson", status: "Ongoing", progress: 60, deadline: "20 Nov, 2025" },
    { id: "564657", name: "abcd", owner: "Ralph Edwards", status: "Completed", progress: 100, deadline: "20 Nov, 2025" },
    { id: "654645", name: "abcd", owner: "Albert Flores", status: "Ongoing", progress: 120, deadline: "20 Nov, 2025" },
    { id: "457832", name: "abcd", owner: "Savannah Nguyen", status: "Completed", progress: 80, deadline: "20 Nov, 2025" },
    { id: "487525", name: "abcd", owner: "Bessie Cooper", status: "cancel", progress: 140, deadline: "20 Nov, 2025" },
    { id: "789012", name: "abcd", owner: "Marvin McKinney", status: "Ongoing", progress: 180, deadline: "20 Nov, 2025" },
    { id: "345678", name: "abcd", owner: "Savannah Nguyen", status: "Completed", progress: 200, deadline: "20 Nov, 2025" },
    { id: "901234", name: "abcd", owner: "Wade Warren", status: "Completed", progress: 220, deadline: "20 Nov, 2025" },
    { id: "567890", name: "abcd", owner: "Esther Howard", status: "Ongoing", progress: 240, deadline: "20 Nov, 2025" },
    { id: "123456", name: "abcd", owner: "Ronald Richards", status: "cancel", progress: 260, deadline: "20 Nov, 2025" },
    { id: "234567", name: "abcd", owner: "Kathryn Murphy", status: "Ongoing", progress: 280, deadline: "20 Nov, 2025" },
    { id: "345789", name: "abcd", owner: "Eleanor Pena", status: "Ongoing", progress: 300, deadline: "20 Nov, 2025" },
    { id: "456890", name: "abcd", owner: "Albert Flores", status: "Ongoing", progress: 320, deadline: "20 Nov, 2025" },
    { id: "567901", name: "abcd", owner: "Floyd Miles", status: "Completed", progress: 340, deadline: "20 Nov, 2025" },
    { id: "678012", name: "abcd", owner: "Courtney Henry", status: "Completed", progress: 360, deadline: "20 Nov, 2025" },
    { id: "789123", name: "abcd", owner: "Darlene Robertson", status: "cancel", progress: 380, deadline: "20 Nov, 2025" },
    { id: "890234", name: "abcd", owner: "Dianne Russell", status: "Ongoing", progress: 400, deadline: "20 Nov, 2025" },
    { id: "901345", name: "abcd", owner: "Darrell Steward", status: "Completed", progress: 420, deadline: "20 Nov, 2025" },
    { id: "012456", name: "abcd", owner: "Arlene McCoy", status: "Ongoing", progress: 440, deadline: "20 Nov, 2025" },
    { id: "123567", name: "abcd", owner: "Cody Fisher", status: "Completed", progress: 460, deadline: "20 Nov, 2025" },
    { id: "234678", name: "abcd", owner: "Brooklyn Simmons", status: "Ongoing", progress: 480, deadline: "20 Nov, 2025" },
    { id: "345789", name: "abcd", owner: "Jenny Wilson", status: "Completed", progress: 500, deadline: "20 Nov, 2025" },
    { id: "456890", name: "abcd", owner: "Ralph Edwards", status: "Ongoing", progress: 520, deadline: "20 Nov, 2025" },
    { id: "567901", name: "abcd", owner: "Albert Flores", status: "Completed", progress: 540, deadline: "20 Nov, 2025" },
    { id: "678012", name: "abcd", owner: "Savannah Nguyen", status: "Ongoing", progress: 560, deadline: "20 Nov, 2025" },
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

export default function AllProjectsList() {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState("");
    const [dateFilterState, setDateFilterState] = useState({
        filter: "all",
        startDate: null,
        endDate: null,
    });

    const filteredProjects = useMemo(() => {
        let filtered = allProjectsData;

        // Filter by search
        if (searchValue.trim()) {
            const searchLower = searchValue.toLowerCase();
            filtered = filtered.filter(
                (project) =>
                    project.id.toLowerCase().includes(searchLower) ||
                    project.name.toLowerCase().includes(searchLower) ||
                    project.owner.toLowerCase().includes(searchLower) ||
                    project.status.toLowerCase().includes(searchLower) ||
                    project.deadline.toLowerCase().includes(searchLower)
            );
        }

        // Filter by date (based on deadline)
        if (dateFilterState.filter !== "all") {
            const { start, end } = getDateRangeFromFilter(
                dateFilterState.filter,
                dateFilterState.startDate,
                dateFilterState.endDate
            );

            if (start && end) {
                filtered = filtered.filter((project) => {
                    // Parse deadline (format: "20 Nov, 2025")
                    const deadlineDate = new Date(project.deadline);
                    if (isNaN(deadlineDate.getTime())) return true; // Skip invalid dates
                    return deadlineDate >= start && deadlineDate <= end;
                });
            }
        }

        return filtered;
    }, [searchValue, dateFilterState]);

    const handleExport = () => {
        // Convert filtered projects to CSV
        const headers = ["Project ID", "Project Name", "Owner", "Status", "Progress", "Deadline"];
        const csvContent = [
            headers.join(","),
            ...filteredProjects.map(project =>
                [
                    project.id,
                    `"${project.name}"`,
                    `"${project.owner}"`,
                    project.status,
                    project.progress,
                    `"${project.deadline}"`
                ].join(",")
            )
        ].join("\n");

        // Create blob and download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `projects_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Page Header with Search */}
            <PageHeader
                title="All Projects List"
                description="Complete overview of all your projects"
                searchPlaceholder="Search projects..."
                searchValue={searchValue}
                onSearchChange={(e) => setSearchValue(e.target.value)}
            />

            {/* Date Filter and Export Button Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                {/* Date Filter - Left Side */}
                <DateFilter
                    onFilterChange={setDateFilterState}
                    initialFilter="all"
                />

                {/* Export Button - Right Side */}
                <Button
                    onClick={handleExport}
                    className="bg-[#6051E2] hover:bg-[#4a3db8] text-white px-4 py-2 h-9 sm:h-10 text-sm font-medium cursor-pointer flex items-center gap-2 w-full sm:w-auto"
                >
                    <FiDownload className="h-4 w-4" />
                    Export
                </Button>
            </div>

            {/* Show selected custom range */}
            {dateFilterState.filter === "custom" && dateFilterState.startDate && dateFilterState.endDate && (
                <div className="flex items-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 w-fit">
                    <span>{dateFilterState.startDate} - {dateFilterState.endDate}</span>
                </div>
            )}

            {/* Projects Table */}
            <Card className="overflow-hidden">
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
                                {filteredProjects.map((project, index) => (
                                    <TableRow
                                        key={index}
                                        className={`border-b border-slate-100 hover:bg-slate-50 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                                            }`}
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
                                                <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[100px]">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full"
                                                        style={{ width: `${Math.min(project.progress / 6, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs sm:text-sm">{project.progress}</span>
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
                                    <TableHead className="py-3 px-4 text-white font-semibold text-sm">
                                        Owner
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
                                {filteredProjects.map((project, index) => (
                                    <TableRow
                                        key={index}
                                        className={`border-b border-slate-100 hover:bg-slate-50 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                                            }`}
                                    >
                                        <TableCell className="py-3 px-4 text-slate-800 text-sm">
                                            {project.id}
                                        </TableCell>
                                        <TableCell className="py-3 px-4 text-slate-800 text-sm">
                                            {project.name}
                                        </TableCell>
                                        <TableCell className="py-3 px-4 text-slate-600 text-sm">
                                            {project.owner}
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
                                                <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[80px]">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full"
                                                        style={{ width: `${Math.min(project.progress / 6, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs">{project.progress}</span>
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
                        {filteredProjects.map((project, index) => (
                            <div
                                key={index}
                                className={`p-4 space-y-3 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                            >
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
                                                    style={{ width: `${Math.min(project.progress / 6, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-slate-700 font-medium text-xs">
                                                {project.progress}
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
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredProjects.length === 0 && (
                        <div className="text-center py-8 sm:py-10 text-slate-500 text-sm sm:text-base">
                            No projects found matching your search.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
