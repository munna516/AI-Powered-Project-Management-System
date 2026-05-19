"use client";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, TrendingUp, Link2, Trash2, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiMoreVertical, FiPlus } from "react-icons/fi";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Loading from "@/components/Loading/Loading";
import { apiGet, apiPatch } from "@/lib/api";
import TaskSection from "@/components/project-details/TaskSection";
import MeetingSection from "@/components/project-details/MeetingSection";
import DocumentSection from "@/components/project-details/DocumentSection";
import MilestonesSection from "@/components/project-details/MilestonesSection";
import toast from "react-hot-toast";

const projectData = {
    id: "N/A",
    title: "N/A",
    status: "N/A",
    owner: "N/A",
    deadline: "N/A",
    description: "N/A",
    progress: null,
    projectAiSummary: "N/A",
    lastMeetingSummary: "N/A",
    team: [],
    health: [],
    // documents: [],
};

const tabs = [
    { id: "task", label: "Task list", buttonLabel: "Add Task" },
    { id: "meeting", label: "Meeting List", buttonLabel: "Upload Meeting" },
    { id: "document", label: "Document List", buttonLabel: "Upload Document" },
];


const getStatusColor = (status) => {
    const normalizedStatus = String(status ?? "").trim().toLowerCase();
    switch (normalizedStatus) {
        case "completed":
        case "complete":
        case "on_track":
        case "good":
            return "bg-green-100 text-green-800 border-green-200";
        case "in_progress":
        case "pending":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "ongoing":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "bad":
        case "at_risk":
        case "poor":
            return "bg-red-100 text-red-800 border-red-200";
        default:
            return "bg-slate-100 text-slate-800 border-slate-200";
    }
};

const formatValue = (value) => value || "N/A";

const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const toTitleCase = (value) => {
    if (!value) return "N/A";
    return String(value)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};


const normalizeProgressValue = (value) => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return Math.min(100, Math.max(0, Math.round(value)));
    }

    if (typeof value === "string") {
        const parsedValue = Number.parseFloat(value.replace("%", "").trim());
        if (Number.isFinite(parsedValue)) {
            return Math.min(100, Math.max(0, Math.round(parsedValue)));
        }
    }

    return null;
};

const calculateProgressFromItems = (items = [], completedStatuses = []) => {
    if (!Array.isArray(items) || items.length === 0) return null;

    const completedCount = items.filter((item) =>
        completedStatuses.includes(String(item?.status || "").toLowerCase())
    ).length;

    return Math.round((completedCount / items.length) * 100);
};

const renderTextWithBullets = (text) => {
    if (!text || text === "N/A") return <p className="text-sm text-slate-600 leading-relaxed">N/A</p>;

    let points = [];

    if (Array.isArray(text)) {
        if (text.length === 1 && typeof text[0] === 'string' && (text[0].includes("•") || text[0].includes("🔹"))) {
            points = text[0].split(/•|🔹/).map(p => p.trim()).filter(p => p.length > 0);
        } else {
            points = text.map(t => String(t).trim()).filter(t => t.length > 0);
        }
    } else if (typeof text === 'string') {
        if (text.includes("•") || text.includes("🔹")) {
            points = text.split(/•|🔹/).map(p => p.trim()).filter(p => p.length > 0);
        } else {
            points = [text.trim()];
        }
    } else {
        points = [String(text).trim()];
    }

    if (points.length >= 1) {
        return (
            <ul className="text-sm text-slate-600 leading-relaxed space-y-2 list-none">
                {points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                        <span className="shrink-0 mt-0.5 text-xs">🔹</span>
                        <span>{point}</span>
                    </li>
                ))}
            </ul>
        );
    }

    return <p className="text-sm text-slate-600 leading-relaxed">{points[0]}</p>;
};

