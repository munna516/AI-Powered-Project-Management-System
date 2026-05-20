"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import { FiArrowLeft } from "react-icons/fi";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import Loading from "@/components/Loading/Loading";

/** Normalize points from API: either top-level arrays or rawAiResponse.{keyPoints|actionPoints}.create with { content } */
function normalizeSummaryPoints(rawCreate, defaultStatus) {
    if (!Array.isArray(rawCreate) || rawCreate.length === 0) return null;
    return rawCreate.map((p) => {
        if (typeof p === "object" && p !== null) {
            const text = p.content ?? p.text ?? "";
            return { text: String(text), status: p.status ?? defaultStatus };
        }
        return { text: String(p), status: defaultStatus };
    });
}

export default function MeetingSummary() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    
    const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const meetingId = searchParams.get("meetingId");
    const documentId = searchParams.get("documentId");

    const {
        data: projectResponse,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["project-details-summary", projectId],
        enabled: Boolean(projectId),
        queryFn: () => apiGet(`/api/project-manager/project-management/${projectId}`),
    });

    const itemData = useMemo(() => {
        const rawProject =
            projectResponse?.data?.data ||
            projectResponse?.data ||
            null;
        
        if (!rawProject) return null;
        
        if (documentId && rawProject.documents) {
            const doc = rawProject.documents.find((d) => d.id === documentId);
            if (doc) {
                const raw = doc.rawAiResponse;
                const keyFromRaw = normalizeSummaryPoints(raw?.keyPoints?.create, "validated");
                const actionFromRaw = normalizeSummaryPoints(raw?.actionPoints?.create, "pending");
                const keyPoints =
                    keyFromRaw ?? (Array.isArray(doc.keyPoints) ? doc.keyPoints : []);
                const actionPoints =
                    actionFromRaw ?? (Array.isArray(doc.actionPoints) ? doc.actionPoints : []);
                const summaryFromRaw =
                    typeof raw?.aiDocumentSummary === "string" ? raw.aiDocumentSummary : null;
                const summaryTop = Array.isArray(doc.aiDocumentSummary)
                    ? doc.aiDocumentSummary.join(" ")
                    : doc.aiDocumentSummary;
                return {
                    type: "Document",
                    topic: doc.title || doc.fileName || "N/A",
                    summary:
                        summaryFromRaw ||
                        summaryTop ||
                        "No summary available.",
                    keyPoints,
                    actionPoints,
                };
            }
        } else if (meetingId && rawProject.meetings) {
            const meeting = rawProject.meetings.find((m) => m.id === meetingId);
            if (meeting) {
                return {
                    type: "Meeting",
                    topic: meeting.title || "N/A",
                    summary: Array.isArray(meeting.aiMeetingSummary) ? meeting.aiMeetingSummary.join(" ") : meeting.aiMeetingSummary || "No summary available.",
                    keyPoints: meeting.keyPoints || [],
                    actionPoints: meeting.actionPoints || []
                };
            }
        }
        return null;
    }, [projectResponse, documentId, meetingId]);

    if (isLoading) {
        return <Loading />;
    }

    if (isError || (!isLoading && !itemData)) {
        return (
            <div className="space-y-6">
                <button onClick={() => router.back()} className="text-blue-600 cursor-pointer hover:underline flex items-center gap-2"> <FiArrowLeft className="h-4 w-4" /> Go Back</button>
                <Card>
                    <CardContent className="p-6 text-center text-slate-500">
                        {error?.message || "Data not found."}
                    </CardContent>
                </Card>
            </div>
        );
    }

    const typeLabel = itemData.type;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <button onClick={() => router.back()} className="text-blue-600 cursor-pointer hover:underline flex items-center gap-2"> <FiArrowLeft className="h-4 w-4" /> Go Back</button>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                AI {typeLabel} Summary
            </h1>

            {/* Topics Section */}
            <Card className="bg-[#6051E2]/10 border-[#6051E2]/20">
                <CardContent className="p-6 sm:p-8">
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4">
                        {typeLabel} Topics: {itemData.topic}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                        {itemData.summary}
                    </p>
                </CardContent>
            </Card>

            {/* Key Points and Action Points Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Key Point Section */}
                <div className="space-y-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                        Key Point
                    </h2>
                    <Card className="shadow-md">
                        <CardContent className="p-6">
                            {itemData.keyPoints.length > 0 ? (
                                <ol className="space-y-4">
                                    {itemData.keyPoints.map((point, index) => {
                                        const text = typeof point === 'object' ? point.text : point;
                                        const status = typeof point === 'object' ? point.status : "validated";
                                        return (
                                            <li
                                                key={index}
                                                className="flex items-start gap-3"
                                            >
                                                <span className="text-slate-600 font-medium mt-0.5">
                                                    {index + 1}.
                                                </span>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {status === "validated" ? (
                                                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                        ) : (
                                                            <Circle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                                                        )}
                                                        <span
                                                            className={`text-xs font-medium px-2 py-1 rounded ${status === "validated"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                                }`}
                                                        >
                                                            {status === "validated"
                                                                ? "Validated"
                                                                : "To be Validated"}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-700">
                                                        {text}
                                                    </p>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ol>
                            ) : (
                                <p className="text-sm text-slate-500">No key points available.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Action Points Section */}
                <div className="space-y-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                        Action Points
                    </h2>
                    <Card className="shadow-md">
                        <CardContent className="p-6">
                            {itemData.actionPoints.length > 0 ? (
                                <ol className="space-y-4">
                                    {itemData.actionPoints.map((point, index) => {
                                        const text = typeof point === 'object' ? point.text : point;
                                        const status = typeof point === 'object' ? point.status : "pending";
                                        return (
                                            <li
                                                key={index}
                                                className="flex items-start gap-3"
                                            >
                                                <span className="text-slate-600 font-medium mt-0.5">
                                                    {index + 1}.
                                                </span>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {status === "completed" ? (
                                                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                        ) : (
                                                            <Circle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                        )}
                                                        <span
                                                            className={`text-xs font-medium px-2 py-1 rounded ${status === "completed"
                                                                ? "bg-green-100 text-green-800"
                                                                : status === "in_progress"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : "bg-yellow-100 text-yellow-800"
                                                                }`}
                                                        >
                                                            {status === "completed"
                                                                ? "Completed"
                                                                : status === "in_progress"
                                                                    ? "In Progress"
                                                                    : "Pending"}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-700">
                                                        {text}
                                                    </p>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ol>
                            ) : (
                                <p className="text-sm text-slate-500">No action points available.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
