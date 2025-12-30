"use client";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FiArrowLeft, FiMail, FiPhone, FiDownload, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { MdOutlineEmail, MdOutlinePhone } from "react-icons/md";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// Dummy vendor data
const vendorData = {
    id: 1,
    name: "Innovatech Solutions",
    type: "Software Development Partner",
    slaStatus: "Compliant",
    totalProjects: 36,
    email: "contact@innovatech.com",
    projectSummary: "The project is progressing well, with key design implementations near. However, The project is progressing well, with key design milestones achieved on time. However, The project is progressing well, with key design implementation near. However, The project is progressing well, with key design milestones still in progress...",
    aiRisk: {
        summary: "AI analyzed meetings, emails and docs and identified potential delivery risks. Timeline may be affected if delays occur.",
        details: [
            "Contract delivery delay",
            "Mobile navigation complexity",
            "Dependency on final approval"
        ]
    },
    aiAssumptions: {
        summary: "AI analyzed meetings, emails and docs and identified potential delivery risks. Timeline may be affected if delays occur.",
        details: [
            "Budget is approved",
            "Stakeholders available for review",
            "Technology stack is stable"
        ]
    },
    aiDependencies: {
        summary: "AI detected dependencies that may block progress if not completed on time.",
        details: [
            "Design sign-off",
            "Backend API readiness",
            "User testing completion"
        ]
    },
    aiDecisions: {
        summary: "AI extracted decisions from meeting transcripts and approval emails.",
        details: [
            "Proceed with Phase 2",
            "Adopt new cloud vendor",
            "Postpone feature to next release"
        ]
    },
    vendorProfile: {
        name: "Jane Doe",
        role: "e.g. lead developer",
        email: "jane.doe@innovatech.com",
        phone: "+1 (555) 123-4567",
        avatar: "https://cdn.pixabay.com/photo/2024/09/23/10/39/man-9068618_640.jpg"
    },
    contactPerson: {
        name: "Maya Mori",
        role: "Project Manager",
        email: "jane.doe@innovatech.com",
        phone: "+1 (555) 123-4567",
        avatar: "https://media.licdn.com/dms/image/v2/D4E03AQEwpCRnQnpVag/profile-displayphoto-scale_200_200/B4EZgO_E_RHgAk-/0/1752598082646?e=2147483647&v=beta&t=NixziB5SwFlx2sJ2KDbqxVnxt6QcQGrzMMEbjwUEvbA"
    },
    performanceHistory: {
        percentage: 75,
        trend: "+10%",
        chartData: [
            { month: "Jan", value: 42 },
            { month: "Feb", value: 38 },
            { month: "Mar", value: 45 },
            { month: "Apr", value: 35 },
            { month: "May", value: 28 },
            { month: "Jun", value: 48 },
            { month: "Jul", value: 45 },
        ]
    },
    slaDocuments: [
        { name: "Master_Service_Agreement.pdf", size: "2.3 MB" },
        { name: "SLA_Addendum_03_2023.pdf", size: "1.1 MB" }
    ],
    associatedProjects: [
        { name: "Project Phoenix", status: "In Progress" },
        { name: "Project Neptune", status: "Completed" },
        { name: "Project AI Integration Initiative", status: "Cancelled" }
    ],
    communicationLogs: [
        { type: "email", title: "Email sent regarding Q3 performance review.", date: "August 15, 2023 - 10:30 AM" },
        { type: "call", title: "Scheduled call to discuss Project Phoenix milestones.", date: "August 10, 2023 - 3:00 PM" }
    ]
};

const getStatusStyle = (status) => {
    switch (status) {
        case "Compliant":
            return "bg-green-100 text-green-600";
        case "Non-Compliant":
            return "bg-red-100 text-red-600";
        case "In Progress":
            return "bg-yellow-100 text-yellow-600";
        case "Completed":
            return "bg-green-100 text-green-600";
        case "Cancelled":
            return "bg-red-100 text-red-600";
        default:
            return "bg-gray-100 text-gray-600";
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case "In Progress":
            return <FiClock className="h-4 w-4" />;
        case "Completed":
            return <FiCheckCircle className="h-4 w-4" />;
        case "Cancelled":
            return <FiAlertCircle className="h-4 w-4" />;
        default:
            return null;
    }
};

