"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import { FiArrowLeft } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/Loading/Loading";
import { apiGet } from "@/lib/api";

const formatDateTime = (value) => {
    if (!value) return "N/A";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const normalizeMeetingPayload = (response) =>
    response?.data?.data ?? response?.data ?? null;

const formatKeyPointStatus = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "VALIDATED" || s === "APPROVED") return { label: "Validated", tone: "validated" };
    return { label: "To be validated", tone: "pending" };
};

const formatActionStatus = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "COMPLETED" || s === "DONE") return { label: "Completed", tone: "completed" };
    if (s === "IN_PROGRESS" || s === "IN PROGRESS") return { label: "In progress", tone: "in_progress" };
    return { label: "Pending", tone: "pending" };
};

export default function MeetingSummary() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const meetingId = searchParams.get("meetingId");
    const documentId = searchParams.get("documentId");

    const isMeetingView = Boolean(meetingId) && !documentId;

    const {
        data: meetingResponse,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["project-meeting-detail", meetingId],
        enabled: Boolean(meetingId),
        queryFn: () => apiGet(`/api/project-manager/project-meeting/${meetingId}`),
    });

    const meeting = useMemo(() => {
        if (!meetingId) return null;
        return normalizeMeetingPayload(meetingResponse);
    }, [meetingId, meetingResponse]);

    if (!meetingId && !documentId) {
        return (
            <div className="space-y-6">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex cursor-pointer items-center gap-2 text-blue-600 hover:underline"
                >
                    <FiArrowLeft className="h-4 w-4" /> Go Back
                </button>
                <p className="text-sm text-slate-600">No meeting or document selected.</p>
            </div>
        );
    }

    if (documentId && !meetingId) {
        return (
            <div className="space-y-6">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex cursor-pointer items-center gap-2 text-blue-600 hover:underline"
                >
                    <FiArrowLeft className="h-4 w-4" /> Go Back
                </button>
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">AI Document Summary</h1>
                <p className="text-sm text-slate-600">Document detail is not loaded here yet.</p>
            </div>
        );
    }

    if (meetingId && isLoading) {
        return <Loading />;
    }

    if (meetingId && (isError || !meeting)) {
        return (
            <div className="space-y-6">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex cursor-pointer items-center gap-2 text-blue-600 hover:underline"
                >
                    <FiArrowLeft className="h-4 w-4" /> Go Back
                </button>
                <Card>
                    <CardContent className="p-6 text-center text-sm text-slate-600">
                        {error?.message || "Failed to load meeting."}
                    </CardContent>
                </Card>
            </div>
        );
    }

    const title = meeting?.title || "Meeting";
    const lastSummary = meeting?.lastMeetingSummary || "";
    const projectSummary = meeting?.projectSummary;
    const notes = meeting?.notes || "";
    const agenda = meeting?.agenda || {};
    const meetingTopics = Array.isArray(agenda?.meetingTopics) ? agenda.meetingTopics : [];
    const coreDiscussionPoints = Array.isArray(agenda?.coreDiscussionPoints)
        ? agenda.coreDiscussionPoints
        : [];
    const keyPoints = Array.isArray(meeting?.keyPoints) ? meeting.keyPoints : [];
    const actionPoints = Array.isArray(meeting?.actionPoints) ? meeting.actionPoints : [];

    return (
        <div className="space-y-6">
            <div className="mb-2 flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex cursor-pointer items-center gap-2 text-blue-600 hover:underline"
                >
                    <FiArrowLeft className="h-4 w-4" /> Go Back
                </button>
            </div>

            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                AI {isMeetingView ? "Meeting" : "Document"} Summary
            </h1>

            <Card className="border-[#6051E2]/20 bg-[#6051E2]/10">
                <CardContent className="p-6 sm:p-8">
                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                        <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                            {isMeetingView ? "Meeting" : "Document"}: {title}
                        </h2>
                        {meeting?.meetingDate ? (
                            <p className="text-sm text-slate-500">{formatDateTime(meeting.meetingDate)}</p>
                        ) : null}
                    </div>

                    {projectSummary ? (
                        <div className="mb-4">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Project summary
                            </p>
                            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 sm:text-base">
                                {projectSummary}
                            </p>
                        </div>
                    ) : null}

                    {lastSummary ? (
                        <div className="mb-4">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Last meeting summary
                            </p>
                            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 sm:text-base">
                                {lastSummary}
                            </p>
                        </div>
                    ) : null}

                    {notes ? (
                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Notes
                            </p>
                            <p className="text-sm leading-relaxed text-slate-700 sm:text-base">{notes}</p>
                        </div>
                    ) : null}

                    {!lastSummary && !projectSummary && !notes ? (
                        <p className="text-sm text-slate-600">No summary text available yet.</p>
                    ) : null}
                </CardContent>
            </Card>

            {(meetingTopics.length > 0 || coreDiscussionPoints.length > 0) && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {meetingTopics.length > 0 ? (
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="mb-3 text-base font-semibold text-slate-900">Agenda — topics</h3>
                                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
                                    {meetingTopics.map((t, i) => (
                                        <li key={`topic-${i}`}>{t}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ) : null}
                    {coreDiscussionPoints.length > 0 ? (
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="mb-3 text-base font-semibold text-slate-900">
                                    Core discussion points
                                </h3>
                                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
                                    {coreDiscussionPoints.map((t, i) => (
                                        <li key={`core-${i}`}>{t}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ) : null}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Key points</h2>
                    <Card className="shadow-md">
                        <CardContent className="p-6">
                            {keyPoints.length > 0 ? (
                                <ol className="space-y-4">
                                    {keyPoints.map((point, index) => {
                                        const meta = formatKeyPointStatus(point?.status);
                                        const isVal = meta.tone === "validated";
                                        return (
                                            <li key={point?.id || index} className="flex items-start gap-3">
                                                <span className="mt-0.5 font-medium text-slate-600">
                                                    {index + 1}.
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-1 flex flex-wrap items-center gap-2">
                                                        {isVal ? (
                                                            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
                                                        ) : (
                                                            <Circle className="h-4 w-4 flex-shrink-0 text-amber-600" />
                                                        )}
                                                        <span
                                                            className={`rounded px-2 py-0.5 text-xs font-medium ${
                                                                isVal
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-amber-100 text-amber-800"
                                                            }`}
                                                        >
                                                            {meta.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-700">
                                                        {point?.content || "—"}
                                                    </p>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ol>
                            ) : (
                                <p className="text-sm text-slate-500">No key points recorded.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Action points</h2>
                    <Card className="shadow-md">
                        <CardContent className="p-6">
                            {actionPoints.length > 0 ? (
                                <ol className="space-y-4">
                                    {actionPoints.map((point, index) => {
                                        const meta = formatActionStatus(point?.status);
                                        const tone = meta.tone;
                                        return (
                                            <li key={point?.id || index} className="flex items-start gap-3">
                                                <span className="mt-0.5 font-medium text-slate-600">
                                                    {index + 1}.
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-1 flex flex-wrap items-center gap-2">
                                                        {tone === "completed" ? (
                                                            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
                                                        ) : (
                                                            <Circle className="h-4 w-4 flex-shrink-0 text-blue-600" />
                                                        )}
                                                        <span
                                                            className={`rounded px-2 py-0.5 text-xs font-medium ${
                                                                tone === "completed"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : tone === "in_progress"
                                                                      ? "bg-blue-100 text-blue-800"
                                                                      : "bg-amber-100 text-amber-800"
                                                            }`}
                                                        >
                                                            {meta.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-700">
                                                        {point?.content || "—"}
                                                    </p>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ol>
                            ) : (
                                <p className="text-sm text-slate-500">No action points recorded.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
