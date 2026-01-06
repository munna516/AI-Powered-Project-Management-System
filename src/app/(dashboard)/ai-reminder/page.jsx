"use client";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HiOutlineSparkles } from "react-icons/hi2";
import { FiX, FiSend, FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";

// Dummy data for AI reminder items
const aiReminderItems = [
  {
    id: 1,
    title: "AI Tasks",
    timestamp: "30m ago",
    description: "AI analyzed meetings, emails and docs and identified potential delivery risks. Timeline may be affected if delays occur.",
    source: "Emails",
  },
  {
    id: 2,
    title: "AI Risks",
    timestamp: "30m ago",
    description: "AI analyzed meetings, emails and docs and identified potential delivery risks. Timeline may be affected if delays occur.",
    source: "Meeting Notes",
  },
  {
    id: 3,
    title: "AI Assumptions",
    timestamp: "30m ago",
    description: "AI analyzed meetings, emails and docs and identified potential delivery risks. Timeline may be affected if delays occur.",
    source: "Transcripts",
  },
  {
    id: 4,
    title: "AI Decisions",
    timestamp: "30m ago",
    description: "AI analyzed meetings, emails and docs and identified potential delivery risks. Timeline may be affected if delays occur.",
    source: "Transcripts",
  },
  {
    id: 5,
    title: "AI Actions",
    timestamp: "30m ago",
    description: "Follow up with the design team to confirm the revised UI delivery date and update the project timeline accordingly.",
    source: "Transcripts",
  },
];

export default function AiReminder() {
  const router = useRouter();
  const [aiPrompt, setAiPrompt] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const handleSend = () => {
    if (aiPrompt.trim()) {
      console.log("Sending AI prompt:", aiPrompt);
      // Handle AI prompt submission here
      setAiPrompt("");
    }
  };

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
    <div className="bg-slate-50/50">
      <div className="space-y-4 sm:space-y-6">
        {/* Header with Go Back and Date Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Go Back Button - Left Side */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition cursor-pointer w-fit"
          >
            <FiArrowLeft className="h-4 w-4" />
            Go Back
          </button>

          {/* Date Filter - Right Side */}
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

            {/* Custom Date Range Inputs */}
            {dateFilter === "custom" ? (
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
            ) : (
              /* Date Range Display for preset filters */
              <div className="flex items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 min-w-[180px] sm:min-w-[200px] h-9 sm:h-10">
                <span className="text-xs sm:text-sm">{formatDateRange()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Show selected custom range below */}
        {dateFilter === "custom" && customStartDate && customEndDate && (
          <div className="flex items-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 w-fit">
            <span>{formatDateRange()}</span>
          </div>
        )}

        {/* AI Reminder System Modal */}
        <Card className="rounded-lg shadow-lg">
          <CardContent className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HiOutlineSparkles className="h-5 w-5 sm:h-6 sm:w-6 text-[#6051E2]" />
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
                  AI Reminder System
                </h1>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 mb-6">
              3 new items require attention
            </p>

            {/* AI Reminder Items */}
            <div className="space-y-0 divide-y divide-slate-200 mb-6">
              {aiReminderItems.map((item, index) => (
                <div
                  key={item.id}
                  className="py-4 sm:py-5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <span className="text-xs sm:text-sm text-slate-500 whitespace-nowrap">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-3 leading-relaxed">
                    {item.description}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Source: <span className="text-slate-700">{item.source}</span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
