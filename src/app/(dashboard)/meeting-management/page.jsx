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
import { Input } from "@/components/ui/input";
import { FiSearch, FiEye, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import Loading from "@/components/Loading/Loading";

export default function MeetingManagement() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");
  const router = useRouter();
  const [dateFilter, setDateFilter] = useState("today");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const handleFilterChange = (value) => {
    setDateFilter(value);
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
    return "";
  };

  const {
    data: meetingsResponse,
    isLoading: isMeetingsLoading,
    isError: isMeetingsError,
    error: meetingsError,
  } = useQuery({
    queryKey: ["my-meetings"],
    queryFn: () => apiGet("/api/project-manager/project-meeting/my-meetings"),
  });

  const meetingsRaw = useMemo(() => {
    const r1 = meetingsResponse?.data;
    const r2 = meetingsResponse?.data?.data;
    const r3 = meetingsResponse?.data?.meetings;

    if (Array.isArray(r1)) return r1;
    if (Array.isArray(r2)) return r2;
    if (Array.isArray(r3)) return r3;
    return [];
  }, [meetingsResponse]);

  const normalizeMeeting = (m) => {
    const id = m?.id ?? m?.meetingId ?? m?._id ?? "";
    const dateTime = m?.createdAt ?? m?.dateTime ?? m?.meetingDateTime ?? m?.meetingDate ?? m?.startTime ?? m?.time ?? null;
    const platform = m?.platform ?? m?.source ?? m?.meetingPlatform ?? m?.meetingSource ?? "Zoom";
    const recordingLink = m?.videoPlayUrl ?? m?.meetingRecordingLink ?? m?.recording_url ?? m?.link ?? m?.url ?? "";

    return {
      id: String(id),
      dateTime,
      platform: String(platform || ""),
      recordingLink: String(recordingLink || ""),
    };
  };

  const normalizedMeetings = useMemo(
    () => meetingsRaw.map(normalizeMeeting).filter((m) => Boolean(m.id)),
    [meetingsRaw]
  );

  const getDateRangeLocal = () => {
    const now = new Date();

    if (dateFilter === "custom") {
      if (!customStartDate || !customEndDate) return { start: null, end: null };
      const start = new Date(`${customStartDate}T00:00:00`);
      const end = new Date(`${customEndDate}T23:59:59.999`);
      return { start, end };
    }

    if (dateFilter === "today") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    if (dateFilter === "7days") {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    if (dateFilter === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    return { start: null, end: null };
  };

  const filteredData = useMemo(() => {
    let filtered = normalizedMeetings;

    // Filter by source/platform
    if (selectedSource !== "all") {
      filtered = filtered.filter((item) => {
        const platformLower = String(item.platform || "").toLowerCase();
        if (selectedSource === "zoom") return platformLower.includes("zoom");
        if (selectedSource === "google-meet") return platformLower.includes("google") || platformLower.includes("meet");
        return true;
      });
    }

    // Filter by source - if "all" is selected, show everything, otherwise filter by selected source
    // (Handled above via platform filter.)

    // Filter by search
    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          String(item.platform || "").toLowerCase().includes(searchLower) ||
          String(item.dateTime || "").toLowerCase().includes(searchLower) ||
          String(item.recordingLink || "").toLowerCase().includes(searchLower)
      );
    }

    // Filter by date range
    const { start, end } = getDateRangeLocal();
    if (start && end) {
      filtered = filtered.filter((item) => {
        if (!item.dateTime) return true;
        const d = new Date(item.dateTime);
        if (Number.isNaN(d.getTime())) return true;
        return d >= start && d <= end;
      });
    }

    return filtered;
  }, [
    normalizedMeetings,
    searchValue,
    selectedSource,
    dateFilter,
    customStartDate,
    customEndDate,
  ]);

  const handleSourceChange = (sourceId) => {
    setSelectedSource(sourceId);
  };

  const handleViewDetails = (id) => {
    router.push(`/meeting-management/meeting-summary?id=${id}`);
  };

  const sourceTabs = [
    { id: "all", label: "All sources" },
    { id: "zoom", label: "Zoom" },
    { id: "google-meet", label: "Google meet" },
  ];

  const formatMeetingDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isMeetingsLoading) {
    return <Loading />;
  }

  if (isMeetingsError) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-slate-500 sm:text-base">
          {meetingsError?.message || "Failed to load meetings."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Meeting Management</h1>
      </div>



      {/* Search Bar with Filter Icon */}
      <div className="relative mt-4 sm:mt-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          type="text"
          placeholder="Find out your project easlily with filter"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10 pr-20 py-7 bg-white border-[#6051E2] !text-md md:!text-lg placeholder:!text-md md:placeholder:!text-lg"
        />

      </div>


      <div className="flex justify-between items-center gap-4">

        {/* Source Filter Tabs */}
        <div className="flex flex-wrap gap-3 mt-4 sm:mt-6">
          {sourceTabs.map((tab) => {
            const isActive = selectedSource === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleSourceChange(tab.id)}
                className={`px-4 py-2 text-sm sm:text-base font-medium rounded-md transition-colors cursor-pointer flex items-center gap-2 ${isActive
                  ? "bg-[#6051E2] text-white"
                  : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* here I want to show the global date filter */}
        <div className="flex flex-col gap-3">
          {/* Filter Row - All on same line for custom range */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            {/* Date Filter */}
            <div className="flex flex-col gap-2 min-w-[200px] sm:min-w-[220px]">
              <label className="text-xs sm:text-sm font-medium text-slate-700">
                Filter by Date
              </label>
              <Select value={dateFilter} onValueChange={handleFilterChange}>
                <SelectTrigger
                  className="h-9 sm:h-10 text-sm">
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


      {/* Data Table */}
      <Card className="overflow-hidden mt-4 sm:mt-6">
        <CardContent className="p-0">
          {/* Desktop & Large Tablet Table */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#6051E2] text-white">
                <TableRow className="border-b-0 hover:bg-[#6051E2]">
                  <TableHead className="py-3 px-4 text-white font-semibold">Date</TableHead>
                  <TableHead className="py-3 px-4 text-white font-semibold">Platform</TableHead>
                  <TableHead className="py-3 px-4 text-white font-semibold">Meeting recordings link</TableHead>
                  <TableHead className="py-3 px-4 text-white font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-slate-500"
                    >
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <TableCell className="py-3 px-4 text-slate-800">
                        {formatMeetingDate(item.dateTime)}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-slate-800">{item.platform || "-"}</TableCell>
                      <TableCell className="py-3 px-4">
                        {item.recordingLink ? (
                          <a
                            href={item.recordingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                          >
                            Click to view
                          </a>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(item.id)}
                            className="text-[#6051E2] hover:text-[#4a3db8] transition-colors cursor-pointer"
                            title="View details"
                            aria-label="View details"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>

                          <span
                            className="text-slate-400"
                            title="Delete not wired"
                            aria-label="Delete"
                          >
                            <FiTrash2 className="h-4 w-4 cursor-not-allowed opacity-60" />
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile & Tablet Cards */}
          <div className="lg:hidden">
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No data found
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredData.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 space-y-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <p className="text-xs text-slate-500">Date</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatMeetingDate(item.dateTime)}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">Platform</p>
                        <p className="text-sm font-medium text-slate-800">
                          {item.platform || "-"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewDetails(item.id)}
                        className="text-[#6051E2] hover:text-[#4a3db8] transition-colors cursor-pointer flex-shrink-0 ml-2"
                        title="View details"
                        aria-label="View details"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div>
                        <p className="text-slate-500">Meeting recordings link</p>
                        {item.recordingLink ? (
                          <a
                            href={item.recordingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors break-all"
                          >
                            Click to view
                          </a>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
