"use client";
import { useState, useEffect, useMemo } from "react";
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Utility function to get date range based on filter type
export const getDateRangeFromFilter = (filter, startDate, endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
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
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            if (end) end.setHours(23, 59, 59, 999);
            return { start, end };
        }
        default:
            return { start: null, end: null }; // All time - no filtering
    }
};

// Utility hook for date filtering
export const useDateFilter = (filter, startDate, endDate) => {
    return useMemo(() => {
        return getDateRangeFromFilter(filter, startDate, endDate);
    }, [filter, startDate, endDate]);
};

export default function DateFilter({
    onFilterChange,
    initialFilter = "all",
    className = ""
}) {
    const [dateFilter, setDateFilter] = useState(initialFilter);
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");

    const handleFilterChange = (value) => {
        setDateFilter(value);
        if (value !== "custom") {
            setCustomStartDate("");
            setCustomEndDate("");
            // Notify parent immediately when switching away from custom
            if (onFilterChange) {
                onFilterChange({
                    filter: value,
                    startDate: null,
                    endDate: null,
                });
            }
        }
    };

    const handleStartDateChange = (e) => {
        const value = e.target.value;
        setCustomStartDate(value);
    };

    const handleEndDateChange = (e) => {
        const value = e.target.value;
        setCustomEndDate(value);
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

    // Notify parent component whenever filter values change
    useEffect(() => {
        if (onFilterChange) {
            onFilterChange({
                filter: dateFilter,
                startDate: customStartDate || null,
                endDate: customEndDate || null,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateFilter, customStartDate, customEndDate]);

    return (
        <div className={`flex flex-col sm:flex-row gap-3 sm:items-end ${className}`}>
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
                            onChange={handleStartDateChange}
                            className="h-9 sm:h-10 text-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-1 min-w-[140px]">
                        <label className="text-xs text-slate-600">End Date</label>
                        <Input
                            type="date"
                            value={customEndDate}
                            onChange={handleEndDateChange}
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
    );
}
