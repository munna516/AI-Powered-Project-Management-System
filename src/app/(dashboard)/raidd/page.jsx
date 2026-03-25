"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FiDownload, FiEye } from "react-icons/fi";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import DateFilter, { getDateRangeFromFilter } from "@/components/DateFilter/Datefilter";
import PageHeader from "@/components/PageHeader/PageHeader";
import Loading from "@/components/Loading/Loading";
import { apiGet } from "@/lib/api";

const tabLabelMap = {
    risk: "Risk",
    issues: "Issues",
    assumptions: "Assumptions",
    decisions: "Decisions",
    dependencies: "Dependencies",
};

const tabs = [
    { id: "risk", label: "Risk" },
    { id: "issues", label: "Issues" },
    { id: "assumptions", label: "Assumptions" },
    { id: "decisions", label: "Decisions" },
    { id: "dependencies", label: "Dependencies" },
];

const normalizeTabType = (value) => {
    const normalized = String(value || "").trim().toLowerCase();

    switch (normalized) {
        case "risk":
        case "risks":
            return "risk";
        case "issue":
        case "issues":
            return "issues";
        case "assumption":
        case "assumptions":
            return "assumptions";
        case "decision":
        case "decisions":
            return "decisions";
        case "dependency":
        case "dependencies":
            return "dependencies";
        default:
            return normalized;
    }
};

