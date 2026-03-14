"use client";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
import { CheckCircle2, Circle, FileText, Users, TrendingUp, Link2, Trash2, CalendarIcon } from "lucide-react";
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
import toast from "react-hot-toast";
import Loading from "@/components/Loading/Loading";
import { apiGet } from "@/lib/api";

const projectData = {
    id: "Not available",
    title: "Not available",
    status: "Not available",
    owner: "Not available",
    deadline: "Not available",
    progress: null,
    summary: "Not available",
    lastMeetingSummary: "Not available",
    team: [],
    health: {
        overallStatus: "Not available",
        budget: "Not available",
        teamSentiment: "Not available",
    },
    documents: [],
    milestones: [],
    tasks: [],
    meetings: [],
};

const taskListData = [];
const meetingListData = [];
const documentListData = [];

const tabs = [
    { id: "task", label: "Task list", buttonLabel: "Add Task" },
    { id: "meeting", label: "Meeting List", buttonLabel: "Upload Meeting" },
    { id: "document", label: "Document List", buttonLabel: "Upload Document" },
];

const priorityOptions = ["High", "Medium", "Low"];
const statusOptions = ["High", "Medium", "Low"];
const platformOptions = ["Google Meet", "Zoom", "Microsoft Teams", "Other"];

const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
        case "high":
            return "bg-red-100 text-red-800 border-red-200";
        case "medium":
            return "bg-green-100 text-green-800 border-green-200";
        case "low":
            return "bg-orange-100 text-orange-800 border-orange-200";
        default:
            return "bg-slate-100 text-slate-800 border-slate-200";
    }
};

const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
        case "complete":
            return "bg-green-100 text-green-800 border-green-200";
        case "pending":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "ongoing":
            return "bg-blue-100 text-blue-800 border-blue-200";
        default:
            return "bg-slate-100 text-slate-800 border-slate-200";
    }
};

const formatValue = (value) => value || "Not available";

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

