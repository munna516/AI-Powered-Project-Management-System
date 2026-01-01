"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
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
import { CheckCircle2, Circle, FileText, Users, TrendingUp, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

// Dummy data - in real app, fetch based on id
const projectData = {
    id: "2020-25",
    title: "Website redesign",
    status: "In progress",
    owner: "Shilpa",
    deadline: "25-12-25",
    progress: 60,
    summary: "This project involves a comprehensive redesign of our company website to improve user experience and modernize the interface. We are processing the design milestones and making significant progress towards completion.",
    lastMeetingSummary: "In the last meeting, we discussed the current progress of the website redesign project. The team reviewed the design mockups and provided feedback on the user interface elements. We also discussed the timeline and upcoming milestones.",
    team: [
        { name: "Zarfa", role: "Project manager" },
        { name: "Se Ra", role: "Project manager" },
        { name: "Se Ra", role: "Project manager" },
    ],
    health: {
        overallStatus: "on track",
        budget: "pending",
        teamSentiment: "on track",
    },
    documents: [
        { name: "project brief.docx" },
        { name: "project brief.docx" },
        { name: "final_design.pdf" },
    ],
    milestones: [
        {
            id: 1,
            phase: "Phase 01",
            date: "Oct 11, 2025, 10:00 AM",
            description: "We have Received Your Order And It's Been Processed!",
            status: "complete",
        },
        {
            id: 2,
            phase: "Phase 02",
            date: "Oct 11, 2025, 10:00 AM",
            description: "We have Approved Your Order And It's Been Processed!",
            status: "complete",
        },
        {
            id: 3,
            phase: "Phase 03",
            date: "Oct 11, 2025, 10:00 AM",
            description: "Your Order Has Been Confirmed And Approved!",
            status: "complete",
        },
        {
            id: 4,
            phase: "Phase 04",
            date: "Oct 11, 2025, 10:00 AM",
            description: "Your Order Has Been Assigned To A Rider",
            status: "upcoming",
        },
    ],
};

const taskListData = [
    {
        id: 1,
        taskName: "User research",
        startDate: "28 Nov, 2025",
        endDate: "30 Nov, 2025",
        priority: "High",
    },
    {
        id: 2,
        taskName: "Define user personas",
        startDate: "28 Nov, 2025",
        endDate: "30 Nov, 2025",
        priority: "Medium",
    },
    {
        id: 3,
        taskName: "Create sitemap",
        startDate: "28 Nov, 2025",
        endDate: "30 Nov, 2025",
        priority: "High",
    },
    {
        id: 4,
        taskName: "Low-fidelity",
        startDate: "29 Nov, 2025",
        endDate: "30 Nov, 2025",
        priority: "Medium",
    },
    {
        id: 5,
        taskName: "Prototype",
        startDate: "29 Nov, 2025",
        endDate: "30 Nov, 2025",
        priority: "High",
    },
    {
        id: 6,
        taskName: "Conduct usability",
        startDate: "29 Nov, 2025",
        endDate: "30 Nov, 2025",
        priority: "Medium",
    },
    {
        id: 7,
        taskName: "Final UI polishing",
        startDate: "29 Nov, 2025",
        endDate: "30 Nov, 2025",
        priority: "Low",
    },
];

const meetingListData = [
    {
        id: 1,
        date: "28 Nov. 2025",
        link: "https://meet.google.com/tmp-...",
        platform: "Google Meet",
        summary: "view",
    },
    {
        id: 2,
        date: "28 Nov. 2025",
        link: "https://meet.google.com/tmp-...",
        platform: "Google Meet",
        summary: "view",
    },
    {
        id: 3,
        date: "28 Nov. 2025",
        link: "https://meet.google.com/tmp-...",
        platform: "Google Meet",
        summary: "view",
    },
    {
        id: 4,
        date: "28 Nov. 2025",
        link: "https://meet.google.com/tmp-...",
        platform: "Zoom",
        summary: "view",
    },
    {
        id: 5,
        date: "28 Nov. 2025",
        link: "https://meet.google.com/tmp-...",
        platform: "Zoom",
        summary: "view",
    },
    {
        id: 6,
        date: "28 Nov. 2025",
        link: "https://meet.google.com/tmp-...",
        platform: "Google Meet",
        summary: "view",
    },
    {
        id: 7,
        date: "28 Nov. 2025",
        link: "https://meet.google.com/tmp-...",
        platform: "Google Meet",
        summary: "view",
    },
];

const documentListData = [
    {
        id: 1,
        date: "29 Nov, 2023",
        url: "https://docs.google.com/v",
        summary: "view",
    },
    {
        id: 2,
        date: "29 Nov, 2023",
        url: "https://docs.google.com/v",
        summary: "view",
    },
    {
        id: 3,
        date: "29 Nov, 2023",
        url: "https://docs.google.com/v",
        summary: "view",
    },
    {
        id: 4,
        date: "29 Nov, 2023",
        url: "https://docs.google.com/v",
        summary: "view",
    },
    {
        id: 5,
        date: "29 Nov, 2023",
        url: "https://docs.google.com/v",
        summary: "view",
    },
    {
        id: 6,
        date: "29 Nov, 2023",
        url: "https://docs.google.com/v",
        summary: "view",
    },
    {
        id: 7,
        date: "29 Nov, 2023",
        url: "https://docs.google.com/v",
        summary: "view",
    },
];

const tabs = [
    { id: "task", label: "Task list" },
    { id: "meeting", label: "Meeting List" },
    { id: "document", label: "Document List" },
];

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
        case "on track":
            return "bg-green-100 text-green-800 border-green-200";
        case "pending":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        default:
            return "bg-slate-100 text-slate-800 border-slate-200";
    }
};

