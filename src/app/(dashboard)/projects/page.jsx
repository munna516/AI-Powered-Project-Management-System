"use client";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader/PageHeader";
import DateFilter from "@/components/DateFilter/Datefilter";
import { FiFile, FiStar, FiPlus } from "react-icons/fi";
import { useRouter } from "next/navigation";

const tabs = [
    { id: "ongoing", label: "Ongoing Projects" },
    { id: "completed", label: "Completed" },
    { id: "cancel", label: "Cancel" },
];

// Dummy project data
const allProjects = [
    {
        id: 1,
        title: "Basketball Focus App",
        status: "ongoing",
        timeline: [
            { phase: "Phase 1", status: "completed", date: "30/11/23" },
            { phase: "Phase 2", status: "due", date: "30/11/23" },
            { phase: "Phase 3", status: "upcoming" },
        ],
        aiSummary: "Progress of this project is 90%. Team sentiment is positive. Progress of this project is 90%. Team sentiment is positive. Progress of this project is 90%. Team sentiment is positive. Progress of this project is 90%. Team sentiment is positive.",
    },
    {
        id: 2,
        title: "Basketball Focus App",
        status: "ongoing",
        timeline: [
            { phase: "Phase 1", status: "completed", date: "30/11/23" },
            { phase: "Phase 2", status: "due", date: "30/11/23" },
            { phase: "Phase 3", status: "upcoming" },
        ],
        aiSummary: "Progress of this project is 90%. Team sentiment is positive. Progress of this project is 90%. Team sentiment is positive. Progress of this project is 90%. Team sentiment is positive. Progress of this project is 90%. Team sentiment is positive.",
    },
    {
        id: 3,
        title: "E-commerce Platform",
        status: "completed",
        timeline: [
            { phase: "Phase 1", status: "completed", date: "15/10/23" },
            { phase: "Phase 2", status: "completed", date: "25/10/23" },
            { phase: "Phase 3", status: "completed", date: "05/11/23" },
        ],
        aiSummary: "Project completed successfully. All milestones achieved on time. Final delivery exceeded expectations. Team performance was excellent throughout the project lifecycle.",
    },
    {
        id: 4,
        title: "Mobile Banking App",
        status: "cancel",
        timeline: [
            { phase: "Phase 1", status: "completed", date: "20/09/23" },
            { phase: "Phase 2", status: "cancelled" },
            { phase: "Phase 3", status: "cancelled" },
        ],
        aiSummary: "Project was cancelled due to budget constraints. Phase 1 deliverables were completed and handed over. Team resources were reallocated to other priority projects.",
    },
    {
        id: 5,
        title: "AI Analytics Dashboard",
        status: "ongoing",
        timeline: [
            { phase: "Phase 1", status: "completed", date: "10/11/23" },
            { phase: "Phase 2", status: "due", date: "15/12/23" },
            { phase: "Phase 3", status: "upcoming" },
        ],
        aiSummary: "Progress of this project is 75%. Team sentiment is positive. Current sprint is on track. Some minor delays in backend integration but overall timeline remains achievable.",
    },
    {
        id: 6,
        title: "Cloud Migration Project",
        status: "completed",
        timeline: [
            { phase: "Phase 1", status: "completed", date: "01/08/23" },
            { phase: "Phase 2", status: "completed", date: "15/09/23" },
            { phase: "Phase 3", status: "completed", date: "30/09/23" },
        ],
        aiSummary: "Cloud migration completed ahead of schedule. All systems successfully migrated with zero downtime. Performance improvements observed across all metrics.",
    },
];

export default function Projects() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("ongoing");
    const [searchValue, setSearchValue] = useState("");
    const [dateFilterState, setDateFilterState] = useState({
        filter: "today",
        startDate: null,
        endDate: null,
    });

    const filteredProjects = useMemo(() => {
        let projects = allProjects.filter((project) => project.status === activeTab);

        if (searchValue.trim()) {
            const searchLower = searchValue.toLowerCase();
            projects = projects.filter((project) =>
                project.title.toLowerCase().includes(searchLower) ||
                project.aiSummary.toLowerCase().includes(searchLower)
            );
        }

        // Date filtering can be added here if projects have date fields
        // For now, we'll just return the filtered projects

        return projects;
    }, [activeTab, searchValue, dateFilterState]);

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
                return " Ongoing Projects";
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
                        initialFilter="today"
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
                                No {activeTab === "ongoing" ? "ongoing" : activeTab} projects found.
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
                                                    const isLast = index === project.timeline.length - 1;
                                                    return (
                                                        <div key={index} className="relative">
                                                            {/* Vertical Line */}
                                                            {!isLast && (
                                                                <div
                                                                    className={`absolute left-2 top-6 w-0.5 h-full ${phase.status === "due"
                                                                        ? "border-l-2 border-dashed border-[#6051E2]"
                                                                        : phaseStyle.line
                                                                        }`}
                                                                    style={{ height: "calc(100% + 1rem)" }}
                                                                ></div>
                                                            )}
                                                            {/* Phase Dot */}
                                                            <div
                                                                className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 ${phaseStyle.dot}`}
                                                            ></div>
                                                            {/* Phase Content */}
                                                            <div className="ml-6">
                                                                <p className={`text-sm font-medium ${phaseStyle.text}`}>
                                                                    {phase.phase}
                                                                </p>
                                                                {phase.status === "completed" && (
                                                                    <p className="text-xs text-slate-500 mt-1">
                                                                        completed: {phase.date}
                                                                    </p>
                                                                )}
                                                                {phase.status === "due" && (
                                                                    <p className="text-xs text-slate-500 mt-1">
                                                                        due: {phase.date}
                                                                    </p>
                                                                )}
                                                                {phase.status === "upcoming" && (
                                                                    <p className="text-xs text-slate-500 mt-1">
                                                                        upcoming
                                                                    </p>
                                                                )}
                                                                {phase.status === "cancelled" && (
                                                                    <p className="text-xs text-red-500 mt-1">
                                                                        cancelled
                                                                    </p>
                                                                )}
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
