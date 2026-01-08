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
import PageHeader from "@/components/PageHeader/PageHeader";
import { FiPlus, FiDownload } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const vendorsData = [
    {
        id: 1,
        name: "Dipti",
        designation: "Project Manager",
        email: "dipti@gmail.com",
        status: "Submitted",
        totalProjects: "02",
    },
    {
        id: 2,
        name: "Rifat",
        designation: "Product Manager",
        email: "rifat@gmail.com",
        status: "Submitted",
        totalProjects: "09",
    },
    {
        id: 3,
        name: "Anik",
        designation: "Business Analyst",
        email: "anik@gmail.com",
        status: "Submitted",
        totalProjects: "18",
    },
    {
        id: 4,
        name: "Jenny",
        designation: "Product Strategist",
        email: "jenny@gmail.com",
        status: "Submitted",
        totalProjects: "07",
    },
    {
        id: 5,
        name: "Guy Hawkins",
        designation: "Program Coordinator",
        email: "guy@gmail.com",
        status: "Submitted",
        totalProjects: "06",
    },
    {
        id: 6,
        name: "Robert Fox",
        designation: "Product Strategist",
        email: "robert@gmail.com",
        status: "Submitted",
        totalProjects: "09",
    },
    {
        id: 7,
        name: "Jacob Jones",
        designation: "Scrum Master",
        email: "jacob@gmail.com",
        status: "Submitted",
        totalProjects: "11",
    },
    {
        id: 8,
        name: "Patricia Williams",
        designation: "Graphic Designer",
        email: "patricia@gmail.com",
        status: "Submitted",
        totalProjects: "10",
    },
];

const getStatusStyle = (status) => {
    switch (status) {
        case "Submitted":
            return "bg-green-100 text-green-600";
        case "In Review":
            return "bg-blue-100 text-blue-600";
        case "Pending":
            return "bg-yellow-100 text-yellow-600";
        default:
            return "bg-gray-100 text-gray-600";
    }
};