export default function ProjectDetails() {
    const params = useParams();
    const [activeTab, setActiveTab] = useState("task");
    const router = useRouter();
    // In real app, fetch project data based on params.id
    const project = projectData;

    return (
        <div className="">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">

                <button onClick={() => router.back()} className="text-blue-600 cursor-pointer hover:underline flex items-center gap-2"> <FiArrowLeft className="h-4 w-4" /> Go Back</button>
            </div>
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Project Details
                </h1>
                <p className="text-sm text-slate-600 mt-2">
                    Overview of your projects and team performance
                </p>
            </div>

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
                                            {project.progress}%
                                        </p>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                                        <div
                                            className="bg-[#6051E2] h-2.5 rounded-full transition-all duration-300"
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabs */}
                    <div className="space-y-4">
                        <div className="flex gap-32 border-b border-slate-200">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-3 px-1 text-sm sm:text-base font-medium transition-colors cursor-pointer border-b-2 ${activeTab === tab.id
                                        ? "text-[#6051E2] border-[#6051E2]"
                                        : "text-slate-600 border-transparent hover:text-[#6051E2] hover:border-[#6051E2]/50"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
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
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {taskListData.map((task) => (
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
                                                    </TableRow>
                                                ))}
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
                                                {meetingListData.map((meeting) => (
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
                                                            <button onClick={() => router.push(`/projects/project-details/1/meeting-summary?meetingId=${meeting.id}`)} className="text-blue-600 hover:underline cursor-pointer">
                                                                {meeting.summary}
                                                            </button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
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
                                                {documentListData.map((doc) => (
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
                                                            <button onClick={() => router.push(`/projects/project-details/1/meeting-summary?documentId=${doc.id}`)} className="text-blue-600 hover:underline cursor-pointer">
                                                                {doc.summary}
                                                            </button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
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
                            <div className="space-y-6">
                                {project.milestones.map((milestone, index) => (
                                    <div key={milestone.id} className="relative pl-8">
                                        {/* Timeline Line */}
                                        {index < project.milestones.length - 1 && (
                                            <div
                                                className={`absolute left-3 top-8 w-0.5 h-full ${milestone.status === "complete"
                                                    ? "bg-green-500"
                                                    : "bg-slate-300"
                                                    }`}
                                                style={{ height: "calc(100% + 1.5rem)" }}
                                            ></div>
                                        )}

                                        {/* Timeline Dot */}
                                        <div
                                            className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${milestone.status === "complete"
                                                ? "bg-green-400 border-green-400"
                                                : "bg-white border-orange-400"
                                                }`}
                                        >
                                            {milestone.status === "complete" ? (
                                                <CheckCircle2 className="w-4 h-4 text-white" />
                                            ) : (
                                                <Circle className="w-4 h-4 text-orange-400" />
                                            )}
                                        </div>

                                        {/* Milestone Content */}
                                        <div className="space-y-2">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">
                                                        {milestone.phase}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {milestone.date}
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant={
                                                        milestone.status === "complete"
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    className={`cursor-pointer ${milestone.status === "complete"
                                                        ? "bg-green-500 hover:bg-green-600 text-white"
                                                        : "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300"
                                                        }`}
                                                >
                                                    {milestone.status === "complete"
                                                        ? "Complete"
                                                        : "Upcoming"}
                                                </Button>
                                            </div>
                                            <p className="text-sm text-slate-600">
                                                {milestone.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
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
                                {project.team.map((member, index) => (
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
                                ))}
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
                                {project.documents.map((doc, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-md cursor-pointer"
                                    >
                                        <FileText className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-700">
                                            {doc.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
