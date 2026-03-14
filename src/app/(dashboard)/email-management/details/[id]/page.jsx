"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FiPrinter, FiTrash2, FiStar, FiArrowLeft, FiMail } from "react-icons/fi";
import { FaLinkedin } from "react-icons/fa";
import { CiSquareCheck } from "react-icons/ci";
import { FiAlertTriangle } from "react-icons/fi";
import { FiFile } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/Loading/Loading";
import { apiGet } from "@/lib/api";

const EMPTY_AI_EXTRACTED = {
    tasks: [],
    risks: [],
    decisions: [],
    sentiment: "N/A",
};

const formatDateTime = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
};

export default function EmailDetails() {
    const params = useParams();
    const router = useRouter();
    const [isStarred, setIsStarred] = useState(false);
    const [category, setCategory] = useState("");

    useEffect(() => {
        if (typeof window === "undefined") return;
        const searchParams = new URLSearchParams(window.location.search);
        setCategory(searchParams.get("category") || "");
    }, []);

    const emailId = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const { data: emailResponse, isLoading, error } = useQuery({
        queryKey: ["unified-email", emailId, category],
        queryFn: () =>
            apiGet(`/api/project-manager/outlook/unified/${emailId}`, {
                params: category ? { category } : undefined,
            }),
        enabled: Boolean(emailId),
    });

    const emailData = emailResponse?.data || null;
    const aiExtracted = useMemo(
        () => emailData?.aiExtracted || EMPTY_AI_EXTRACTED,
        [emailData]
    );

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

    if (isLoading) {
        return <Loading />;
    }
console.log(emailData);
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

            </div>

            {error ? (
                <Card>
                    <CardContent className="p-8 text-center text-slate-500">
                        <p className="text-lg font-medium">Failed to load email</p>
                        <p className="text-sm mt-2">{error.message || "Please try again later."}</p>
                    </CardContent>
                </Card>
            ) : !emailData ? (
                <Card>
                    <CardContent className="p-8 text-center text-slate-500">
                        <p className="text-lg font-medium">Email not found</p>
                    </CardContent>
                </Card>
            ) : (
                <>

            {/* Email Document Section */}
            <Card>
                <CardContent className="p-6 sm:p-8">
                    {/* Header with Title and Action Icons */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex-1">
                            {emailData.subject || "Untitled email"}
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
                            <Button onClick={() => router.push("/email-management/generate-email")} className="bg-[#6051E2] hover:bg-[#4a3db8] text-white px-6 py-3 text-sm sm:text-base font-semibold cursor-pointer">
                                <FiMail className="h-4 w-4" /> Draft Email
                            </Button>
                        </div>
                    </div>

                    {/* Sender Information */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaLinkedin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm sm:text-base font-semibold text-slate-900">
                                {emailData.senderEmail || "Unknown sender"}
                            </p>
                            <p className="text-xs sm:text-sm text-slate-600">
                                To: {emailData.receiverEmail || "Unknown receiver"}
                            </p>
                        </div>
                    </div>

                    {/* Email Content */}
                    <div className="space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
                        <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-slate-500">
                            {emailData.type ? <span>Source: {emailData.type}</span> : null}
                            {emailData.category ? <span>Category: {emailData.category}</span> : null}
                            {formatDateTime(emailData.receivedAt || emailData.createdAt) ? (
                                <span>
                                    Received: {formatDateTime(emailData.receivedAt || emailData.createdAt)}
                                </span>
                            ) : null}
                        </div>

                        <div className="whitespace-pre-line break-words">
                            {emailData.body || "No email body available."}
                        </div>
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
                                        Tasks ({emailData?.tasks?.length})
                                    </h3>
                                </div>
                                <ul className="space-y-2 ml-2">
                                    {emailData?.tasks?.map((task, index) => (
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
                                        Decisions ({emailData?.decisions && emailData?.decisions?.length > 0 ? emailData?.decisions?.length : 0})
                                    </h3>
                                </div>
                                <ul className="space-y-2 ml-2">
                                    { emailData?.decisions && emailData?.decisions?.length > 0 && emailData?.decisions?.map((decision, index) => (
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
                                {emailData.sentiment}
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
                                        Risks ({emailData?.risks && emailData?.risks?.length > 0 ? emailData?.risks?.length : 0})
                                    </h3>
                                </div>
                                <ul className="space-y-2 ml-2">
                                    {emailData?.risks && emailData?.risks?.length > 0 && emailData?.risks?.map((risk, index) => (
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
                </>
            )}
        </div>
    );
}
