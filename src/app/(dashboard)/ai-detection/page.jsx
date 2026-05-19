"use client";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import Swal from "sweetalert2";
import { apiDelete, apiGet, apiPost } from "@/lib/api";

const tabs = [
  { id: "email", label: "Email" },
  { id: "meetings-transcript", label: "Meeting transcript" },
];

const raiddOptions = [
  { value: "risk", label: "Risk" },
  { value: "issue", label: "Issue" },
  { value: "assumption", label: "Assumption" },
  { value: "decision", label: "Decision" },
  { value: "dependency", label: "Dependency" },
];

const categoryToKeys = {
  "risk": ["projectRisks", "risks"],
  "issue": ["projectIssues", "issues"],
  "assumption": ["projectAssumptions", "assumptions"],
  "decision": ["projectDecisions", "decisions"],
  "dependency": ["projectDependencies", "dependencies"],
};

const extractRaiddIds = (rawItem, categories) => {
  const raiddIds = [];
  const raiddData = rawItem?.raiddData;
  if (!raiddData) return raiddIds;

  const cats = Array.isArray(categories) ? categories : [categories];
  cats.forEach(cat => {
    const keys = categoryToKeys[String(cat).toLowerCase()];
    if (keys) {
      keys.forEach(key => {
        const arr = raiddData[key];
        if (Array.isArray(arr)) {
          arr.forEach(obj => {
            if (obj && obj.id) raiddIds.push(obj.id);
          });
        }
      });
    }
  });
  return raiddIds;
};

const initialApprovalState = {
  itemId: "",
  projectId: "",
  raiddCategory: "",
  detectedRaiddCategories: [],
  isCategoryFixed: false,
  isBulk: false,
  rawItem: null,
  selectedRaiddIds: [],
};

const normalizeRaiddCategoryLabel = (value) => {
  const normalized = String(value || "").toLowerCase();
  switch (normalized) {
    case "risk":
    case "risks":
      return "Risk";
    case "issue":
    case "issues":
      return "Issue";
    case "assumption":
    case "assumptions":
      return "Assumption";
    case "decision":
    case "decisions":
      return "Decision";
    case "dependency":
    case "dependencies":
      return "Dependency";
    default:
      return "";
  }
};

