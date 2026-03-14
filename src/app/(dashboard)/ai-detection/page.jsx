"use client";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FiCheck, FiEye, FiEyeOff, FiTrash2 } from "react-icons/fi";
import PageHeader from "@/components/PageHeader/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateFilter, { getDateRangeFromFilter } from "@/components/DateFilter/Datefilter";
import toast from "react-hot-toast";
import Loading from "@/components/Loading/Loading";
import { apiGet } from "@/lib/api";

const tabs = [
  { id: "email", label: "Email" },
  { id: "meetings-transcript", label: "Meeting transcript" },
];

const raiddOptions = ["Risk", "Issues", "Assumption", "Decision", "Dependencies"];

const initialApprovalState = {
  itemId: "",
  projectId: "",
  raiddCategory: "",
};

const normalizeSourceType = (value) => {
  const normalized = String(value || "").toLowerCase().replace(/[_\s]+/g, "-");

  if (normalized === "email") return "email";
  if (
    normalized === "meetings-transcript" ||
    normalized === "meeting-transcript" ||
    normalized === "transcript" ||
    normalized === "meetingtranscript"
  ) {
    return "meetings-transcript";
  }

  return normalized;
};

const formatRaiddLabel = (value) => {
  const normalized = String(value || "").toLowerCase();

  switch (normalized) {
    case "risk":
    case "risks":
      return "Risks";
    case "issue":
    case "issues":
      return "Issues";
    case "assumption":
    case "assumptions":
      return "Assumption";
    case "decision":
    case "decisions":
      return "Decision";
    case "dependency":
    case "dependencies":
      return "Dependencies";
    default:
      return "Not available";
  }
};

const getRaiddOptionValue = (value) => {
  const normalized = String(value || "").toLowerCase();

  switch (normalized) {
    case "risk":
    case "risks":
      return "Risk";
    case "issue":
    case "issues":
      return "Issues";
    case "assumption":
    case "assumptions":
      return "Assumption";
    case "decision":
    case "decisions":
      return "Decision";
    case "dependency":
    case "dependencies":
      return "Dependencies";
    default:
      return "";
  }
};