const handleCopy = (text) => {
    if (!text || text === "N/A") return;

    let points = [];

    if (Array.isArray(text)) {
        if (text.length === 1 && typeof text[0] === 'string' && (text[0].includes("•") || text[0].includes("🔹"))) {
            points = text[0].split(/•|🔹/).map(p => p.trim()).filter(p => p.length > 0);
        } else {
            points = text.map(t => String(t).trim()).filter(t => t.length > 0);
        }
    } else if (typeof text === 'string') {
        if (text.includes("•") || text.includes("🔹")) {
            points = text.split(/•|🔹/).map(p => p.trim()).filter(p => p.length > 0);
        } else {
            points = [text.trim()];
        }
    } else {
        points = [String(text).trim()];
    }

    const copyText = points.map(p => `• ${p.replace(/^[•🔹\s]+/, '')}`).join('\n');

    navigator.clipboard.writeText(copyText)
        .then(() => toast.success("Copied to clipboard!"))
        .catch(() => toast.error("Failed to copy"));
};

export default function ProjectDetails() {
    const params = useParams();
    const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const [activeTab, setActiveTab] = useState("task");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteReason, setDeleteReason] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState("");
    const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
    const [uploadMeetingModalOpen, setUploadMeetingModalOpen] = useState(false);
    const [uploadDocumentModalOpen, setUploadDocumentModalOpen] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState("");
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();
    const {
        data: projectResponse,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["project-details-page", projectId],
        enabled: Boolean(projectId),
        queryFn: () => apiGet(`/api/project-manager/project-management/${projectId}`),
    });

    const project = useMemo(() => {
        const rawProject =
            projectResponse?.data?.data ||
            projectResponse?.data ||
            null;

        if (!rawProject) {
            return projectData;
        }

        const description = rawProject?.description || "N/A";
        const teamMembers = Array.isArray(rawProject?.assignTeam?.employees)
            ? rawProject.assignTeam.employees.map((member, index) => ({
                name:
                    [member?.firstName, member?.lastName].filter(Boolean).join(" ").trim() ||
                    member?.name ||
                    `Member ${index + 1}`,
                role: toTitleCase(member?.designation || member?.role || "Team member"),
            }))
            : rawProject?.assignTeam?.name
                ? [{ name: rawProject.assignTeam.name, role: "Assigned team" }]
                : [];

        const meetingData = Array.isArray(rawProject?.meetings) ? rawProject.meetings[0] : null;
        let lastMeetingSummaryRaw = meetingData?.lastMeetingSummary || null;
        let lastMeetingDate = meetingData?.meetingDate ? formatDate(meetingData.meetingDate) : null;
        let lastMeetingSummaryProcessed = lastMeetingSummaryRaw;

        if (Array.isArray(lastMeetingSummaryRaw) && lastMeetingSummaryRaw.length > 0) {
            const arrCopy = [...lastMeetingSummaryRaw];
            const firstItem = String(arrCopy[0]);
            const dateMatch = firstItem.match(/Date:\s*([\d-]+)/i);
            if (dateMatch) {
                if (!lastMeetingDate) lastMeetingDate = formatDate(dateMatch[1]);
                arrCopy[0] = firstItem.replace(/Date:\s*[\d-]+/i, '').replace(/^[•🔹\s]+/, '').trim();
                if (!arrCopy[0]) {
                    arrCopy.shift();
                }
            }
            lastMeetingSummaryProcessed = arrCopy;
        } else if (typeof lastMeetingSummaryRaw === 'string') {
            const dateMatch = lastMeetingSummaryRaw.match(/Date:\s*([\d-]+)/i);
            if (dateMatch) {
                if (!lastMeetingDate) lastMeetingDate = formatDate(dateMatch[1]);
                lastMeetingSummaryProcessed = lastMeetingSummaryRaw.replace(/Date:\s*[\d-]+/i, '').replace(/^[•🔹\s]+/, '').trim();
            }
        }

        const documents = Array.isArray(rawProject?.documents)
            ? rawProject.documents.map((doc, index) => ({
                id: doc?.id || index,
                name: doc?.fileName || doc?.title || "N/A",
                date: formatDate(doc?.setDate || doc?.createdAt),
                url: formatValue(doc?.fileUrl || doc?.filePath),
            }))
            : [];

        const managerName =
            [rawProject?.manager?.firstName, rawProject?.manager?.lastName]
                .filter(Boolean)
                .join(" ")
                .trim() || "N/A";
        const progress =
            normalizeProgressValue(rawProject?.projectProgress) ??
            normalizeProgressValue(rawProject?.progress) ??
            calculateProgressFromItems(rawProject?.milestones, ["completed", "complete"]) ??
            calculateProgressFromItems(rawProject?.tasks, ["completed", "complete", "done"]) ??
            null;

        const healthRaw = rawProject?.health;
        const healthArray = Array.isArray(healthRaw)
            ? healthRaw
            : healthRaw && typeof healthRaw === "object"
                ? Object.entries(healthRaw).map(([type, healthStatus]) => ({
                    id: type,
                    type,
                    healthStatus,
                }))
                : [];

        const health = healthArray
            .map((item) => ({
                id: item?.id ?? item?.type,
                type: String(item?.type ?? "N/A"),
                healthStatus: String(item?.healthStatus ?? item?.status ?? "N/A"),
            }))
            .filter((item) => item.type !== "N/A" || item.healthStatus !== "N/A");

        return {
            id: rawProject?.id || "N/A",
            title: rawProject?.name || "N/A",
            status: toTitleCase(rawProject?.status),
            description: description,
            owner: managerName,
            deadline: formatDate(rawProject?.endDate) || "N/A",
            progress: progress,
            projectAiSummary: rawProject?.projectAiSummary || "N/A",
            lastMeetingSummary: lastMeetingSummaryProcessed || "N/A",
            lastMeetingDate: lastMeetingDate,
            team: teamMembers,
            health: health,
            projectHealth: rawProject?.projectHealth || "N/A",
            documents,
        };
    }, [projectResponse]);

    const handleCancelProjectClick = () => {
        setDeleteModalOpen(true);
    };

    const handleDeleteProject = async () => {
        if (!projectId) return;
        setCancelError("");
        setIsCancelling(true);
        try {
            await apiPatch(`/api/project-manager/project-management/${projectId}`, {
                status: "CANCELLED",
                cancelledReason: deleteReason,
            });
            setDeleteModalOpen(false);
            setDeleteReason("");
            toast.success("Project cancelled successfully!");
            router.push("/projects");
        } catch (err) {
            setCancelError(err?.message || "Failed to cancel project.");
        } finally {
            setIsCancelling(false);
        }
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setDeleteReason("");
        setCancelError("");
    };

    const handleUpdateStatus = async () => {
        if (!projectId || !newStatus) return;
        setIsUpdatingStatus(true);
        try {
            await apiPatch(`/api/project-manager/project-management/${projectId}`, {
                status: newStatus,
            });
            await queryClient.invalidateQueries({ queryKey: ["project-details-page", projectId] });
            setStatusModalOpen(false);
            toast.success("Project status updated successfully!");
        } catch (err) {
            toast.error(err?.message || "Failed to update status.");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const getAddButtonConfig = () => {
        return tabs.find((tab) => tab.id === activeTab)?.buttonLabel || "Add";
    };


    const handleAddButtonClick = () => {
        if (activeTab === "task") setCreateTaskModalOpen(true);
        else if (activeTab === "meeting") setUploadMeetingModalOpen(true);
        else if (activeTab === "document") setUploadDocumentModalOpen(true);
    };

    if (isLoading) {
        return <Loading />;
    }

    if (isError) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-sm text-slate-600">
                        {error?.message || "N/A"}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-2">
                <button onClick={() => router.back()} className="text-blue-600 cursor-pointer hover:underline flex items-center gap-2 shrink-0">
                    <FiArrowLeft className="h-4 w-4" /> Go Back
                </button>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => {
                            setNewStatus("");
                            setStatusModalOpen(true);
                        }}
                        variant="outline"
                        className="flex items-center gap-2 border-[#6051E2] text-[#6051E2] hover:bg-[#6051E2] hover:text-white transition-all cursor-pointer h-9 px-4 text-sm"
                    >
                        Update Status
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="p-2 rounded-lg  transition-colors cursor-pointer border border-red-200 hover:border-red-300 hover:bg-red-400 hover:text-white shrink-0 touch-manipulation h-9 w-9 flex items-center justify-center"
                                aria-label="More options"
                            >
                                <FiMoreVertical className="h-5 w-5 " />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                                variant="destructive"
                                disabled={project.status === "Cancelled"}
                                className={`cursor-pointer text-red-600 hover:text-red-600 hover:bg-red-50 border-slate-200 outline-none ${project.status === "Cancelled" ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
                                    }`}
                                onClick={handleCancelProjectClick}
                            >
                                <Trash2 className="h-4 w-4" />
                                Cancel Project
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Project Details
                </h1>
                <p className="text-sm text-slate-600 mt-2">
                    {project.description}
                </p>
            </div>

            {/* Delete Project Confirmation Modal */}
            <Dialog
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    setDeleteModalOpen(open);
                    if (!open) setDeleteReason("");
                }}
            >
                <DialogContent className="sm:max-w-xl max-w-[calc(100vw-2rem)]">
                    <DialogHeader>
                        <DialogTitle className="text-left">Cancle Project?</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                            <div className="shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                <span className="text-red-600 font-bold text-sm">!</span>
                            </div>
                            <p className="text-sm text-red-700">
                                This action cannot be undone. All project data, including files and history, will be permanently removed.
                            </p>
                        </div>
                        {cancelError && (
                            <p className="text-sm text-red-600">{cancelError}</p>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900 block">
                                Please let us know why you are canceling this project.
                            </label>
                            <textarea
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                placeholder="Tell us more about your decision..."
                                className="w-full min-h-[100px] px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6051E2] focus:border-transparent resize-y"
                                rows={7}
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-5">
                        <Button
                            variant="outline"
                            onClick={handleCloseDeleteModal}
                            className="w-full sm:w-auto cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 "
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteProject}
                            disabled={isCancelling}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white cursor-pointer flex items-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            {isCancelling ? "Cancelling..." : "Cancel Project"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Update Status Modal */}
            <Dialog
                open={statusModalOpen}
                onOpenChange={(open) => {
                    setStatusModalOpen(open);
                    if (!open) setNewStatus("");
                }}
            >
                <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)]">
                    <DialogHeader>
                        <DialogTitle className="text-left font-bold text-slate-900">Update Project Status</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900 block">
                                Select Project Status
                            </label>
                            <Select
                                value={newStatus}
                                onValueChange={setNewStatus}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ONGOING">Ongoing</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setStatusModalOpen(false)}
                            className="w-full sm:w-auto cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateStatus}
                            disabled={isUpdatingStatus || !newStatus}
                            className="w-full sm:w-auto bg-[#6051E2] hover:bg-[#6051E2]/90 text-white cursor-pointer"
                        >
                            {isUpdatingStatus ? "Updating..." : "Update Status"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Project Overview Card */}
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                                            {project.title}
                                        </h2>
                                        <p className="text-sm text-slate-600 mt-1">
                                            Project ID: {project.id}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200 self-start">
                                        {project.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                                    <div>
                                        <span className="text-sm text-slate-600">Owner : </span>
                                        <span className="text-base font-medium text-slate-900 mt-1">
                                            {project.owner}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Deadline : </span>
                                        <span className="text-base font-medium text-slate-900 mt-1">
                                            {project.deadline}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-slate-700">
                                            Progress
                                        </p>
                                        <p className="text-sm font-semibold text-[#6051E2]">
                                            {typeof project.progress === "number" ? `${project.progress}%` : "N/A"}
                                        </p>
                                    </div>
                                    {typeof project.progress === "number" ? (
                                        <div className="w-full h-3 rounded-full bg-slate-200/90 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-[#6051E2] transition-all duration-300"
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">N/A</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabs */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200">
                            <div className="flex gap-4 sm:gap-8 overflow-x-auto mt-7">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`pb-3 px-1 text-sm sm:text-base font-medium transition-colors cursor-pointer border-b-2 whitespace-nowrap ${activeTab === tab.id
                                            ? "text-[#6051E2] border-[#6051E2]"
                                            : "text-slate-600 border-transparent hover:text-[#6051E2] hover:border-[#6051E2]/50"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <Button
                                onClick={handleAddButtonClick}
                                className="bg-[#6051E2] hover:bg-[#6051E2]/90 text-white cursor-pointer flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
                            >
                                <FiPlus className="h-4 w-4" />
                                {getAddButtonConfig()}
                            </Button>
                        </div>

                        {activeTab === "task" && (
                            <TaskSection
                                projectId={projectId}
                                createTaskModalOpen={createTaskModalOpen}
                                setCreateTaskModalOpen={setCreateTaskModalOpen}
                            />
                        )}

                        {activeTab === "meeting" && (
                            <MeetingSection
                                projectId={projectId}
                                uploadMeetingModalOpen={uploadMeetingModalOpen}
                                setUploadMeetingModalOpen={setUploadMeetingModalOpen}
                            />
                        )}

                        {activeTab === "document" && (
                            <DocumentSection
                                projectId={projectId}
                                uploadDocumentModalOpen={uploadDocumentModalOpen}
                                setUploadDocumentModalOpen={setUploadDocumentModalOpen}
                            />
                        )}
                    </div>

                    <MilestonesSection projectId={projectId} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Project Summary */}
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#6051E2]"></div>
                                    <h3 className="text-base font-semibold text-slate-900">
                                        Project AI Summary
                                    </h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 cursor-pointer hover:text-[#6051E2] hover:bg-[#6051E2]/10 transition-colors"
                                    onClick={() => handleCopy(Array.isArray(project?.projectAiSummary) ? project?.projectAiSummary[0] : project?.projectAiSummary)}
                                    title="Copy summary"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            {renderTextWithBullets(Array.isArray(project?.projectAiSummary) ? project?.projectAiSummary[0] : project?.projectAiSummary)}
                        </CardContent>
                    </Card>

                    {/* Last Meeting Summary */}
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#6051E2]"></div>
                                    <h3 className="text-base font-semibold text-slate-900">
                                        Last Meeting Summary
                                    </h3>
                                </div>
                                <div className="flex items-center gap-3">
                                    {project.lastMeetingDate && (
                                        <span className="text-xs font-medium text-slate-500">
                                            {project.lastMeetingDate}
                                        </span>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 cursor-pointer text-slate-400 hover:text-[#6051E2] hover:bg-[#6051E2]/10 transition-colors"
                                        onClick={() => handleCopy(project?.lastMeetingSummary)}
                                        title="Copy summary"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            {renderTextWithBullets(project?.lastMeetingSummary)}
                        </CardContent>
                    </Card>

                    {/* Team Assignment */}
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="w-4 h-4 text-[#6051E2]" />
                                <h3 className="text-base font-semibold text-slate-900">
                                    Team assignment
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {project.team.length > 0 ? (
                                    project.team.map((member, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-[#6051E2] flex items-center justify-center text-white text-xs font-medium">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {member.name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {member.role}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500">N/A</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Project Health */}
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-[#6051E2]" />
                                <h3 className="text-base font-semibold text-slate-900">
                                    Project Health
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {project.projectHealth && project.projectHealth !== "N/A" ? (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">
                                            Overall Status
                                        </span>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                project.projectHealth
                                            )}`}
                                        >
                                            {toTitleCase(project.projectHealth)}
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">N/A</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Linked Documents */}
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Link2 className="w-4 h-4 text-[#6051E2]" />
                                <h3 className="text-base font-semibold text-slate-900">
                                    Linked documents
                                </h3>
                            </div>
                            <div className="space-y-2">
                                {project.documents.length > 0 ? (
                                    project.documents.map((doc, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-md cursor-pointer"
                                        >
                                            <FileText className="w-4 h-4 text-slate-400" />
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-700">
                                                {doc.name}
                                            </a>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500">N/A</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
