"use client";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FiPrinter, FiTrash2, FiStar, FiArrowLeft, FiMail } from "react-icons/fi";
import { FaLinkedin } from "react-icons/fa";
import { CiSquareCheck } from "react-icons/ci";
import { FiAlertTriangle } from "react-icons/fi";
import { FiFile } from "react-icons/fi";
import { useState } from "react";
import { toast } from "react-hot-toast";

// Dummy email data - in real app, fetch based on id
const emailData = {
    id: "1",
    title: "Cloud Infrastructure Migration - Weekly Update",
    sender: {
        name: "Sarah Chen",
        email: "sarah.chen@company.com",
    },
    content: {
        greeting: "Hi team,",
        introduction: "Here is the weekly update for the Cloud Infrastructure Migration project:",
        progress: [
            "Database migration phase 1 completed successfully",
            "45 out of 60 tasks completed (75%)",
            "All critical milestones on track",
        ],
        actionItems: [
            "Complete database migration testing by Dec 12",
            "Review security audit findings by end of week",
            "Schedule stakeholder review meeting for Dec 15",
        ],
        risksAndIssues: [
            "Potential delay in third-party API integration due to vendor capacity",
            "Mitigation: We have identified an alternative provider as backup",
        ],
        decisionsMade: [
            "Approved budget increase of $50K for additional testing resources",
            "Moving security testing phase forward by one week",
        ],
        sentiment: "Team morale is high and we are confident in meeting our Jan 15 deadline.",
        closing: "Best regards,\nSarah Chen",
    },
    aiExtracted: {
        tasks: [
            "Complete database migration testing by Dec 12",
            "Review security audit findings",
        ],
        risks: ["Potential delay in third-party API integration"],
        decisions: ["Approved budget increase of $50K for additional testing resources"],
        sentiment: "Positive",
    },
};

export default function EmailDetails() {
    const params = useParams();
    const router = useRouter();
    const [isStarred, setIsStarred] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleDelete = () => {
        // Handle delete logic
        router.back();
    };

    const handleRaidToProject = () => {
        // Handle RAIDD to Project logic
        toast.success("Email RAIDD to Project successfully");
        router.push("/raidd");
    };

    return (
        <div className="space-y-6 ">
            {/* Back Button */}
            <div className="flex justify-between items-center gap-2">
                <button
                    onClick={() => router.back()}
                    className="text-blue-600 cursor-pointer hover:underline flex items-center gap-2"
                >
                    <FiArrowLeft className="h-4 w-4" /> Go Back
                </button>
                <Button onClick={() => router.push("/email-management/generate-email")} className="bg-[#6051E2] hover:bg-[#4a3db8] text-white px-6 py-3 text-sm sm:text-base font-semibold cursor-pointer">
                   <FiMail className="h-4 w-4" /> Generate Email
                </Button>
            </div>

            {/* Email Document Section */}
            <Card>
                <CardContent className="p-6 sm:p-8">
                    {/* Header with Title and Action Icons */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex-1">
                            {emailData.title}
                        </h1>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handlePrint}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Print"
                            >
                                <FiPrinter className="h-5 w-5 text-slate-600" />
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Delete"
                            >
                                <FiTrash2 className="h-5 w-5 text-slate-600" />
                            </button>
                            <button
                                onClick={() => setIsStarred(!isStarred)}
                                className={`p-2 rounded-lg transition-colors cursor-pointer ${isStarred
                                        ? "bg-yellow-50 text-yellow-500"
                                        : "hover:bg-slate-100 text-slate-600"
                                    }`}
                                title="Star"
                            >
                                <FiStar
                                    className={`h-5 w-5 ${isStarred ? "fill-current" : ""}`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Sender Information */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaLinkedin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm sm:text-base font-semibold text-slate-900">
                                {emailData.sender.name}
                            </p>
                            <p className="text-xs sm:text-sm text-slate-600">
                                {emailData.sender.email}
                            </p>
                        </div>
                    </div>

                    {/* Email Content */}
                    <div className="space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
                        {/* Greeting */}
                        <p>{emailData.content.greeting}</p>

                        {/* Introduction */}
                        <p>{emailData.content.introduction}</p>

                        {/* Progress */}
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-2">Progress:</h3>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                {emailData.content.progress.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Action Items */}
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-2">Action Items:</h3>
                            <ol className="list-decimal list-inside space-y-1 ml-2">
                                {emailData.content.actionItems.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ol>
                        </div>

                        {/* Risks & Issues */}
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-2">Risks & Issues:</h3>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                {emailData.content.risksAndIssues.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Decisions Made */}
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-2">Decisions Made:</h3>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                {emailData.content.decisionsMade.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Overall Sentiment */}
                        <p>{emailData.content.sentiment}</p>

                        {/* Closing */}
                        <div className="whitespace-pre-line">{emailData.content.closing}</div>
                    </div>
                </CardContent>
            </Card>

            {/* AI Extracted Information Section */}
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
                    AI Extracted Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Left Column */}
                    <div className="space-y-4 sm:space-y-6">
                        {/* Tasks Card */}
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <CiSquareCheck className="h-6 w-6 text-green-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        Tasks ({emailData.aiExtracted.tasks.length})
                                    </h3>
                                </div>
                                <ul className="space-y-2 ml-2">
                                    {emailData.aiExtracted.tasks.map((task, index) => (
                                        <li
                                            key={index}
                                            className="text-sm sm:text-base text-slate-700 flex items-start gap-2"
                                        >
                                            <span className="text-slate-400 mt-1">•</span>
                                            <span>{task}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Decisions Card */}
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FiFile className="h-6 w-6 text-blue-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        Decisions ({emailData.aiExtracted.decisions.length})
                                    </h3>
                                </div>
                                <ul className="space-y-2 ml-2">
                                    {emailData.aiExtracted.decisions.map((decision, index) => (
                                        <li
                                            key={index}
                                            className="text-sm sm:text-base text-slate-700 flex items-start gap-2"
                                        >
                                            <span className="text-slate-400 mt-1">•</span>
                                            <span>{decision}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Sentiment */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm sm:text-base font-medium text-slate-700">
                                Sentiment:
                            </span>
                            <span className="px-4 py-2 bg-green-100 rounded-full text-green-800 text-sm sm:text-base font-semibold">
                                {emailData.aiExtracted.sentiment}
                            </span>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div>
                        {/* Risks Card */}
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FiAlertTriangle className="h-6 w-6 text-yellow-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        Risks ({emailData.aiExtracted.risks.length})
                                    </h3>
                                </div>
                                <ul className="space-y-2 ml-2">
                                    {emailData.aiExtracted.risks.map((risk, index) => (
                                        <li
                                            key={index}
                                            className="text-sm sm:text-base text-slate-700 flex items-start gap-2"
                                        >
                                            <span className="text-slate-400 mt-1">•</span>
                                            <span>{risk}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* RAIDD to Project Button */}
                <div className="flex justify-end mt-6">
                    <Button
                        onClick={handleRaidToProject}
                        className="bg-[#6051E2] hover:bg-[#4a3db8] text-white px-6 py-3 text-sm sm:text-base font-semibold cursor-pointer"
                    >
                        RAIDD to Project
                    </Button>
                </div>
            </div>
        </div>
    );
}