const getRaiddBadgeClass = (value) => {
  const normalized = String(value || "").toLowerCase();

  switch (normalized) {
    case "risk":
    case "risks":
      return "border-red-200 bg-red-50 text-red-700";
    case "issue":
    case "issues":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "assumption":
    case "assumptions":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "decision":
    case "decisions":
      return "border-purple-200 bg-purple-50 text-purple-700";
    case "dependency":
    case "dependencies":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

const normalizeDetection = (item, index) => ({
  id: String(item?.id || index),
  type: normalizeSourceType(item?.sourceType),
  title: item?.title || "Not available",
  details: item?.summary || "Not available",
  raiddAnalysis: formatRaiddLabel(item?.raiddAnalysis),
  dateTime: item?.createdAt || item?.updatedAt || null,
});

const normalizeProject = (project, index) => ({
  id: String(project?.id || project?.projectId || index),
  name: project?.name || project?.projectName || `Project ${index + 1}`,
});

const formatDateTime = (dateTime) => {
  if (!dateTime) return "";

  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return "";

  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${dateStr} ${timeStr}`;
};

export default function AiDetection() {
  const [activeTab, setActiveTab] = useState("email");
  const [searchValue, setSearchValue] = useState("");
  const [expandedItems, setExpandedItems] = useState(new Set([]));
  const [hiddenItemIds, setHiddenItemIds] = useState(new Set([]));
  const [approveModalState, setApproveModalState] = useState(initialApprovalState);
  const [dateFilterState, setDateFilterState] = useState({
    filter: "all",
    startDate: null,
    endDate: null,
  });

  const {
    data: detectionsResponse,
    isLoading: isDetectionsLoading,
    isError: isDetectionsError,
    error: detectionsError,
  } = useQuery({
    queryKey: ["ai-detections"],
    queryFn: () => apiGet("/api/project-manager/ai-detection/all"),
  });

  const { data: projectsResponse, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["ai-detection-projects"],
    queryFn: () => apiGet("/api/project-manager/project-management/my-projects"),
  });

  const communications = useMemo(() => {
    const rawItems = Array.isArray(detectionsResponse?.data)
      ? detectionsResponse.data
      : Array.isArray(detectionsResponse?.data?.data)
        ? detectionsResponse.data.data
        : [];

    return rawItems.map(normalizeDetection);
  }, [detectionsResponse]);

  const projectOptions = useMemo(() => {
    const rawProjects = Array.isArray(projectsResponse?.data)
      ? projectsResponse.data
      : Array.isArray(projectsResponse?.data?.data)
        ? projectsResponse.data.data
        : [];

    return rawProjects.map(normalizeProject);
  }, [projectsResponse]);

  const getDateRange = useMemo(
    () =>
      getDateRangeFromFilter(
        dateFilterState.filter,
        dateFilterState.startDate,
        dateFilterState.endDate
      ),
    [dateFilterState]
  );

  const filteredCommunications = useMemo(() => {
    const searchLower = searchValue.toLowerCase();

    let filtered = communications.filter((item) => {
      if (hiddenItemIds.has(String(item.id))) return false;

      const matchesTab = item.type === activeTab;
      const matchesSearch =
        item.title.toLowerCase().includes(searchLower) ||
        item.details.toLowerCase().includes(searchLower) ||
        item.raiddAnalysis.toLowerCase().includes(searchLower);

      return matchesTab && matchesSearch;
    });

    if (dateFilterState.filter !== "all") {
      const { start, end } = getDateRange;

      if (start && end) {
        filtered = filtered.filter((item) => {
          if (!item.dateTime) return true;
          const itemDate = new Date(item.dateTime);
          if (Number.isNaN(itemDate.getTime())) return true;
          return itemDate >= start && itemDate <= end;
        });
      }
    }

    return filtered;
  }, [communications, activeTab, searchValue, hiddenItemIds, dateFilterState.filter, getDateRange]);

  const handleRemove = (id) => {
    setHiddenItemIds((prev) => new Set(prev).add(String(id)));
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast.success("Detection deleted successfully");
  };

  const handleViewDetails = (id) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleOpenApproveModal = (id) => {
    const selectedItem = communications.find((item) => String(item.id) === String(id));

    setApproveModalState({
      itemId: String(id),
      projectId: "",
      raiddCategory: getRaiddOptionValue(selectedItem?.raiddAnalysis),
    });
  };

  const handleCloseApproveModal = () => {
    setApproveModalState(initialApprovalState);
  };

  const handleApproveDetection = () => {
    if (!approveModalState.projectId) {
      toast.error("Please select a project");
      return;
    }

    if (!approveModalState.raiddCategory) {
      toast.error("Please select a RAIDD category");
      return;
    }

    setHiddenItemIds((prev) => new Set(prev).add(String(approveModalState.itemId)));
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.delete(approveModalState.itemId);
      return next;
    });
    toast.success("Detection approved successfully");
    handleCloseApproveModal();
  };

  if (isDetectionsLoading) {
    return <Loading />;
  }

  if (isDetectionsError) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-slate-500 sm:text-base">
          {detectionsError?.message || "Failed to load AI detections."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="AI Detection"
        description="Analyze project communications to understand stakeholder emotions and sentiment trends."
        searchPlaceholder="Search by project, client, or keyword..."
        searchValue={searchValue}
        onSearchChange={(e) => setSearchValue(e.target.value)}
      />

      <div className="mt-10 flex flex-col gap-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${activeTab === tab.id
                    ? "bg-[#6051E2] text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <DateFilter onFilterChange={setDateFilterState} initialFilter="all" />
        </div>

        {dateFilterState.filter === "custom" &&
          dateFilterState.startDate &&
          dateFilterState.endDate && (
            <div className="flex w-fit items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
              <span>
                {dateFilterState.startDate} - {dateFilterState.endDate}
              </span>
            </div>
          )}
      </div>

      <Dialog
        open={Boolean(approveModalState.itemId)}
        onOpenChange={(open) => {
          if (!open) handleCloseApproveModal();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Approve Detection</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Select Project
              </label>
              <Select
                value={approveModalState.projectId}
                onValueChange={(value) =>
                  setApproveModalState((prev) => ({ ...prev, projectId: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={isProjectsLoading ? "Loading projects..." : "Select project"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {projectOptions.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Select RAIDD Category
              </label>
              <Select
                value={approveModalState.raiddCategory}
                onValueChange={(value) =>
                  setApproveModalState((prev) => ({
                    ...prev,
                    raiddCategory: value,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {raiddOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={handleCloseApproveModal}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-[#6051E2] text-white hover:bg-[#6051E2]/90"
              onClick={handleApproveDetection}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-3 sm:space-y-4">
        {filteredCommunications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-slate-500 sm:p-8 sm:text-base">
              No AI detections found.
            </CardContent>
          </Card>
        ) : (
          filteredCommunications.map((item) => {
            const isExpanded = expandedItems.has(item.id);

            return (
              <Card key={item.id} className="rounded-lg">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="w-full flex-1">
                      <div className="mb-2 flex flex-wrap items-start gap-5 sm:mb-3">
                        <p className="text-xs font-bold leading-snug text-slate-900 sm:text-sm md:text-base sm:leading-normal">
                          {item.title}
                        </p>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[12px] font-medium ${getRaiddBadgeClass(
                            item.raiddAnalysis
                          )}`}
                        >
                          {item.raiddAnalysis}
                        </span>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 border-t border-slate-200 pt-3 sm:mt-4 sm:pt-4">
                          <p className="text-xs leading-relaxed text-slate-600 sm:text-sm md:text-base">
                            {item.details}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex w-full flex-col items-end gap-2 sm:w-auto">
                      {item.dateTime && (
                        <div className="mb-1 text-xs text-slate-500">
                          {formatDateTime(item.dateTime)}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                          type="button"
                          onClick={() => handleOpenApproveModal(item.id)}
                          className="h-9 rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-500 to-green-500 px-3 text-xs text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-emerald-600 hover:to-green-600 hover:shadow-md sm:text-sm cursor-pointer"
                          title="Approve"
                          aria-label="Approve"
                        >
                          <FiCheck className="h-4 w-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleRemove(item.id)}
                          className="h-9 rounded-full border border-red-200 bg-white px-3 text-xs text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:text-red-700 hover:shadow-md sm:text-sm cursor-pointer"
                          title="Delete"
                          aria-label="Delete"
                        >
                          <FiTrash2 className="h-4 w-4" />

                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleViewDetails(item.id)}
                          className="h-9 rounded-full border border-slate-200 bg-white px-3 text-xs text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#6051E2]/30 hover:bg-[#6051E2]/5 hover:text-[#6051E2] hover:shadow-md sm:text-sm cursor-pointer"
                          title={isExpanded ? "Hide details" : "View details"}
                          aria-label={isExpanded ? "Hide details" : "View details"}
                        >

                          {isExpanded ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