export default function ViewVendor() {
    const { id } = useParams();
    const router = useRouter();

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => router.push("/vendors")}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition cursor-pointer"
            >
                <FiArrowLeft className="h-4 w-4" />
                Back to Vendors
            </button>

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">{vendorData.name}</h1>
                <p className="text-sm text-slate-500">{vendorData.type}</p>
            </div>

            {/* Status Row and Project Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* SLA Status */}
                    <Card className="p-4">
                        <CardContent className="p-0">
                            <p className="text-xs text-slate-500 mb-2">SLA Status</p>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(vendorData.slaStatus)}`}>
                                <FiCheckCircle className="h-3 w-3" />
                                {vendorData.slaStatus}
                            </span>
                        </CardContent>
                    </Card>

                    {/* Total Projects */}
                    <Card className="p-4 bg-amber-50 border-amber-100">
                        <CardContent className="p-0">
                            <p className="text-xs text-slate-500 mb-2">Total Projects</p>
                            <p className="text-2xl font-bold text-slate-900">{vendorData.totalProjects}</p>
                        </CardContent>
                    </Card>

                    {/* Email Address */}
                    <Card className="p-4">
                        <CardContent className="p-0">
                            <p className="text-xs text-slate-500 mb-2">Email Address</p>
                            <p className="text-sm text-slate-700 truncate">{vendorData.email}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Project AI Summary */}
                <Card className="p-4 border-l-4 border-l-primary">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-2 mb-3">
                            <HiOutlineSparkles className="h-4 w-4 text-primary" />
                            <p className="text-sm font-semibold text-primary font-medium">Project AI Summary</p>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                            {vendorData.projectSummary}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* AI Summary Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">AI summary vendor RAIDD</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - AI Cards */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* AI Risk */}
                        <Card className="p-4 bg-[#EFEEFC]">
                            <CardContent className="p-0 space-y-3">
                                <h3 className="font-semibold text-slate-900">AI Risk</h3>
                                <div className="flex items-start gap-2 p-3  rounded-lg">
                                    <HiOutlineSparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium text-slate-700 mb-1">AI SUMMARY</p>
                                        <p className="text-xs text-slate-600 leading-relaxed">{vendorData.aiRisk.summary}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700 mb-2">Risk Details</p>
                                    <ul className="space-y-1">
                                        {vendorData.aiRisk.details.map((item, idx) => (
                                            <li key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                                                <span className="h-1 w-1 bg-slate-400 rounded-full"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Assumptions */}
                        <Card className="p-4 bg-[#EFEEFC]">
                            <CardContent className="p-0 space-y-3">
                                <h3 className="font-semibold text-slate-900">AI Assumptions</h3>
                                <div className="flex items-start gap-2 p-3  rounded-lg">
                                    <HiOutlineSparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                    <div >
                                        <p className="text-xs font-medium text-slate-700 mb-1">AI SUMMARY</p>
                                        <p className="text-xs text-slate-600 leading-relaxed">{vendorData.aiAssumptions.summary}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700 mb-2">Assumptions</p>
                                    <ul className="space-y-1">
                                        {vendorData.aiAssumptions.details.map((item, idx) => (
                                            <li key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                                                <span className="h-1 w-1 bg-slate-400 rounded-full"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Dependencies */}
                        <Card className="p-4 bg-[#EFEEFC]">
                            <CardContent className="p-0 space-y-3">
                                <h3 className="font-semibold text-slate-900">AI Dependencies</h3>
                                <div className="flex items-start gap-2 p-3  rounded-lg">
                                    <HiOutlineSparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium text-slate-700 mb-1">AI SUMMARY</p>
                                        <p className="text-xs text-slate-600 leading-relaxed">{vendorData.aiDependencies.summary}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700 mb-2">Dependencies</p>
                                    <ul className="space-y-1">
                                        {vendorData.aiDependencies.details.map((item, idx) => (
                                            <li key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                                                <span className="h-1 w-1 bg-slate-400 rounded-full"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Decisions */}
                        <Card className="p-4 bg-[#EFEEFC]">
                            <CardContent className="p-0 space-y-3">
                                <h3 className="font-semibold text-slate-900">AI Decisions</h3>
                                <div className="flex items-start gap-2 p-3  rounded-lg">
                                    <HiOutlineSparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium text-slate-700 mb-1">AI SUMMARY</p>
                                        <p className="text-xs text-slate-600 leading-relaxed">{vendorData.aiDecisions.summary}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700 mb-2">Decisions</p>
                                    <ul className="space-y-1">
                                        {vendorData.aiDecisions.details.map((item, idx) => (
                                            <li key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                                                <span className="h-1 w-1 bg-slate-400 rounded-full"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Profile Cards */}
                    <div className="space-y-4">
                        {/* Vendor Profile */}
                        <Card className="p-4">
                            <CardContent className="p-0 space-y-4">
                                <h3 className="font-semibold text-slate-900">Vendor Profile</h3>
                                <div className="flex items-center gap-3">
                                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                                        <Image
                                            src={vendorData.vendorProfile.avatar}
                                            alt={vendorData.vendorProfile.name}
                                            fill
                                            sizes="48px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{vendorData.vendorProfile.name}</p>
                                        <p className="text-xs text-slate-500">{vendorData.vendorProfile.role}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <MdOutlineEmail className="h-4 w-4 text-slate-400" />
                                        <span className="truncate">{vendorData.vendorProfile.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <MdOutlinePhone className="h-4 w-4 text-slate-400" />
                                        <span>{vendorData.vendorProfile.phone}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Person */}
                        <Card className="p-4">
                            <CardContent className="p-0 space-y-4">
                                <h3 className="font-semibold text-slate-900">Contact Person</h3>
                                <div className="flex items-center gap-3">
                                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                                        <Image
                                            src={vendorData.contactPerson.avatar}
                                            alt={vendorData.contactPerson.name}
                                            fill
                                            sizes="48px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{vendorData.contactPerson.name}</p>
                                        <p className="text-xs text-slate-500">{vendorData.contactPerson.role}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <MdOutlineEmail className="h-4 w-4 text-slate-400" />
                                        <span className="truncate">{vendorData.contactPerson.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <MdOutlinePhone className="h-4 w-4 text-slate-400" />
                                        <span>{vendorData.contactPerson.phone}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Performance History and SLA Documents */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance History */}
                <div className="lg:col-span-2">
                    <Card className="p-6">
                        <CardContent className="p-0">
                            <h3 className="font-semibold text-slate-900 mb-4">Performance History</h3>
                            <div className="flex items-end gap-4 mb-6">
                                <span className="text-4xl font-bold text-slate-900">{vendorData.performanceHistory.percentage}%</span>
                                <span className="text-sm text-green-500 font-medium pb-1">{vendorData.performanceHistory.trend}</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-4">Last 30 Days</p>

                            {/* Recharts Area Chart */}
                            <div className="w-full h-64 sm:h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={vendorData.performanceHistory.chartData}
                                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#6051E2" stopOpacity={0.3} />
                                                <stop offset="100%" stopColor="#6051E2" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis
                                            dataKey="month"
                                            stroke="#94a3b8"
                                            style={{ fontSize: "12px" }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            stroke="#94a3b8"
                                            style={{ fontSize: "12px" }}
                                            tickLine={false}
                                            domain={[0, 50]}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#fff",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "8px",
                                                padding: "8px 12px",
                                            }}
                                            labelStyle={{ color: "#64748b", fontSize: "12px" }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#6051E2"
                                            strokeWidth={2}
                                            fill="url(#performanceGradient)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* SLA Documents */}
                <Card className="p-4">
                    <CardContent className="p-0 space-y-4">
                        <h3 className="font-semibold text-slate-900">SLA Documents</h3>
                        <div className="space-y-3">
                            {vendorData.slaDocuments.map((doc, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-red-500">📄</span>
                                        <span className="text-sm text-slate-700 truncate">{doc.name}</span>
                                    </div>
                                    <button className="text-slate-400 hover:text-primary transition cursor-pointer flex-shrink-0">
                                        <FiDownload className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Associated Projects */}
            <Card className="p-6">
                <CardContent className="p-0">
                    <h3 className="font-semibold text-slate-900 mb-4">Associated Projects</h3>
                    <div className="space-y-3">
                        {vendorData.associatedProjects.map((project, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-slate-900">{project.name}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        {getStatusIcon(project.status)}
                                        <span className={`text-xs font-medium ${project.status === "In Progress" ? "text-yellow-600" :
                                            project.status === "Completed" ? "text-green-600" :
                                                "text-red-600"
                                            }`}>
                                            Status: {project.status}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Communication Logs */}
            <Card className="p-6">
                <CardContent className="p-0">
                    <h3 className="font-semibold text-slate-900 mb-4">Communication Logs</h3>
                    <div className="space-y-4">
                        {vendorData.communicationLogs.map((log, idx) => (
                            <div key={idx} className="flex items-start gap-4">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${log.type === "email" ? "bg-green-100" : "bg-blue-100"
                                    }`}>
                                    {log.type === "email" ? (
                                        <MdOutlineEmail className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <MdOutlinePhone className="h-5 w-5 text-blue-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{log.title}</p>
                                    <p className="text-xs text-slate-500 mt-1">{log.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