const formatLabel = (value) => {
    if (!value) return "Not available";
    return String(value)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (value) => {
    if (!value) return "Not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const normalizeRaiddItem = (item, index) => {
    const rawDate =
        item?.created_at ||
        item?.createdAt ||
        item?.updated_at ||
        item?.updatedAt ||
        null;

    return {
        id: String(item?.id || index),
        type: normalizeTabType(item?.type),
        projectId: String(item?.projectId || item?.project?.id || "Not available"),
        projectName: item?.project?.name || "Not available",
        vendorName: item?.project?.vendorName || item?.project?.vendor?.name || "Not available",
        status: formatLabel(item?.status),
        title: item?.title || "Not available",
        description: item?.description || "Not available",
        rawDate,
        date: formatDate(rawDate),
    };
};

const getStatusStyle = (status) => {
    const statusLower = String(status || "").toLowerCase();

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

const viewButtonClass =
    "inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#6051E2]/20 bg-[#6051E2]/10 text-[#6051E2] transition-colors hover:bg-[#6051E2] hover:text-white cursor-pointer";

export default function RAIDD() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("risk");
    const [searchValue, setSearchValue] = useState("");
    const [dateFilterState, setDateFilterState] = useState({
        filter: "all",
        startDate: null,
        endDate: null,
    });

    const {
        data: raiddResponse,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["raidd-list"],
        queryFn: async () => {
            try {
                return await apiGet("/api/project-manager/raidd//all");
            } catch {
                return apiGet("/api/project-manager/raidd/all");
            }
        },
    });

    const allData = useMemo(() => {
        const rawData = Array.isArray(raiddResponse?.data)
            ? raiddResponse.data
            : Array.isArray(raiddResponse?.data?.data)
                ? raiddResponse.data.data
                : [];

        return rawData.map(normalizeRaiddItem);
    }, [raiddResponse]);

    useEffect(() => {
        if (tabs.length === 0) return;
        if (!tabs.some((tab) => tab.id === activeTab)) {
            setActiveTab(tabs[0].id);
        }
    }, [activeTab, tabs]);

    const getDateRange = useMemo(() => {
        return getDateRangeFromFilter(
            dateFilterState.filter,
            dateFilterState.startDate,
            dateFilterState.endDate
        );
    }, [dateFilterState]);

    const handleExport = () => {
        toast.success(`${formatLabel(activeTab)} data exported successfully!`);
    };

    const filteredData = useMemo(() => {
        let filtered = allData.filter((item) => item.type === activeTab);

        if (searchValue.trim()) {
            const searchLower = searchValue.toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.projectId.toLowerCase().includes(searchLower) ||
                    item.projectName.toLowerCase().includes(searchLower) ||
                    item.vendorName.toLowerCase().includes(searchLower) ||
                    item.title.toLowerCase().includes(searchLower) ||
                    item.description.toLowerCase().includes(searchLower) ||
                    item.date.toLowerCase().includes(searchLower)
            );
        }

        if (dateFilterState.filter !== "all") {
            const { start, end } = getDateRange;
            if (start && end) {
                filtered = filtered.filter((item) => {
                    if (!item.rawDate) return true;
                    const itemDate = new Date(item.rawDate);
                    if (Number.isNaN(itemDate.getTime())) return true;
                    return itemDate >= start && itemDate <= end;
                });
            }
        }

        return filtered;
    }, [activeTab, allData, searchValue, dateFilterState.filter, getDateRange]);

    if (isLoading) {
        return <Loading />;
    }

    if (isError) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-sm text-slate-500 sm:text-base">
                    {error?.message || "Failed to load RAIDD data."}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <PageHeader
                title="RAIDD"
                description="AI powered insights for all your projects"
                searchPlaceholder="search RAIDD"
                searchValue={searchValue}
                onSearchChange={(e) => setSearchValue(e.target.value)}
            />

            <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-wrap gap-3 lg:flex-nowrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm cursor-pointer ${
                                activeTab === tab.id
                                    ? "bg-[#6051E2] text-white"
                                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <DateFilter onFilterChange={setDateFilterState} initialFilter="all" />

                <Button
                    onClick={handleExport}
                    className="flex h-9 w-full items-center gap-2 bg-[#6051E2] px-4 py-2 text-sm font-medium text-white hover:bg-[#4a3db8] sm:h-10 lg:w-auto cursor-pointer"
                >
                    <FiDownload className="h-4 w-4" />
                    Export
                </Button>
            </div>

            {dateFilterState.filter === "custom" &&
                dateFilterState.startDate &&
                dateFilterState.endDate && (
                    <div className="mt-2 flex w-fit items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
                        <span>
                            {dateFilterState.startDate} - {dateFilterState.endDate}
                        </span>
                    </div>
                )}

            <Card className="mt-4 overflow-hidden sm:mt-6">
                <CardContent className="p-0">
                    <div className="hidden overflow-x-auto lg:block">
                        <Table>
                            <TableHeader className="bg-[#6051E2] text-white">
                                <TableRow className="border-b-0">
                                    <TableHead className="px-4 py-3 text-sm font-semibold text-white lg:px-6 lg:py-4 lg:text-base">
                                        Project ID
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-sm font-semibold text-white lg:px-6 lg:py-4 lg:text-base">
                                        Project Name
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-center text-sm font-semibold text-white lg:px-6 lg:py-4 lg:text-base">
                                        Status
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-sm font-semibold text-white lg:px-6 lg:py-4 lg:text-base">
                                        Vendor Name
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-sm font-semibold text-white lg:px-6 lg:py-4 lg:text-base">
                                        Date
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-center text-sm font-semibold text-white lg:px-6 lg:py-4 lg:text-base">
                                        View Details
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((item, index) => (
                                    <TableRow
                                        key={item.id}
                                        className="border-b border-slate-100 hover:bg-slate-50"
                                    >
                                        <TableCell className="px-4 py-3 text-sm text-slate-800 lg:px-6 lg:py-4 lg:text-base">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-slate-800 lg:px-6 lg:py-4 lg:text-base">
                                            {item.projectName}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center lg:px-6 lg:py-4">
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs font-medium capitalize lg:px-3 lg:py-1 ${getStatusStyle(
                                                    item.status
                                                )}`}
                                            >
                                                {item.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-slate-600 lg:px-6 lg:py-4 lg:text-base">
                                            {item.vendorName}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-slate-600 lg:px-6 lg:py-4 lg:text-base">
                                            {item.date}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center lg:px-6 lg:py-4">
                                            <button
                                                className={viewButtonClass}
                                                onClick={() => router.push(`/raidd/view/${item.id}`)}
                                                title="View details"
                                                aria-label="View details"
                                            >
                                                <FiEye className="h-4 w-4" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="hidden overflow-x-auto md:block lg:hidden">
                        <Table>
                            <TableHeader className="bg-[#6051E2] text-white">
                                <TableRow className="border-b-0">
                                    <TableHead className="px-4 py-3 text-sm font-semibold text-white">
                                        Project ID
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-sm font-semibold text-white">
                                        Project Name
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-center text-sm font-semibold text-white">
                                        Status
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-sm font-semibold text-white">
                                        Vendor Name
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-sm font-semibold text-white">
                                        Date
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-center text-sm font-semibold text-white">
                                        View
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((item, index) => (
                                    <TableRow
                                        key={item.id}
                                        className="border-b border-slate-100 hover:bg-slate-50"
                                    >
                                        <TableCell className="px-4 py-3 text-sm text-slate-800">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-slate-800">
                                            {item.projectName}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getStatusStyle(
                                                    item.status
                                                )}`}
                                            >
                                                {item.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-slate-600">
                                            {item.vendorName}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-slate-600">
                                            {item.date}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-center">
                                            <button
                                                className={viewButtonClass}
                                                onClick={() => router.push(`/raidd/view/${item.id}`)}
                                                title="View details"
                                                aria-label="View details"
                                            >
                                                <FiEye className="h-4 w-4" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="divide-y divide-slate-100 md:hidden">
                        {filteredData.map((item, index) => (
                            <div key={item.id} className="space-y-3 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-base font-semibold text-slate-800">
                                            {item.projectName}
                                        </h3>
                                        <p className="mt-1 text-xs text-slate-500">
                                            ID: {index + 1}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusStyle(
                                            item.status
                                        )}`}
                                    >
                                        {item.status}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">Vendor</span>
                                        <span className="text-right text-slate-700">
                                            {item.vendorName}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">Date</span>
                                        <span className="text-right text-slate-700">
                                            {item.date}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className="inline-flex w-full items-center justify-center gap-2 pt-2 text-sm font-medium text-primary hover:underline cursor-pointer"
                                    onClick={() => router.push(`/raidd/view/${item.id}`)}
                                >
                                    <FiEye className="h-4 w-4" />
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>

                    {filteredData.length === 0 && (
                        <div className="py-8 text-center text-sm text-slate-500 sm:py-10 sm:text-base">
                            No raidd found.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
