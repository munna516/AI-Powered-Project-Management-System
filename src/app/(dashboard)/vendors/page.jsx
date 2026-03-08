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
import DateFilter, { getDateRangeFromFilter } from "@/components/DateFilter/Datefilter";
import PageHeader from "@/components/PageHeader/PageHeader";
import { FiPlus, FiDownload, FiEdit2, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loading from "@/components/Loading/Loading";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { apiDelete, apiGet } from "@/lib/api";

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
    const queryClient = useQueryClient();
    const [searchValue, setSearchValue] = useState("");
    const [dateFilterState, setDateFilterState] = useState({
        filter: "all",
        startDate: null,
        endDate: null,
    });

    const { data: vendors, isLoading: isVendorsLoading } = useQuery({
        queryKey: ["vendors"],
        queryFn: () => apiGet("/api/project-manager/vendor-management/all"),
    });

    const vendorList = useMemo(() => {
        const rawVendors = Array.isArray(vendors?.data)
            ? vendors.data
            : Array.isArray(vendors?.data?.data)
                ? vendors.data.data
                : [];

        return rawVendors.map((vendor) => ({
            id: vendor.id,
            name: vendor.name || "-",
            designation: vendor.designation || "-",
            email: vendor.email || "-",
            status: Array.isArray(vendor.slas) && vendor.slas.length > 0 ? "Submitted" : "Pending",
            totalProjects: vendor.numberOfProjects || "0",
            createdAt: vendor.createdAt || vendor.updatedAt || null,
            projectId: vendor.projectId || (Array.isArray(vendor.projectIds) ? vendor.projectIds[0] : vendor.projectIds) || "",
            projectName:
                vendor.projectName ||
                vendor.category ||
                vendor.project?.name ||
                vendor.project?.title ||
                (Array.isArray(vendor.projects) ? vendor.projects[0]?.name || vendor.projects[0]?.title : ""),
        }));
    }, [vendors]);

    const deleteVendorMutation = useMutation({
        mutationFn: async (vendorId) =>
            apiDelete(`/api/project-manager/vendor-management/${vendorId}`),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["vendors"] });
            await Swal.fire({
                title: "Deleted!",
                text: "Vendor deleted successfully.",
                icon: "success",
                confirmButtonColor: "#6051E2",
            });
        },
        onError: async (error) => {
            await Swal.fire({
                title: "Failed",
                text: error?.message || "Failed to delete vendor.",
                icon: "error",
                confirmButtonColor: "#6051E2",
            });
        },
    });

    const handleAddVendor = () => {
        router.push("/vendors/add-vendor");
    };

    const handleEditVendor = (vendor) => {
        const params = new URLSearchParams({
            vendorId: String(vendor.id),
        });

        if (vendor.projectId) {
            params.set("projectId", String(vendor.projectId));
        }
        if (vendor.projectName) {
            params.set("projectName", vendor.projectName);
        }

        router.push(`/vendors/add-vendor?${params.toString()}`);
    };

    const handleDeleteVendor = async (vendorId) => {
        const result = await Swal.fire({
            title: "Delete vendor?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6051E2",
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;
        deleteVendorMutation.mutate(vendorId);
    };

    const handleExport = () => {
        toast.success("Vendors data exported successfully!");
    };

    const filteredVendors = useMemo(() => {
        let filtered = vendorList;
        const { start, end } = getDateRangeFromFilter(
            dateFilterState.filter,
            dateFilterState.startDate,
            dateFilterState.endDate
        );

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

        // Date filtering
        if (start || end) {
            filtered = filtered.filter((vendor) => {
                if (!vendor.createdAt) return false;
                const vendorDate = new Date(vendor.createdAt);
                if (Number.isNaN(vendorDate.getTime())) return false;
                if (start && vendorDate < start) return false;
                if (end && vendorDate > end) return false;
                return true;
            });
        }

        return filtered;
    }, [searchValue, dateFilterState, vendorList]);

    if (isVendorsLoading) {
        return <Loading />;
    }
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
                    <DateFilter
                        onFilterChange={setDateFilterState}
                        initialFilter="all"
                    />

                    {/* Export Button - Right Side */}
                    {/* <Button
                        onClick={handleExport}
                        className="bg-[#6051E2] hover:bg-[#4a3db8] text-white px-4 py-2 h-9 sm:h-10 text-sm font-medium cursor-pointer flex items-center gap-2 w-full sm:w-auto"
                    >
                        <FiDownload className="h-4 w-4" />
                        Export
                    </Button> */}
                </div>

                {/* Show selected custom range */}
                {dateFilterState.filter === "custom" && dateFilterState.startDate && dateFilterState.endDate && (
                    <div className="flex items-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 w-fit">
                        <span>{dateFilterState.startDate} - {dateFilterState.endDate}</span>
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
                                        <TableHead className="py-3 px-4 lg:py-4 lg:px-6 text-white font-semibold text-center text-sm lg:text-base">
                                            Action
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
                                            <TableCell className="py-3 px-4 lg:py-4 lg:px-6">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        type="button"
                                                        className="text-primary hover:text-primary/80 transition cursor-pointer"
                                                        onClick={() => handleEditVendor(vendor)}
                                                    >
                                                        <FiEdit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="text-red-500 hover:text-red-600 transition cursor-pointer"
                                                        onClick={() => handleDeleteVendor(vendor.id)}
                                                    >
                                                        <FiTrash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
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
                                        <TableHead className="py-3 px-4 text-white font-semibold text-center text-sm">
                                            Action
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
                                            <TableCell className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        type="button"
                                                        className="text-primary hover:text-primary/80 transition cursor-pointer"
                                                        onClick={() => handleEditVendor(vendor)}
                                                    >
                                                        <FiEdit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="text-red-500 hover:text-red-600 transition cursor-pointer"
                                                        onClick={() => handleDeleteVendor(vendor.id)}
                                                    >
                                                        <FiTrash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
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
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            className="flex-1 rounded-md border border-primary px-4 py-2 text-primary hover:bg-primary/5 transition cursor-pointer"
                                            onClick={() => handleEditVendor(vendor)}
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                <FiEdit2 className="h-4 w-4" />
                                                Edit
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            className="flex-1 rounded-md border border-red-200 px-4 py-2 text-red-500 hover:bg-red-50 transition cursor-pointer"
                                            onClick={() => handleDeleteVendor(vendor.id)}
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                <FiTrash2 className="h-4 w-4" />
                                                Delete
                                            </span>
                                        </button>
                                    </div>
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
