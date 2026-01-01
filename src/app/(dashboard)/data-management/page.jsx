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
import { Input } from "@/components/ui/input";
import { FiSearch, FiCheck, FiAlertCircle, FiZap, FiMail, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { useRouter } from "next/navigation";

// Dummy data for Data Management
const dataManagementData = [
  { id: 1, projectName: "SmartSys", dateTime: "Dec 12, 2025 at 2:00 pm", source: "MS Team", link: "https://meet.google.com/", details: "view" },
  { id: 2, projectName: "TechNova", dateTime: "Dec 12, 2025 at 2:00 pm", source: "Transcripts", link: "https://meet.google.com/", details: "view" },
  { id: 3, projectName: "NextGen Solutions", dateTime: "Dec 12, 2025 at 2:00 pm", source: "Google meet", link: "https://meet.google.com/", details: "view" },
  { id: 4, projectName: "CloudAxis", dateTime: "Dec 12, 2025 at 2:00 pm", source: "Scrum Master", link: "https://meet.google.com/", details: "view" },
  { id: 5, projectName: "NeuralNet", dateTime: "Dec 12, 2025 at 2:00 pm", source: "MS Team", link: "https://meet.google.com/", details: "view" },
  { id: 6, projectName: "Business Tech Portal", dateTime: "Dec 12, 2025 at 2:00 pm", source: "Transcripts", link: "https://meet.google.com/", details: "view" },
  { id: 7, projectName: "EduTech Hub", dateTime: "Dec 12, 2025 at 2:00 pm", source: "Google meet", link: "https://meet.google.com/", details: "view" },
];

export default function DataManagement() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");
  const router = useRouter();
  const filteredData = useMemo(() => {
    let filtered = dataManagementData;

    // Filter by source - if "all" is selected, show everything, otherwise filter by selected source
    if (selectedSource !== "all") {
      filtered = filtered.filter((item) => {
        const sourceLower = item.source.toLowerCase();
        if (selectedSource === "ms-team") {
          return sourceLower.includes("ms team");
        } else if (selectedSource === "google-meet") {
          return sourceLower.includes("google meet");
        } else if (selectedSource === "transcripts") {
          return sourceLower === "transcripts";
        }
        return false;
      });
    }

    // Filter by search
    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.projectName.toLowerCase().includes(searchLower) ||
          item.dateTime.toLowerCase().includes(searchLower) ||
          item.source.toLowerCase().includes(searchLower) ||
          item.link.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [searchValue, selectedSource]);

  const handleSourceChange = (sourceId) => {
    setSelectedSource(sourceId);
  };

  const handleViewDetails = (id) => {
    router.push(`/data-management/meeting-summary?id=${id}`);
  };

  const sourceTabs = [
    { id: "all", label: "All sources" },
    { id: "ms-team", label: "MS Team" },
    { id: "google-meet", label: "Google meet" },
    { id: "transcripts", label: "Transcripts" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Data Management</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Task Extracted */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Task Extracted</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">47</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues Found */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiAlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Issues Found</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">08</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Processed */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiZap className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">AI Processed</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">08</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unread Email */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-400 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiMail className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Unread Email</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">08</p>
              </div>
            </div>
          </CardContent>
        </Card>
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

      {/* Data Table */}
      <Card className="overflow-hidden mt-4 sm:mt-6">
        <CardContent className="p-0">
          {/* Desktop & Large Tablet Table */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#6051E2] text-white">
                <TableRow className="border-b-0 hover:bg-[#6051E2]">
                  <TableHead className="py-3 px-4 text-white font-semibold">
                    Project Name
                  </TableHead>
                  <TableHead className="py-3 px-4 text-white font-semibold">
                    Date & time
                  </TableHead>
                  <TableHead className="py-3 px-4 text-white font-semibold">
                    Sources
                  </TableHead>
                  <TableHead className="py-3 px-4 text-white font-semibold">
                    Link
                  </TableHead>
                  <TableHead className="py-3 px-4 text-white font-semibold">
                    Details
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
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
                        {item.projectName}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-slate-800">
                        {item.dateTime}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-slate-800">
                        {item.source}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-slate-800">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          {item.link}
                        </a>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <button
                          onClick={() => handleViewDetails(item.id)}
                          className="text-[#6051E2] hover:text-[#4a3db8] hover:underline transition-colors cursor-pointer font-medium"
                        >
                          {item.details}
                        </button>
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
                        <p className="text-sm font-semibold text-slate-900">
                          {item.projectName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.dateTime}
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewDetails(item.id)}
                        className="text-[#6051E2] hover:text-[#4a3db8] hover:underline transition-colors cursor-pointer font-medium text-sm flex-shrink-0 ml-2"
                      >
                        {item.details}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div>
                        <p className="text-slate-500">Source</p>
                        <p className="text-slate-800 font-medium">
                          {item.source}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Link</p>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors break-all"
                        >
                          {item.link}
                        </a>
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