const formatDateTime = (value) => {
    if (!value) return "Not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";
    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const toTitleCase = (value) => {
    if (!value) return "Not available";
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
            overallStatus: healthMap.overallStatus || healthMap.status || "Not available",
            budget: healthMap.budget || "Not available",
            teamSentiment: healthMap.teamSentiment || healthMap.sentiment || "Not available",
        };
    }

    if (health && typeof health === "object") {
        return {
            overallStatus: health.overallStatus || health.status || "Not available",
            budget: health.budget || "Not available",
            teamSentiment: health.teamSentiment || health.sentiment || "Not available",
        };
    }

    return {
        overallStatus: "Not available",
        budget: "Not available",
        teamSentiment: "Not available",
    };
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
    const [taskForm, setTaskForm] = useState({ taskName: "", startDate: "", endDate: "", priority: "", status: "" });
    const [meetingForm, setMeetingForm] = useState({ date: "", link: "", platform: "", summary: "" });
    const [documentForm, setDocumentForm] = useState({ date: "", link: "", summary: "" });
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

        const meetings = Array.isArray(rawProject?.meetings)
            ? rawProject.meetings.map((meeting, index) => ({
                id: meeting?.id || index,
                date: formatDate(meeting?.meetingDate || meeting?.createdAt),
                link: formatValue(meeting?.meetingUrl),
                platform: formatValue(meeting?.platform),
                summary: meeting?.aiMeetingSummary || meeting?.projectSummary || meeting?.lastMeetingSummary ? "view" : "Not available",
            }))
            : meetingListData;

        const documents = Array.isArray(rawProject?.documents)
            ? rawProject.documents.map((doc, index) => ({
                id: doc?.id || index,
                name: doc?.fileName || doc?.title || "Not available",
                date: formatDate(doc?.setDate || doc?.createdAt),
                url: formatValue(doc?.fileUrl || doc?.filePath),
                summary: doc?.aiDocumentSummary ? "view" : "Not available",
            }))
            : documentListData;

        const tasks = Array.isArray(rawProject?.tasks)
            ? rawProject.tasks.map((task, index) => ({
                id: task?.id || index,
                taskName: task?.name || task?.taskName || "Not available",
                startDate: formatDate(task?.startDate),
                endDate: formatDate(task?.endDate),
                priority: toTitleCase(task?.priority),
                status: toTitleCase(task?.status),
            }))
            : taskListData;

        const milestones = Array.isArray(rawProject?.milestones)
            ? rawProject.milestones.map((milestone, index) => ({
                id: milestone?.id || index,
                phase: milestone?.phase || milestone?.name || `Phase ${index + 1}`,
                date: formatDateTime(milestone?.date || milestone?.deadline || milestone?.createdAt),
                description: milestone?.description || "Not available",
                status:
                    String(milestone?.status || "").toLowerCase() === "completed" ||
                        String(milestone?.status || "").toLowerCase() === "complete"
                        ? "complete"
                        : "upcoming",
            }))
            : [];

        const managerName =
            [rawProject?.manager?.firstName, rawProject?.manager?.lastName]
                .filter(Boolean)
                .join(" ")
                .trim() || "Not available";

        return {
            id: rawProject?.id || "Not available",
            title: rawProject?.name || "Not available",
            status: toTitleCase(rawProject?.status),
            owner: managerName,
            deadline: formatDate(rawProject?.endDate),
            progress: null,
            summary: rawProject?.description || "Not available",
            lastMeetingSummary:
                rawProject?.weeklyMeetingSummary ||
                rawProject?.meetings?.[0]?.aiMeetingSummary ||
                rawProject?.meetings?.[0]?.projectSummary ||
                rawProject?.meetings?.[0]?.lastMeetingSummary ||
                "Not available",
            team: teamMembers,
            health: getProjectHealth(rawProject?.health),
            documents,
            milestones,
            tasks,
            meetings,
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

    const resetTaskForm = () => setTaskForm({ taskName: "", startDate: "", endDate: "", priority: "", status: "" });
    const resetMeetingForm = () => setMeetingForm({ date: "", link: "", platform: "", summary: "" });
    const resetDocumentForm = () => setDocumentForm({ date: "", link: "", summary: "" });

    const handleCreateTask = () => {
        // In real app, call API to create task
        setCreateTaskModalOpen(false);
        resetTaskForm();
        toast.success("Task created successfully!");
    };

    const handleUploadMeeting = () => {
        // In real app, call API to upload meeting
        setUploadMeetingModalOpen(false);
        resetMeetingForm();
        toast.success("Meeting uploaded successfully!");
    };

    const handleUploadDocument = () => {
        // In real app, call API to upload document
        setUploadDocumentModalOpen(false);
        resetDocumentForm();
        toast.success("Document uploaded successfully!");
    };

    const inputBaseClass = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6051E2] focus:border-transparent";
    const labelClass = "text-sm font-medium text-slate-900 block mb-1.5";

    if (isLoading) {
        return <Loading />;
    }

    if (isError) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-sm text-slate-600">
                        {error?.message || "Not available"}
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

            {/* Create Task Modal */}
            <Dialog
                open={createTaskModalOpen}
                onOpenChange={(open) => {
                    setCreateTaskModalOpen(open);
                    if (!open) resetTaskForm();
                }}
            >
                <DialogContent className="sm:max-w-lg max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-left">Create Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Task Name</label>
                            <input
                                type="text"
                                value={taskForm.taskName}
                                onChange={(e) => setTaskForm((p) => ({ ...p, taskName: e.target.value }))}
                                placeholder="e.g. User research"
                                className={inputBaseClass}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Start Date</label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="date"
                                        value={taskForm.startDate}
                                        onChange={(e) => setTaskForm((p) => ({ ...p, startDate: e.target.value }))}
                                        className={`${inputBaseClass} pl-9`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>End Date</label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="date"
                                        value={taskForm.endDate}
                                        onChange={(e) => setTaskForm((p) => ({ ...p, endDate: e.target.value }))}
                                        className={`${inputBaseClass} pl-9`}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Priority Level</label>
                                <Select value={taskForm.priority} onValueChange={(v) => setTaskForm((p) => ({ ...p, priority: v }))}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorityOptions.map((opt) => (
                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className={labelClass}>Current Status</label>
                                <Select value={taskForm.status} onValueChange={(v) => setTaskForm((p) => ({ ...p, status: v }))}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((opt) => (
                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setCreateTaskModalOpen(false)} className="w-full sm:w-auto cursor-pointer">
                            Cancel
                        </Button>
                        <Button onClick={handleCreateTask} className="w-full sm:w-auto bg-[#6051E2] hover:bg-[#6051E2]/90 text-white cursor-pointer flex items-center gap-2">
                            <FiPlus className="h-4 w-4" />
                            Create Task
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Upload Meeting Modal */}
            <Dialog
                open={uploadMeetingModalOpen}
                onOpenChange={(open) => {
                    setUploadMeetingModalOpen(open);
                    if (!open) resetMeetingForm();
                }}
            >
                <DialogContent className="sm:max-w-lg max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-left">Upload Meeting</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Set Date</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="date"
                                    value={meetingForm.date}
                                    onChange={(e) => setMeetingForm((p) => ({ ...p, date: e.target.value }))}
                                    className={`${inputBaseClass} pl-9`}
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Upload recording link</label>
                            <input
                                type="url"
                                value={meetingForm.link}
                                onChange={(e) => setMeetingForm((p) => ({ ...p, link: e.target.value }))}
                                placeholder="e.g. Paste the link"
                                className={inputBaseClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Platform</label>
                            <Select value={meetingForm.platform} onValueChange={(v) => setMeetingForm((p) => ({ ...p, platform: v }))}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    {platformOptions.map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className={labelClass}>Write Meeting Summary</label>
                            <textarea
                                value={meetingForm.summary}
                                onChange={(e) => setMeetingForm((p) => ({ ...p, summary: e.target.value }))}
                                placeholder="Write meeting summary..."
                                className={`${inputBaseClass} min-h-[100px] resize-y`}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setUploadMeetingModalOpen(false)} className="w-full sm:w-auto cursor-pointer">
                            Cancel
                        </Button>
                        <Button onClick={handleUploadMeeting} className="w-full sm:w-auto bg-[#6051E2] hover:bg-[#6051E2]/90 text-white cursor-pointer flex items-center gap-2">
                            <FiPlus className="h-4 w-4" />
                            Upload Meeting
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Upload Document Modal */}
            <Dialog
                open={uploadDocumentModalOpen}
                onOpenChange={(open) => {
                    setUploadDocumentModalOpen(open);
                    if (!open) resetDocumentForm();
                }}
            >
                <DialogContent className="sm:max-w-lg max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-left">Upload Document</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Set Date</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="date"
                                    value={documentForm.date}
                                    onChange={(e) => setDocumentForm((p) => ({ ...p, date: e.target.value }))}
                                    className={`${inputBaseClass} pl-9`}
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Upload Document link</label>
                            <input
                                type="url"
                                value={documentForm.link}
                                onChange={(e) => setDocumentForm((p) => ({ ...p, link: e.target.value }))}
                                placeholder="e.g. Paste the link"
                                className={inputBaseClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Write Document Summary</label>
                            <textarea
                                value={documentForm.summary}
                                onChange={(e) => setDocumentForm((p) => ({ ...p, summary: e.target.value }))}
                                placeholder="Write document summary..."
                                className={`${inputBaseClass} min-h-[100px] resize-y`}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setUploadDocumentModalOpen(false)} className="w-full sm:w-auto cursor-pointer">
                            Cancel
                        </Button>
                        <Button onClick={handleUploadDocument} className="w-full sm:w-auto bg-[#6051E2] hover:bg-[#6051E2]/90 text-white cursor-pointer flex items-center gap-2">
                            <FiPlus className="h-4 w-4" />
                            Upload Document
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
                                        <p className="text-sm text-slate-600">Owner</p>
                                        <p className="text-base font-medium text-slate-900 mt-1">
                                            {project.owner}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">Deadline</p>
                                        <p className="text-base font-medium text-slate-900 mt-1">
                                            {project.deadline}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-slate-700">
                                            Progress
                                        </p>
                                        <p className="text-sm font-medium text-slate-900">
                                            {typeof project.progress === "number" ? `${project.progress}%` : "Not available"}
                                        </p>
                                    </div>
                                    {typeof project.progress === "number" ? (
                                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                                            <div
                                                className="bg-[#6051E2] h-2.5 rounded-full transition-all duration-300"
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">Not available</p>
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

                        {/* Tab Content */}
                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                {/* Task List */}
                                {activeTab === "task" && (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-[#6051E2]">
                                                <TableRow className="border-b-0 hover:bg-[#6051E2]">
                                                    <TableHead className="py-3 px-4 text-white font-semibold text-left">
                                                        Task Name
                                                    </TableHead>
                                                    <TableHead className="py-3 px-4 text-white font-semibold text-center">
                                                        Start Date
                                                    </TableHead>
                                                    <TableHead className="py-3 px-4 text-white font-semibold text-center">
                                                        End Date
                                                    </TableHead>
                                                    <TableHead className="py-3 px-4 text-white font-semibold text-right">
                                                        Priority
                                                    </TableHead>

                                                    <TableHead className="py-3 px-4 text-white font-semibold text-right">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {project.tasks.length > 0 ? (
                                                    project.tasks.map((task) => (
                                                        <TableRow
                                                            key={task.id}
                                                            className="border-b border-slate-100 hover:bg-slate-50"
                                                        >
                                                            <TableCell className="py-3 px-4 text-slate-800">
                                                                {task.taskName}
                                                            </TableCell>
                                                            <TableCell className="py-3 px-4 text-slate-800 text-center">
                                                                {task.startDate}
                                                            </TableCell>
                                                            <TableCell className="py-3 px-4 text-slate-800 text-center">
                                                                {task.endDate}
                                                            </TableCell>
                                                            <TableCell className="py-3 px-4 text-right">
                                                                <span
                                                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                                                                        task.priority
                                                                    )}`}
                                                                >
                                                                    {task.priority}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="py-3 px-4 text-right">
                                                                <span
                                                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                                        task.status
                                                                    )}`}
                                                                >
                                                                    {task.status}
                                                                </span>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="py-6 text-center text-slate-500">
                                                            Not available
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}

                                {/* Meeting List */}
                                {activeTab === "meeting" && (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-[#6051E2]">
                                                <TableRow className="border-b-0 hover:bg-[#6051E2]">
                                                    <TableHead className="py-3 px-4 text-white font-semibold">
                                                        Date
                                                    </TableHead>
                                                    <TableHead className="py-3 px-4 text-white font-semibold">
                                                        Meeting recordings link
                                                    </TableHead>
                                                    <TableHead className="py-3 px-4 text-white font-semibold">
                                                        Platform
                                                    </TableHead>
                                                    <TableHead className="py-3 px-4 text-white font-semibold">
                                                        Meeting Summary
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {project.meetings.length > 0 ? (
                                                    project.meetings.map((meeting) => (
                                                        <TableRow
                                                            key={meeting.id}
                                                            className="border-b border-slate-100 hover:bg-slate-50"
                                                        >
                                                            <TableCell className="py-3 px-4 text-slate-800">
                                                                {meeting.date}
                                                            </TableCell>
                                                            <TableCell className="py-3 px-4 text-slate-800">
                                                                {meeting.link}
                                                            </TableCell>
                                                            <TableCell className="py-3 px-4 text-slate-800">
                                                                {meeting.platform}
                                                            </TableCell>
                                                            <TableCell className="py-3 px-4">
                                                                {meeting.summary === "view" ? (
                                                                    <button onClick={() => router.push(`/projects/project-details/${projectId}/meeting-summary?meetingId=${meeting.id}`)} className="text-blue-600 hover:underline cursor-pointer">
                                                                        {meeting.summary}
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-slate-500">{meeting.summary}</span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="py-6 text-center text-slate-500">
                                                            Not available
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}

                                {/* Document List */}
                                {activeTab === "document" && (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-[#6051E2]">
                                                <TableRow className="border-b-0 hover:bg-[#6051E2]">
                                                    <TableHead className="py-3 px-4 text-white font-semibold">
                                                        Date
                                                    </TableHead>
                                                    <TableHead className="py-3 px-4 text-white font-semibold">
                                                        Document Url
                                                    </TableHead>
                                                    <TableHead className="py-3 px-4 text-white font-semibold">
                                                        Meeting Summary
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {project.documents.length > 0 ? (
                                                    project.documents.map((doc) => (
                                                        <TableRow
                                                            key={doc.id}
                                                            className="border-b border-slate-100 hover:bg-slate-50"
                                                        >
                                                            <TableCell className="py-3 px-4 text-slate-800">
                                                                {doc.date}
                                                            </TableCell>
                                                            <TableCell className="py-3 px-4 text-slate-800">
                                                                {doc.url}
                                                            </TableCell>
                                                            <TableCell className="py-3 px-4">
                                                                {doc.summary === "view" ? (
                                                                    <button onClick={() => router.push(`/projects/project-details/${projectId}/meeting-summary?documentId=${doc.id}`)} className="text-blue-600 hover:underline cursor-pointer">
                                                                        {doc.summary}
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-slate-500">{doc.summary}</span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="py-6 text-center text-slate-500">
                                                            Not available
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Milestones Section */}
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-6">
                                Milestones
                            </h3>
                            <div className="relative">
                                {/* Vertical Timeline Line - positioned on left-center */}
                                <div className="absolute left-32 top-0 bottom-0 w-0.5 bg-slate-300 hidden md:block"></div>

                                <div className="space-y-8">
                                    {project.milestones.length > 0 ? (
                                        project.milestones.map((milestone) => (
                                            <div
                                                key={milestone.id}
                                                className="relative flex flex-col md:flex-row items-start"
                                            >
                                                {/* Date on Left */}
                                                <div className="w-full md:w-32 text-left md:text-right md:pr-6 flex-shrink-0">
                                                    <p className="text-sm font-medium text-slate-700">
                                                        {milestone.date !== "Not available" ? milestone.date.split(", ")[0] : "Not available"}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {milestone.date !== "Not available" && milestone.date.includes(", ")
                                                            ? milestone.date.split(", ")[1]
                                                            : "Not available"}
                                                    </p>
                                                </div>

                                                {/* Timeline Dot - on the line */}
                                                <div className="absolute left-32 transform -translate-x-1/2 -translate-y-1 z-10 hidden md:block">
                                                    <div
                                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${milestone.status === "complete"
                                                            ? "bg-green-500 border-green-500"
                                                            : "bg-white border-orange-400"
                                                            }`}
                                                    >
                                                        {milestone.status === "complete" ? (
                                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                                        ) : (
                                                            <Circle className="w-4 h-4 text-orange-400 fill-orange-400" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Phase Content on Right */}
                                                <div className="w-full md:flex-1 md:pl-12 space-y-2">
                                                    <p className="text-sm font-medium text-slate-700">
                                                        {milestone.phase.replace("Phase ", "Phase: ")}
                                                    </p>
                                                    <p className="text-sm text-slate-600">
                                                        {milestone.description}
                                                    </p>
                                                    <Button
                                                        size="sm"
                                                        className={`cursor-pointer rounded-full ${milestone.status === "complete"
                                                            ? "bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
                                                            : "bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-300"
                                                            } border`}
                                                    >
                                                        {milestone.status === "complete"
                                                            ? "Complete"
                                                            : "Upcoming"}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-500">Not available</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Project Summary */}
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 rounded-full bg-[#6051E2]"></div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    Project Summary
                                </h3>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {project.summary}
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
                                {project.lastMeetingSummary}
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
                                    <p className="text-sm text-slate-500">Not available</p>
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
                                    <p className="text-sm text-slate-500">Not available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
