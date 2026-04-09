"use client";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, TrendingUp, Link2, Trash2 } from "lucide-react";
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
import Loading from "@/components/Loading/Loading";
import { apiGet } from "@/lib/api";
import TaskSection from "@/components/project-details/TaskSection";
import MeetingSection from "@/components/project-details/MeetingSection";
import DocumentSection from "@/components/project-details/DocumentSection";
import MilestonesSection from "@/components/project-details/MilestonesSection";

const projectData = {
    id: "N/A",
    title: "N/A",
    status: "N/A",
    owner: "N/A",
    deadline: "N/A",
    progress: null,
    projectAiSummary: "N/A",
    lastMeetingSummary: "N/A",
    team: [],
    health: {
        overallStatus: "N/A",
        budget: "N/A",
        teamSentiment: "N/A",
    },
    // documents: [],
};

const tabs = [
    { id: "task", label: "Task list", buttonLabel: "Add Task" },
    { id: "meeting", label: "Meeting List", buttonLabel: "Upload Meeting" },
    { id: "document", label: "Document List", buttonLabel: "Upload Document" },
];


const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
        case "completed":
        case "complete":
            return "bg-green-100 text-green-800 border-green-200";
        case "in_progress":
        case "pending":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "ongoing":
            return "bg-blue-100 text-blue-800 border-blue-200";
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

const getProjectHealth = (health) => {
    if (Array.isArray(health)) {
        const healthMap = health.reduce((acc, item) => {
            const key = item?.name || item?.type || item?.label;
            const value = item?.status || item?.value;
            if (key && value) {
                acc[key] = value;
            }
            return acc;
        }, {});

        return {
            overallStatus: healthMap.overallStatus || healthMap.status || "N/A",
            budget: healthMap.budget || "N/A",
            teamSentiment: healthMap.teamSentiment || healthMap.sentiment || "N/A",
        };
    }

    if (health && typeof health === "object") {
        return {
            overallStatus: health.overallStatus || health.status || "N/A",
            budget: health.budget || "N/A",
            teamSentiment: health.teamSentiment || health.sentiment || "N/A",
        };
    }

    return {
        overallStatus: "N/A",
        budget: "N/A",
        teamSentiment: "N/A",
    };
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

export default function ProjectDetails() {
    const params = useParams();
    const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const [activeTab, setActiveTab] = useState("task");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteReason, setDeleteReason] = useState("");
    const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
    const [uploadMeetingModalOpen, setUploadMeetingModalOpen] = useState(false);
    const [uploadDocumentModalOpen, setUploadDocumentModalOpen] = useState(false);
    const router = useRouter();
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

        const lastMeetingSummary = Array.isArray(rawProject?.meetings)
            ? rawProject.meetings[0]?.lastMeetingSummary
            : null;

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

        return {
            id: rawProject?.id || "N/A",
            title: rawProject?.name || "N/A",
            status: toTitleCase(rawProject?.status),
            owner: managerName,
            deadline: formatDate(rawProject?.endDate) || "N/A",
            progress: progress,
            projectAiSummary: rawProject?.projectAiSummary || "N/A",
            lastMeetingSummary:
                lastMeetingSummary || "N/A",
            team: teamMembers,
            health: getProjectHealth(rawProject?.health),
            documents,
        };
    }, [projectResponse]);

    const handleCancelProjectClick = () => {
        setDeleteModalOpen(true);
    };

    const handleDeleteProject = () => {
        // In real app, call API to delete/cancel project
        setDeleteModalOpen(false);
        setDeleteReason("");
        router.push("/projects");
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setDeleteReason("");
    };

    const getAddButtonConfig = () => {
        const tab = tabs.find((t) => t.id === activeTab);
        return tab?.buttonLabel || "Add Task";
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="p-2 rounded-lg  transition-colors cursor-pointer border border-red-200 hover:border-red-300 hover:bg-red-400 hover:text-white shrink-0 touch-manipulation"
                            aria-label="More options"
                        >
                            <FiMoreVertical className="h-5 w-5 " />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                            variant="destructive"
                            className="cursor-pointer text-red-600 hover:text-red-600 hover:bg-red-50 border-slate-200 outline-none"
                            onClick={handleCancelProjectClick}
                        >
                            <Trash2 className="h-4 w-4" />
                            Cancel Project
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Project Details
                </h1>
                <p className="text-sm text-slate-600 mt-2">
                    Overview of your projects and team performance
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
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white cursor-pointer flex items-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Cancel Project
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
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 rounded-full bg-[#6051E2]"></div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    Project AI Summary
                                </h3>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {project?.projectAiSummary[0]}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Last Meeting Summary */}
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 rounded-full bg-[#6051E2]"></div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    Last Meeting Summary
                                </h3>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {project?.lastMeetingSummary}
                            </p>
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
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">
                                        Overall status
                                    </span>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                            project.health.overallStatus
                                        )}`}
                                    >
                                        {project.health.overallStatus}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Budget</span>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                            project.health.budget
                                        )}`}
                                    >
                                        {project.health.budget}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">
                                        Team sentiment
                                    </span>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                            project.health.teamSentiment
                                        )}`}
                                    >
                                        {project.health.teamSentiment}
                                    </span>
                                </div>
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
