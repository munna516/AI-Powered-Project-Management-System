"use client";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { FiArrowLeft, FiFlag, FiAtSign, FiAlertTriangle } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { MdOutlineEmail } from "react-icons/md";
import { BsGear } from "react-icons/bs";

// Dummy RAIDD data
const raiddData = {
    id: 1,
    aiRisk: {
        summary: "AI analyzed meetings, emails and docs and identified potential delivery risks. Timeline may be affected if delays occur.",
        details: [
            "Content delivery delay",
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
    raisedBy: {
        name: "Sara Akter",
        email: "sara@gmail.com",
        role: "project manager",
        avatar: "https://cdn.pixabay.com/photo/2024/09/23/10/39/man-9068618_640.jpg"
    },
    identifyBy: {
        name: "Automated system monitor",
        email: "sara@gmail.com",
        role: "system bot",
        isSystem: true
    },
    escalatedTo: {
        name: "Maya Moni",
        email: "sara@gmail.com",
        role: "Led Manager",
        avatar: "https://media.licdn.com/dms/image/v2/D4E03AQEwpCRnQnpVag/profile-displayphoto-scale_200_200/B4EZgO_E_RHgAk-/0/1752598082646?e=2147483647&v=beta&t=NixziB5SwFlx2sJ2KDbqxVnxt6QcQGrzMMEbjwUEvbA"
    }
};

export default function ViewRAIDD() {
    const { id } = useParams();
    const router = useRouter();

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => router.push("/raidd")}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition cursor-pointer"
            >
                <FiArrowLeft className="h-4 w-4" />
                Back to RAIDD
            </button>

            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">AI summary RAIDD</h1>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Section: AI Summary Cards (2x2 Grid) */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* AI Risk */}
                    <Card className="p-4 sm:p-5 bg-[#EFEEFC]">
                        <CardContent className="p-0 space-y-3 sm:space-y-4">
                            <h3 className="font-semibold text-slate-900 text-base sm:text-lg">AI Risk</h3>
                            <div className="flex items-start gap-2 p-3  rounded-lg">
                                <HiOutlineSparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-slate-700 mb-1">AI SUMMARY</p>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                        {raiddData.aiRisk.summary}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Risk Details</p>
                                <ul className="space-y-1.5">
                                    {raiddData.aiRisk.details.map((item, idx) => (
                                        <li key={idx} className="text-xs sm:text-sm text-slate-600 flex items-center gap-2">
                                            <span className="h-1 w-1 bg-slate-400 rounded-full flex-shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Assumptions */}
                    <Card className="p-4 sm:p-5 bg-[#EFEEFC]">
                        <CardContent className="p-0 space-y-3 sm:space-y-4">
                            <h3 className="font-semibold text-slate-900 text-base sm:text-lg">AI Assumptions</h3>
                            <div className="flex items-start gap-2 p-3  rounded-lg">
                                <HiOutlineSparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-slate-700 mb-1">AI SUMMARY</p>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                        {raiddData.aiAssumptions.summary}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Assumptions</p>
                                <ul className="space-y-1.5">
                                    {raiddData.aiAssumptions.details.map((item, idx) => (
                                        <li key={idx} className="text-xs sm:text-sm text-slate-600 flex items-center gap-2">
                                            <span className="h-1 w-1 bg-slate-400 rounded-full flex-shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Dependencies */}
                    <Card className="p-4 sm:p-5 bg-[#EFEEFC]">
                        <CardContent className="p-0 space-y-3 sm:space-y-4">
                            <h3 className="font-semibold text-slate-900 text-base sm:text-lg">AI Dependencies</h3>
                            <div className="flex items-start gap-2 p-3  rounded-lg">
                                <HiOutlineSparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-slate-700 mb-1">AI SUMMARY</p>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                        {raiddData.aiDependencies.summary}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Dependencies</p>
                                <ul className="space-y-1.5">
                                    {raiddData.aiDependencies.details.map((item, idx) => (
                                        <li key={idx} className="text-xs sm:text-sm text-slate-600 flex items-center gap-2">
                                            <span className="h-1 w-1 bg-slate-400 rounded-full flex-shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Decisions */}
                    <Card className="p-4 sm:p-5 bg-[#EFEEFC]">
                        <CardContent className="p-0 space-y-3 sm:space-y-4">
                            <h3 className="font-semibold text-slate-900 text-base sm:text-lg">AI Decisions</h3>
                            <div className="flex items-start gap-2 p-3  rounded-lg">
                                <HiOutlineSparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-slate-700 mb-1">AI SUMMARY</p>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                        {raiddData.aiDecisions.summary}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Decisions</p>
                                <ul className="space-y-1.5">
                                    {raiddData.aiDecisions.details.map((item, idx) => (
                                        <li key={idx} className="text-xs sm:text-sm text-slate-600 flex items-center gap-2">
                                            <span className="h-1 w-1 bg-slate-400 rounded-full flex-shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Section: Responsibility Details */}
                <div className="space-y-4 sm:space-y-6">
                    <div>
                        <h2 className="text-lg md:text-xl font-semibold text-slate-900">Responsibility Details</h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">AI search intonations</p>
                    </div>

                    {/* Raised by */}
                    <Card className="p-4 sm:p-5 border border-primary/50">
                        <CardContent className="p-0 space-y-4">
                            <div className="flex items-center gap-2">
                                <FiFlag className="h-4 w-4 text-red-500" />
                                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Raised by</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden flex-shrink-0">
                                    <Image
                                        src={raiddData.raisedBy.avatar}
                                        alt={raiddData.raisedBy.name}
                                        fill
                                        sizes="48px"
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 text-sm sm:text-base truncate">
                                        {raiddData.raisedBy.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <MdOutlineEmail className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm text-slate-600 truncate">
                                            {raiddData.raisedBy.email}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium rounded-full">
                                    {raiddData.raisedBy.role}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Identify by */}
                    <Card className="p-4 sm:p-5 border border-primary/50">
                        <CardContent className="p-0 space-y-4">
                            <div className="flex items-center gap-2">
                                <FiAtSign className="h-4 w-4 text-blue-500" />
                                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Identify by</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    <BsGear className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 text-sm sm:text-base truncate">
                                        {raiddData.identifyBy.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <MdOutlineEmail className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm text-slate-600 truncate">
                                            {raiddData.identifyBy.email}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium rounded-full">
                                    {raiddData.identifyBy.role}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Escalated To */}
                    <Card className="p-4 sm:p-5 border border-primary/50">
                        <CardContent className="p-0 space-y-4">
                            <div className="flex items-center gap-2">
                                <FiAlertTriangle className="h-4 w-4 text-orange-500" />
                                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Escalated To</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden flex-shrink-0">
                                    <Image
                                        src={raiddData.escalatedTo.avatar}
                                        alt={raiddData.escalatedTo.name}
                                        fill
                                        sizes="48px"
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 text-sm sm:text-base truncate">
                                        {raiddData.escalatedTo.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <MdOutlineEmail className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm text-slate-600 truncate">
                                            {raiddData.escalatedTo.email}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium rounded-full">
                                    {raiddData.escalatedTo.role}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