const deriveRaiddAnalysisFromData = (raiddData) => {
  const keyToLabel = {
    projectRisks: "Risk",
    projectIssues: "Issue",
    projectAssumptions: "Assumption",
    projectDecisions: "Decision",
    projectDependencies: "Dependency",
    risks: "Risk",
    issues: "Issue",
    assumptions: "Assumption",
    decisions: "Decision",
    dependencies: "Dependency",
  };

  const aggregatedByLabel = {
    Risk: [],
    Issue: [],
    Assumption: [],
    Decision: [],
    Dependency: [],
  };

  const pushRaiddValue = (label, raw) => {
    if (raw == null) return;
    if (Array.isArray(raw)) {
      raw.filter(Boolean).forEach((item) => {
        if (typeof item === 'object' && item.data) {
          aggregatedByLabel[label].push(item.data.trim());
        } else if (typeof item === 'string' && item.trim()) {
          aggregatedByLabel[label].push(item.trim());
        }
      });
    } else if (typeof raw === "string" && raw.trim()) {
      aggregatedByLabel[label].push(raw.trim());
    }
  };

  if (raiddData && typeof raiddData === "object") {
    Object.entries(keyToLabel).forEach(([key, label]) => {
      pushRaiddValue(label, raiddData[key]);
    });
  }

  const dedupedByLabel = Object.fromEntries(
    Object.entries(aggregatedByLabel).map(([label, values]) => [
      label,
      Array.from(new Set(values.filter(Boolean))),
    ])
  );

  const raiddCategories = Object.entries(dedupedByLabel)
    .filter(([, values]) => Array.isArray(values) && values.length > 0)
    .map(([label]) => label);

  return { raiddCategories, raiddDetailsByCategory: dedupedByLabel };
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

const getRaiddOptionValue = (value) => {
  const normalized = String(value || "").toLowerCase();
  switch (normalized) {
    case "risk":
    case "risks":
      return "risk";
    case "issue":
    case "issues":
      return "issue";
    case "assumption":
    case "assumptions":
      return "assumption";
    case "decision":
    case "decisions":
      return "decision";
    case "dependency":
    case "dependencies":
      return "dependency";
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

const normalizeDetection = (item, index) => {
  // Completely ignore fullAiResponse as per user request
  // Use raiddData as the primary source for analysis and details
  const derived = deriveRaiddAnalysisFromData(item?.raiddData);

  // Use the categories present in raiddData for the badges
  // This ensures that every badge at the top has corresponding details in the expanded view
  const raiddCategories = derived.raiddCategories;

  return {
    id: String(item?.id || index),
    type: normalizeSourceType(item?.sourceType),
    title: item?.title || "Not available",
    details: item?.summary || item?.raiddMessage || "",
    raiddAnalysis: raiddCategories,
    raiddDetailsByCategory: derived.raiddDetailsByCategory,
    dateTime: item?.createdAt || item?.updatedAt || null,
    rawItem: item,
  };
};

const normalizeProject = (project, index) => ({
  id: String(project?.id || project?.projectId || index),
  name: project?.name || project?.projectName || `Project ${index + 1}`,
});

const formatDateTime = (dateTime) => {
  if (!dateTime) return "";
  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} ${date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}`;
};

const DetectionDetails = ({ id, initialItem, onOpenApproveModal }) => {
  const { data: detailsResponse, isLoading, isError } = useQuery({
    queryKey: ["ai-detection", id],
    queryFn: () => apiGet(`/api/project-manager/ai-detection/${id}`),
    enabled: !!id,
  });

  const fullItem = useMemo(() => {
    const raw = detailsResponse?.data || detailsResponse?.data?.data;
    if (!raw) return initialItem;
    return normalizeDetection(raw);
  }, [detailsResponse, initialItem]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8 bg-slate-50/30 border-t border-slate-50">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-sm text-red-500 bg-slate-50/30 border-t border-slate-50">
        Failed to load details.
      </div>
    );
  }

  const hasRaiddBullets =
    Array.isArray(fullItem.raiddAnalysis) &&
    fullItem.raiddAnalysis.some(
      (category) => (fullItem.raiddDetailsByCategory?.[category] || []).length > 0
    );

  return (
    <div className="border-t border-slate-50 bg-slate-50/30 p-4 sm:p-6 space-y-6">
      {fullItem.details && !hasRaiddBullets && (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-sm leading-relaxed text-slate-600 font-medium">
            {fullItem.details}
          </p>
        </div>
      )}

      {Array.isArray(fullItem.raiddAnalysis) && fullItem.raiddAnalysis.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fullItem.raiddAnalysis.map((category) => {
            const detectedItems = fullItem.raiddDetailsByCategory?.[category] || [];
            if (!detectedItems.length) return null;

            return (
              <div key={category} className="group flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getRaiddBadgeClass(category)}`}>
                    {category}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onOpenApproveModal(fullItem.id, category)}
                    className="h-8 px-3 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all font-bold text-[10px] uppercase cursor-pointer shadow-sm"
                  >
                    Approve
                  </Button>
                </div>
                <div className="p-4 flex-1">
                  <ul className="space-y-3">
                    {detectedItems.map((text, idx) => (
                      <li key={`${category}-${idx}`} className="flex gap-2 text-xs leading-relaxed text-slate-600 font-medium">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-200 mt-1.5 shrink-0" />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function AiDetection() {
  const [activeTab, setActiveTab] = useState("email");
  const [searchValue, setSearchValue] = useState("");
  const [expandedItems, setExpandedItems] = useState(new Set([]));
  const [hiddenItemIds, setHiddenItemIds] = useState(new Set([]));
  const [approveModalState, setApproveModalState] = useState(initialApprovalState);
  const [deletingId, setDeletingId] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [dateFilterState, setDateFilterState] = useState({
    filter: "all",
    startDate: null,
    endDate: null,
  });
  const queryClient = useQueryClient();

  const getAvailableItemsForApproval = () => {
    const rawItem = approveModalState.rawItem;
    if (!rawItem || !rawItem.raiddData) return [];

    const cats = approveModalState.isBulk 
       ? approveModalState.detectedRaiddCategories.map(getRaiddOptionValue) 
       : [approveModalState.raiddCategory];

    const items = [];
    cats.forEach(cat => {
      const keys = categoryToKeys[String(cat).toLowerCase()];
      if (keys) {
        keys.forEach(key => {
          const arr = rawItem.raiddData[key];
          if (Array.isArray(arr)) {
            arr.forEach(obj => {
              if (obj && obj.id) {
                items.push({ id: obj.id, text: obj.data, category: normalizeRaiddCategoryLabel(cat) });
              }
            });
          }
        });
      }
    });
    return items;
  };

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
      const raiddSearch = Array.isArray(item.raiddAnalysis)
        ? item.raiddAnalysis.join(" ")
        : String(item.raiddAnalysis || "");
      const matchesSearch =
        item.title.toLowerCase().includes(searchLower) ||
        item.details.toLowerCase().includes(searchLower) ||
        raiddSearch.toLowerCase().includes(searchLower);

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

  const deleteDetectionMutation = useMutation({
    mutationFn: (id) => apiDelete(`/api/project-manager/ai-detection/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-detections"] });
    },
  });

  const approveDetectionMutation = useMutation({
    mutationFn: (payload) =>
      apiPost("/api/project-manager/raidd/create", payload),
  });

  const handleRemove = async (id) => {
    const detectionId = String(id);
    const result = await Swal.fire({
      title: "Delete this detection?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    setDeletingId(detectionId);
    try {
      await deleteDetectionMutation.mutateAsync(detectionId);
      setHiddenItemIds((prev) => new Set(prev).add(detectionId));
      setExpandedItems((prev) => {
        const next = new Set(prev);
        next.delete(detectionId);
        return next;
      });
      toast.success("Detection deleted successfully");
    } catch (err) {
      toast.error(err?.message || "Failed to delete detection.");
    } finally {
      setDeletingId("");
    }
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

  const handleOpenApproveModal = (id, specificCategory = null, isBulk = false) => {
    const selectedItem = communications.find((item) => String(item.id) === String(id));

    const detectedCategories = Array.isArray(selectedItem?.raiddAnalysis)
      ? selectedItem.raiddAnalysis
      : [];

    let raiddCategory = "";
    if (isBulk) {
      raiddCategory = detectedCategories.map(getRaiddOptionValue);
    } else {
      raiddCategory = specificCategory
        ? getRaiddOptionValue(specificCategory)
        : getRaiddOptionValue(detectedCategories[0]);
    }

    const selectedRaiddIds = extractRaiddIds(
      selectedItem?.rawItem, 
      isBulk ? detectedCategories.map(getRaiddOptionValue) : [raiddCategory]
    );

    setApproveModalState({
      itemId: String(id),
      projectId: "",
      raiddCategory,
      detectedRaiddCategories: detectedCategories,
      isCategoryFixed: !!specificCategory || isBulk,
      isBulk,
      rawItem: selectedItem?.rawItem,
      selectedRaiddIds,
    });
  };

  const handleCloseApproveModal = () => {
    setApproveModalState(initialApprovalState);
  };

  const handleApproveDetection = async () => {
    if (!approveModalState.projectId) {
      toast.error("Please select a project");
      return;
    }

    if (
      !approveModalState.raiddCategory ||
      (Array.isArray(approveModalState.raiddCategory) && approveModalState.raiddCategory.length === 0)
    ) {
      toast.error("Please select a RAIDD category");
      return;
    }

    const categories = Array.isArray(approveModalState.raiddCategory)
      ? approveModalState.raiddCategory
      : [approveModalState.raiddCategory];

    setIsApproving(true);
    try {
      const checkedItems = getAvailableItemsForApproval().filter(itemObj => approveModalState.selectedRaiddIds.includes(itemObj.id));
      const activeTypes = Array.from(new Set(checkedItems.map(itemObj => getRaiddOptionValue(itemObj.category).toLowerCase())));

      if (activeTypes.length === 0) {
        toast.error("Please select at least one item to approve.");
        setIsApproving(false);
        return;
      }

      const payload = {
        projectId: approveModalState.projectId,
        aiDetectionId: approveModalState.itemId,
        type: activeTypes,
        raiddIds: approveModalState.selectedRaiddIds
      };

      await approveDetectionMutation.mutateAsync(payload);

      toast.success("Detection approved successfully");

      await queryClient.invalidateQueries({ queryKey: ["ai-detections"] });
      await queryClient.invalidateQueries({ queryKey: ["ai-detection", approveModalState.itemId] });
      handleCloseApproveModal();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to approve detection.");
    } finally {
      setIsApproving(false);
    }
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {approveModalState.isBulk ? "Approve All Detections" : "Approve Detection"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {approveModalState.isBulk && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <FiCheck className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-xs text-emerald-700 font-bold leading-tight">
                  Approving all detected categories: {approveModalState.detectedRaiddCategories.join(", ")}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Select Project
              </label>
              <Select
                value={approveModalState.projectId}
                onValueChange={(value) =>
                  setApproveModalState((prev) => ({ ...prev, projectId: value }))
                }
              >
                <SelectTrigger className="h-11 w-full border-slate-200 rounded-xl focus:ring-[#6051E2]/20 focus:border-[#6051E2]">
                  <SelectValue
                    placeholder={isProjectsLoading ? "Loading projects..." : "Choose project"}
                  />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                  {projectOptions.map((project) => (
                    <SelectItem key={project.id} value={project.id} className="rounded-lg my-0.5">
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!approveModalState.isCategoryFixed && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Select RAIDD Category
                </label>
                <Select
                  value={approveModalState.raiddCategory}
                  onValueChange={(value) =>
                    setApproveModalState((prev) => ({
                      ...prev,
                      raiddCategory: value,
                      selectedRaiddIds: extractRaiddIds(prev.rawItem, [value]),
                    }))
                  }
                >
                  <SelectTrigger className="h-11 w-full border-slate-200 rounded-xl focus:ring-[#6051E2]/20 focus:border-[#6051E2]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                    {(approveModalState.detectedRaiddCategories?.length > 0
                      ? raiddOptions.filter((option) =>
                        approveModalState.detectedRaiddCategories
                          .map(getRaiddOptionValue)
                          .includes(option.value)
                      )
                      : raiddOptions
                    ).map((option) => (
                      <SelectItem key={option.value} value={option.value} className="rounded-lg my-0.5">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">
                Select Items to Approve
              </label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {getAvailableItemsForApproval().length > 0 ? getAvailableItemsForApproval().map((itemObj, idx) => (
                  <div key={itemObj.id || idx} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                    <input 
                      type="checkbox" 
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#6051E2] focus:ring-[#6051E2] cursor-pointer"
                      checked={approveModalState.selectedRaiddIds.includes(itemObj.id)}
                      onChange={() => {
                        setApproveModalState(prev => {
                          const isSelected = prev.selectedRaiddIds.includes(itemObj.id);
                          return {
                            ...prev,
                            selectedRaiddIds: isSelected 
                              ? prev.selectedRaiddIds.filter(id => id !== itemObj.id)
                              : [...prev.selectedRaiddIds, itemObj.id]
                          };
                        });
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{itemObj.category}</span>
                      <span className="text-sm text-slate-700 leading-relaxed">{itemObj.text}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 italic">No selectable items found.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseApproveModal}
              className="flex-1 h-11 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 h-11 rounded-xl bg-[#6051E2] text-white font-bold shadow-lg shadow-[#6051E2]/20 hover:bg-[#6051E2]/90 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              onClick={handleApproveDetection}
              disabled={isApproving}
            >
              {isApproving ? "Approving..." : "Approve"}
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
            const hasRaiddBullets =
              Array.isArray(item.raiddAnalysis) &&
              item.raiddAnalysis.some(
                (category) => (item.raiddDetailsByCategory?.[category] || []).length > 0
              );

            return (
              <Card key={item.id} className="rounded-xl border-slate-100 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 sm:p-6 bg-white">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="w-full flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <p className="text-sm font-bold text-slate-900 sm:text-base md:text-lg">
                            {item.title}
                          </p>
                          {Array.isArray(item.raiddAnalysis) && item.raiddAnalysis.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {item.raiddAnalysis.map((category) => (
                                <span
                                  key={category}
                                  className={`inline-flex rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getRaiddBadgeClass(
                                    category
                                  )}`}
                                >
                                  {category}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                          {item.dateTime && <span>{formatDateTime(item.dateTime)}</span>}
                          <span className="uppercase tracking-widest text-[#6051E2]/60">{item.type}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemove(item.id)}
                          disabled={deletingId === String(item.id)}
                          className="h-10 w-10 p-0 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                          title="Delete"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleViewDetails(item.id)}
                          className={`h-10 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border-slate-200 cursor-pointer ${isExpanded ? "bg-slate-50 text-slate-800" : "text-slate-600 hover:border-[#6051E2]/30 hover:text-[#6051E2]"}`}
                        >
                          {isExpanded ? (
                            <>
                              <FiEyeOff className="h-3.5 w-3.5" />
                              <span>HIDE DETAILS</span>
                            </>
                          ) : (
                            <>
                              <FiEye className="h-3.5 w-3.5" />
                              <span>VIEW DETAILS</span>
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          onClick={() => handleOpenApproveModal(item.id, null, true)}
                          className="h-10 px-4 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                        >
                          <FiCheck className="h-3.5 w-3.5" />
                          <span>APPROVE ALL</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <DetectionDetails
                      id={item.id}
                      initialItem={item}
                      onOpenApproveModal={handleOpenApproveModal}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
