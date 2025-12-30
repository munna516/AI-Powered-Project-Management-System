"use client";
import { useState } from "react";
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
import { FiPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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

    const handleAddVendor = () => {
        router.push("/vendors/add-vendor");
    };

    const filteredVendors = vendorsData.filter(
        (vendor) =>
            vendor.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            vendor.designation.toLowerCase().includes(searchValue.toLowerCase()) ||
            vendor.email.toLowerCase().includes(searchValue.toLowerCase())
    );

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
