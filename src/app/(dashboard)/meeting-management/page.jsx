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

const ALL_CALENDAR_EVENTS_API = "/api/project-manager/google-calendar/all-events";

const getEventsListFromResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

export default function MeetingManagement() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");
  const router = useRouter();
  const [dateFilter, setDateFilter] = useState("all");
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
    } else if (dateFilter === "all") {
      return "All Dates";
    }
    return "";
  };

  const {
    data: eventsResponse,
    isLoading: isEventsLoading,
    isError: isEventsError,
    error: eventsError,
  } = useQuery({
    queryKey: ["google-calendar-events"],
    queryFn: () => apiGet(ALL_CALENDAR_EVENTS_API),
  });

  const eventsRaw = useMemo(
    () => getEventsListFromResponse(eventsResponse),
    [eventsResponse]
  );

  const normalizeMeeting = (ev) => {
    const id = ev?.id ?? ev?.meetingId ?? ev?._id ?? "";
    const dateTime = ev?.start_time ?? ev?.start?.dateTime ?? ev?.start ?? ev?.meetingDate ?? ev?.createdAt ?? null;
    const eventType = String(ev?.type ?? "");
    const platform =
      ev?.location ??
      (eventType === "ZOOM_MEETING" ? "Zoom" : eventType.replace(/_/g, " ")) ??
      "Zoom";
    const recordingLink =
      ev?.url ?? ev?.htmlLink ?? ev?.videoPlayUrl ?? ev?.meetingRecordingLink ?? "";

    const projectTitle = ev?.projectName ?? ev?.project?.name ?? "Not available";
    const meetingTitle = ev?.title ?? ev?.summary ?? "Not available";

    return {
      id: String(id),
      dateTime,
      platform: String(platform || ""),
      eventType,
      recordingLink: String(recordingLink || ""),
      projectTitle,
      meetingTitle,
    };
  };

  const normalizedMeetings = useMemo(
    () => eventsRaw.map(normalizeMeeting).filter((m) => Boolean(m.id)),
    [eventsRaw]
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
        const typeLower = String(item.eventType || "").toLowerCase();
        if (selectedSource === "zoom") {
          return platformLower.includes("zoom") || typeLower.includes("zoom");
        }
        if (selectedSource === "google-meet") {
          return (
            platformLower.includes("google") ||
            platformLower.includes("meet") ||
            typeLower.includes("google")
          );
        }
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
          String(item.projectTitle || "").toLowerCase().includes(searchLower) ||
          String(item.meetingTitle || "").toLowerCase().includes(searchLower) ||
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
    // { id: "google-meet", label: "Google meet" },
  ];

  const formatMeetingDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const dateStr = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC"
    });
    const hours = String(d.getUTCHours()).padStart(2, "0");
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    return `${dateStr} • ${hours}:${minutes}`;
  };

  if (isEventsLoading) {
    return <Loading />;
  }

  if (isEventsError) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-slate-500 sm:text-base">
          {eventsError?.message || "Failed to load calendar events."}
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
                  <SelectItem value="all">All Dates</SelectItem>
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
                  <TableHead className="py-3 px-4 text-white font-semibold">Meeting Title</TableHead>
                  <TableHead className="py-3 px-4 text-white font-semibold">Project Title</TableHead>
                  <TableHead className="py-3 px-4 text-white font-semibold">Date & Time</TableHead>
                  <TableHead className="py-3 px-4 text-white font-semibold">Platform</TableHead>
                  <TableHead className="py-3 px-4 text-white font-semibold">Link</TableHead>
                  <TableHead className="py-3 px-4 text-white font-semibold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-slate-500"
                    >
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow
                      key={item.id}
                      onClick={() => handleViewDetails(item.id)}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                    >
                      <TableCell className="py-3 px-4 text-slate-800 font-semibold max-w-[200px] truncate" title={item.meetingTitle}>
                        {item.meetingTitle}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-slate-800 max-w-[150px] truncate" title={item.projectTitle}>
                        {item.projectTitle}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-slate-800 whitespace-nowrap">
                        {formatMeetingDate(item.dateTime)}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-slate-800">{item.platform || "-"}</TableCell>
                      <TableCell className="py-3 px-4">
                        {item.recordingLink ? (
                          <a
                            href={item.recordingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(item.id);
                            }}
                            className="text-[#6051E2] hover:text-[#4a3db8] transition-colors cursor-pointer"
                            title="View details"
                            aria-label="View details"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>

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
                    onClick={() => handleViewDetails(item.id)}
                    className="p-4 space-y-3 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <p className="text-xs text-slate-500">Meeting Title</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.meetingTitle}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">Project Title</p>
                        <p className="text-sm font-medium text-slate-700">
                          {item.projectTitle}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">Date & Time</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatMeetingDate(item.dateTime)}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">Platform</p>
                        <p className="text-sm font-medium text-slate-800">
                          {item.platform || "-"}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(item.id);
                        }}
                        className="text-[#6051E2] hover:text-[#4a3db8] transition-colors cursor-pointer flex-shrink-0 ml-2"
                        title="View details"
                        aria-label="View details"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div>
                        <p className="text-slate-500">Link</p>
                        {item.recordingLink ? (
                          <a
                            href={item.recordingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
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