export default function Vendors() {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState("");
    const [dateFilter, setDateFilter] = useState("all");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");

    const handleAddVendor = () => {
        router.push("/vendors/add-vendor");
    };

    const handleFilterChange = (value) => {
        setDateFilter(value);
        if (value !== "custom") {
            setCustomStartDate("");
            setCustomEndDate("");
        }
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
        return "All Time";
    };

    const handleExport = () => {
        toast.success("Vendors data exported successfully!");
    };

    const filteredVendors = useMemo(() => {
        let filtered = vendorsData;

        // Search filtering
        if (searchValue.trim()) {
            const searchLower = searchValue.toLowerCase();
            filtered = filtered.filter(
                (vendor) =>
                    vendor.name.toLowerCase().includes(searchLower) ||
                    vendor.designation.toLowerCase().includes(searchLower) ||
                    vendor.email.toLowerCase().includes(searchLower)
            );
        }

        // Date filtering can be added here if vendors have date fields
        // For now, we'll just return the filtered data

        return filtered;
    }, [searchValue, dateFilter, customStartDate, customEndDate]);

    return (
        <div className="w-full">
            <div className="space-y-4 sm:space-y-6">
                <PageHeader
                    title="Vendors list"
                    description="AI powered insights for all your projects"
                    searchPlaceholder="Search vendors"
                    searchValue={searchValue}
                    onSearchChange={(e) => setSearchValue(e.target.value)}
                    buttonLabel="Add Vendors"
                    buttonIcon={<FiPlus className="h-4 w-4" />}
                    onButtonClick={handleAddVendor}
                />

                {/* Date Filter and Export Button */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between">
                    {/* Date Filter - Left Side */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                        <div className="flex flex-col gap-2 min-w-[200px] sm:min-w-[220px]">
                            <label className="text-xs sm:text-sm font-medium text-slate-700">
                                Filter by Date
                            </label>
                            <Select value={dateFilter} onValueChange={handleFilterChange}>
                                <SelectTrigger className="h-9 sm:h-10 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="7days">Last 7 Days</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                    <SelectItem value="custom">Custom Range</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Custom Date Range Inputs */}
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
                        {dateFilter !== "custom" && dateFilter !== "all" && (
                            <div className="flex items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 min-w-[180px] sm:min-w-[200px] h-9 sm:h-10">
                                <span className="text-xs sm:text-sm">{formatDateRange()}</span>
                            </div>
                        )}
                    </div>

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
                {dateFilter === "custom" && customStartDate && customEndDate && (
                    <div className="flex items-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 w-fit">
                        <span>{formatDateRange()}</span>
                    </div>
                )}

                {/* Table Card */}
                <Card className="overflow-hidden mt-6 sm:mt-10">
                    <CardContent className="p-0">
                        {/* Desktop & Large Tablet Table (lg and above) */}
                        <div className="hidden lg:block overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-[#6051E2] text-white">
                                    <TableRow className="border-b-0">
                                        <TableHead className="py-3 px-4 lg:py-4 lg:px-6 text-white font-semibold text-sm lg:text-base">
                                            Vendor Name
                                        </TableHead>
                                        <TableHead className="py-3 px-4 lg:py-4 lg:px-6 text-white font-semibold text-sm lg:text-base">
                                            Designation
                                        </TableHead>
                                        <TableHead className="py-3 px-4 lg:py-4 lg:px-6 text-white font-semibold text-sm lg:text-base">
                                            Mail
                                        </TableHead>
                                        <TableHead className="py-3 px-4 lg:py-4 lg:px-6 text-white font-semibold text-center text-sm lg:text-base">
                                            Status (SLAs)
                                        </TableHead>
                                        <TableHead className="py-3 px-4 lg:py-4 lg:px-6 text-white font-semibold text-center text-sm lg:text-base">
                                            Total project
                                        </TableHead>
                                        <TableHead className="py-3 px-4 lg:py-4 lg:px-6 text-white font-semibold text-center text-sm lg:text-base">
                                            Details view
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredVendors.map((vendor) => (
                                        <TableRow
                                            key={vendor.id}
                                            className="border-b border-slate-100 hover:bg-slate-50"
                                        >
                                            <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-slate-800 text-sm lg:text-base">
                                                {vendor.name}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-slate-600 text-sm lg:text-base">
                                                {vendor.designation}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-slate-600 text-sm lg:text-base">
                                                {vendor.email}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-center">
                                                <span
                                                    className={`px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs font-medium ${getStatusStyle(
                                                        vendor.status
                                                    )}`}
                                                >
                                                    {vendor.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-slate-600 text-center text-sm lg:text-base">
                                                {vendor.totalProjects}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 lg:py-4 lg:px-6 text-center">
                                                <button
                                                    className="text-primary hover:underline text-xs lg:text-sm font-medium cursor-pointer"
                                                    onClick={() => router.push(`/vendors/view/${vendor.id}`)}
                                                >
                                                    view
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Medium Tablet Table (md to lg) - Simplified */}
                        <div className="hidden md:block lg:hidden overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-[#6051E2] text-white">
                                    <TableRow className="border-b-0">
                                        <TableHead className="py-3 px-4 text-white font-semibold text-sm">
                                            Vendor Name
                                        </TableHead>
                                        <TableHead className="py-3 px-4 text-white font-semibold text-sm">
                                            Designation
                                        </TableHead>
                                        <TableHead className="py-3 px-4 text-white font-semibold text-center text-sm">
                                            Status
                                        </TableHead>
                                        <TableHead className="py-3 px-4 text-white font-semibold text-center text-sm">
                                            Projects
                                        </TableHead>
                                        <TableHead className="py-3 px-4 text-white font-semibold text-center text-sm">
                                            View
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredVendors.map((vendor) => (
                                        <TableRow
                                            key={vendor.id}
                                            className="border-b border-slate-100 hover:bg-slate-50"
                                        >
                                            <TableCell className="py-3 px-4 text-slate-800 text-sm">
                                                <div>
                                                    <div className="font-medium">{vendor.name}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{vendor.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-slate-600 text-sm">
                                                {vendor.designation}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-center">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                                                        vendor.status
                                                    )}`}
                                                >
                                                    {vendor.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-slate-600 text-center text-sm">
                                                {vendor.totalProjects}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-center">
                                                <button
                                                    className="text-primary hover:underline text-xs font-medium cursor-pointer"
                                                    onClick={() => router.push(`/vendors/view/${vendor.id}`)}
                                                >
                                                    view
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Cards (small screens) */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {filteredVendors.map((vendor) => (
                                <div key={vendor.id} className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-slate-800 text-base">
                                            {vendor.name}
                                        </h3>
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                                                vendor.status
                                            )}`}
                                        >
                                            {vendor.status}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Designation</span>
                                            <span className="text-slate-700 font-medium">
                                                {vendor.designation}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Email</span>
                                            <span className="text-slate-700 text-xs sm:text-sm break-all text-right max-w-[60%]">
                                                {vendor.email}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Total Projects</span>
                                            <span className="text-slate-700 font-medium">
                                                {vendor.totalProjects}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full cursor-pointer text-sm sm:text-base"
                                        onClick={() => router.push(`/vendors/view/${vendor.id}`)}
                                    >
                                        View Details
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {filteredVendors.length === 0 && (
                            <div className="text-center py-8 sm:py-10 text-slate-500 text-sm sm:text-base">
                                No vendors found matching your search.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
