"use client";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader/PageHeader";
import DateFilter, { getDateRangeFromFilter } from "@/components/DateFilter/Datefilter";
import { FiStar, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { CalendarClock, PlayCircle, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading/Loading";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { apiDelete, apiGet } from "@/lib/api";

const tabs = [
    { id: "ongoing", label: "Ongoing Projects" },
    { id: "completed", label: "Completed" },
    { id: "cancel", label: "Cancel" },
];

const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const normalizeStatus = (status) => {
    switch (String(status || "").toUpperCase()) {
        case "COMPLETED":
            return "completed";
        case "CANCELLED":
            return "cancel";
        case "IN_PROGRESS":
        default:
            return "ongoing";
    }
};

const getTimelineItems = (project, normalizedStatus) => {
    const startDate = formatDate(project.startDate);
    const endDate = formatDate(project.endDate);
    const teamName = project.assignTeam?.name || "Not assigned";

    if (normalizedStatus === "completed") {
        return [
            { phase: "Started", status: "completed", date: startDate || "-" },
            { phase: "Completed", status: "completed", date: endDate || formatDate(project.updatedAt) || "-" },
            { phase: "Team Assigned", status: "completed", date: teamName },
        ];
    }

    if (normalizedStatus === "cancel") {
        return [
            { phase: "Started", status: "completed", date: startDate || "-" },
            { phase: "Project Status", status: "cancelled", date: "cancelled" },
            { phase: "Assigned Team", status: "cancelled", date: teamName },
        ];
    }

    return [
        { phase: "Started", status: "completed", date: startDate || "-" },
        { phase: "Deadline", status: endDate ? "due" : "upcoming", date: endDate || "upcoming" },
        { phase: "Assigned Team", status: "upcoming", date: teamName },
    ];
};

const getPhaseIcon = (phaseName) => {
    switch (phaseName) {
        case "Started":
            return PlayCircle;
        case "Deadline":
            return CalendarClock;
        case "Assigned Team":
        case "Team Assigned":
            return Users;
        default:
            return PlayCircle;
    }
};

const normalizeProject = (project) => {
    const normalizedStatus = normalizeStatus(project.status);
    return {
        id: project.id,
        title: project.name || "Untitled Project",
        status: normalizedStatus,
        rawStatus: project.status,
        vendorName: project.vendorName || "",
        teamName: project.assignTeam?.name || "",
        startDate: project.startDate || null,
        endDate: project.endDate || null,
        createdAt: project.createdAt || null,
        aiSummary:
            project.weeklyMeetingSummary ||
            "No summary available for this project yet.",
        timeline: getTimelineItems(project, normalizedStatus),
    };
};

export default function Projects() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("ongoing");
    const [searchValue, setSearchValue] = useState("");
    const [dateFilterState, setDateFilterState] = useState({
        filter: "all",
        startDate: null,
        endDate: null,
    });

    const {
        data: projectsResponse,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["my-projects"],
        queryFn: () => apiGet("/api/project-manager/project-management/my-projects"),
    });

    const deleteProjectMutation = useMutation({
        mutationFn: (projectId) =>
            apiDelete(`/api/project-manager/project-management/${projectId}`),
    });

    const allProjects = useMemo(() => {
        const rawProjects = Array.isArray(projectsResponse?.data)
            ? projectsResponse.data
            : Array.isArray(projectsResponse?.data?.data)
                ? projectsResponse.data.data
                : [];

        return rawProjects.map(normalizeProject);
    }, [projectsResponse]);

    const filteredProjects = useMemo(() => {
        let projects = allProjects.filter((project) => project.status === activeTab);
        const { start, end } = getDateRangeFromFilter(
            dateFilterState.filter,
            dateFilterState.startDate,
            dateFilterState.endDate
        );

        if (searchValue.trim()) {
            const searchLower = searchValue.toLowerCase();
            projects = projects.filter((project) =>
                project.title.toLowerCase().includes(searchLower) ||
                project.aiSummary.toLowerCase().includes(searchLower) ||
                project.vendorName.toLowerCase().includes(searchLower) ||
                project.teamName.toLowerCase().includes(searchLower)
            );
        }

        if (start || end) {
            projects = projects.filter((project) => {
                const projectDate = new Date(project.startDate || project.createdAt || "");
                if (Number.isNaN(projectDate.getTime())) return false;
                if (start && projectDate < start) return false;
                if (end && projectDate > end) return false;
                return true;
            });
        }

        return projects;
    }, [activeTab, searchValue, dateFilterState, allProjects]);

    const getStatusTagStyle = (status) => {
        switch (status) {
            case "ongoing":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "completed":
                return "bg-green-100 text-green-800 border-green-200";
            case "cancel":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusTagLabel = (status) => {
        switch (status) {
            case "ongoing":
                return "Ongoing Projects";
            case "completed":
                return "Completed";
            case "cancel":
                return "Cancelled";
            default:
                return "Unknown";
        }
    };

    const getPhaseStatusStyle = (phaseStatus) => {
        switch (phaseStatus) {
            case "completed":
                return {
                    dot: "bg-[#6051E2] border-[#6051E2]",
                    line: "bg-[#6051E2]",
                    text: "text-slate-700",
                };
            case "due":
                return {
                    dot: "bg-[#6051E2] border-[#6051E2]",
                    line: "bg-[#6051E2] border-dashed",
                    text: "text-slate-700",
                };
            case "upcoming":
                return {
                    dot: "bg-transparent border-[#6051E2] border-2",
                    line: "bg-transparent border-[#6051E2] border-dashed",
                    text: "text-slate-500",
                };
            case "cancelled":
                return {
                    dot: "bg-red-300 border-red-300",
                    line: "bg-red-300",
                    text: "text-red-600",
                };
            default:
                return {
                    dot: "bg-slate-300 border-slate-300",
                    line: "bg-slate-300",
                    text: "text-slate-500",
                };
        }
    };

    const handleEditProject = (projectId) => {
        router.push(`/projects/create-project?projectId=${projectId}`);
    };

    const handleDeleteProject = async (projectId) => {
        const result = await Swal.fire({
            title: "Delete project?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6051E2",
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;
        try {
            const response = await deleteProjectMutation.mutateAsync(projectId);
            toast.success(response?.message || "Project deleted successfully!");
            await queryClient.invalidateQueries({ queryKey: ["my-projects"] });
        } catch (mutationError) {
            try {
                const refreshResponse = await queryClient.fetchQuery({
                    queryKey: ["my-projects"],
                    queryFn: () => apiGet("/api/project-manager/project-management/my-projects"),
                });

                const refreshedProjects = Array.isArray(refreshResponse?.data)
                    ? refreshResponse.data
                    : Array.isArray(refreshResponse?.data?.data)
                        ? refreshResponse.data.data
                        : [];

                const isStillPresent = refreshedProjects.some(
                    (project) => String(project?.id) === String(projectId)
                );

                if (!isStillPresent) {
                    toast.success("Project deleted successfully!");
                    return;
                }
            } catch {
                // Fall through to the original error toast if verification fails.
            }

            toast.error(mutationError?.message || "Failed to delete project.");
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    if (isError) {
        return (
            <div className="space-y-4 sm:space-y-6">
                <PageHeader
                    title="Project Management"
                    description="AI powered insights for all your projects"
                    searchPlaceholder="search"
                    searchValue={searchValue}
                    onSearchChange={(e) => setSearchValue(e.target.value)}
                    buttonLabel="Create Project"
                    onButtonClick={() => router.push("/projects/create-project")}
                    buttonIcon={<FiPlus className="h-4 w-4" />}
                />
                <Card className="p-8 text-center">
                    <CardContent className="p-0 space-y-4">
                        <p className="text-slate-500 text-sm sm:text-base">
                            {error?.message || "Failed to load projects."}
                        </p>
                        <Button
                            type="button"
                            onClick={() => refetch()}
                            className="bg-[#6051E2] text-white hover:bg-[#6051E2]/90"
                        >
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <PageHeader
                title="Project Management"
                description="AI powered insights for all your projects"
                searchPlaceholder="search"
                searchValue={searchValue}
                onSearchChange={(e) => setSearchValue(e.target.value)}
                buttonLabel="Create Project"
                onButtonClick={() => router.push("/projects/create-project")}
                buttonIcon={<FiPlus className="h-4 w-4" />}
            />

            {/* Filter Tabs and Date Filter */}
            <div className="flex flex-col gap-3 mt-6 sm:mt-8">
                {/* First Row - Tabs and Date Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap gap-3">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 text-xl font-medium transition-colors cursor-pointer border-b-2 ${activeTab === tab.id
                                    ? "text-[#6051E2] border-[#6051E2]"
                                    : "text-slate-600 border-transparent hover:text-[#6051E2] hover:border-[#6051E2]/50"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    {/* Date Filter */}
                    <DateFilter
                        onFilterChange={setDateFilterState}
                        initialFilter="all"
                    />
                </div>

                {/* Show selected custom range below */}
                {dateFilterState.filter === "custom" && dateFilterState.startDate && dateFilterState.endDate && (
                    <div className="flex items-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 w-fit">
                        <span>{dateFilterState.startDate} - {dateFilterState.endDate}</span>
                    </div>
                )}
            </div>

            {/* Project Cards */}
            <div className="space-y-4 sm:space-y-6">
                {filteredProjects.length === 0 ? (
                    <Card className="p-8 text-center">
                        <CardContent className="p-0">
                            <p className="text-slate-500 text-sm sm:text-base">
                                No {activeTab === "ongoing" ? "ongoing" : activeTab === "cancel" ? "cancelled" : activeTab} projects found.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredProjects.map((project) => (
                        <Card key={project.id} className="p-4 sm:p-6">
                            <CardContent className="p-0">
                                <div className="space-y-6">
                                    {/* Project Title and Status */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                                            {project.title}
                                        </h2>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusTagStyle(
                                                project.status
                                            )} self-start sm:self-auto`}
                                        >
                                            {getStatusTagLabel(project.status)}
                                        </span>
                                    </div>

                                    {/* Timeline & Milestone and Weekly AI Summary */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Left Section - Timeline & Milestone */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm sm:text-base font-semibold text-slate-700">
                                                Timeline & milestone
                                            </h3>
                                            <div className="relative pl-6 space-y-4">
                                                {project.timeline.map((phase, index) => {
                                                    const phaseStyle = getPhaseStatusStyle(phase.status);
                                                    const PhaseIcon = getPhaseIcon(phase.phase);
                                                    return (
                                                        <div key={index} className="relative">
                                                            {/* Phase Content */}
                                                            <div className="flex items-start gap-3">
                                                                <div
                                                                    className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border ${phase.status === "cancelled"
                                                                        ? "border-red-200 bg-red-50 text-red-500"
                                                                        : phase.status === "completed"
                                                                            ? "border-[#6051E2]/20 bg-[#6051E2]/10 text-[#6051E2]"
                                                                            : "border-slate-200 bg-slate-50 text-slate-500"
                                                                        }`}
                                                                >
                                                                    <PhaseIcon className="h-4 w-4" />
                                                                </div>
                                                                <div>
                                                                    <p className={`text-sm font-medium ${phaseStyle.text}`}>
                                                                        {phase.phase}
                                                                    </p>
                                                                    <p className={`text-sm mt-1 ${phase.status === "cancelled" ? "text-red-500" : "text-slate-500"}`}>
                                                                        {phase.status === "completed" && `completed: ${phase.date}`}
                                                                        {phase.status === "due" && `due: ${phase.date}`}
                                                                        {phase.status === "upcoming" && phase.date}
                                                                        {phase.status === "cancelled" && phase.date}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Right Section - Weekly AI Summary */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm sm:text-base font-semibold text-slate-700">
                                                Weekly AI summary
                                            </h3>
                                            <div className="bg-slate-50 rounded-lg p-4 min-h-[120px]">
                                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                                    {project.aiSummary}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-3 justify-end">
                                                <Button
                                                    className="flex items-center gap-2 bg-[#6051E2] text-white hover:bg-[#6051E2]/90 cursor-pointer"
                                                    onClick={() => router.push(`/projects/project-details/${project.id}`)}
                                                >
                                                    <FiStar className="h-4 w-4" />
                                                    <span className="text-sm">Full view</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="border-slate-300 bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                                                    onClick={() => handleEditProject(project.id)}
                                                >
                                                    <FiEdit2 className="h-4 w-4" />
                                                    <span className="text-sm">Edit</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex items-center gap-2 border-red-200 bg-red-50 text-red-500 hover:text-white hover:bg-red-400 cursor-pointer"
                                                    onClick={() => handleDeleteProject(project.id)}
                                                    disabled={deleteProjectMutation.isPending}
                                                >
                                                    <FiTrash2 className="h-4 w-4" />
                                                    <span className="text-sm">Delete</span>
                                                </Button>


                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
