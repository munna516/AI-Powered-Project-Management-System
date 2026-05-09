"use client";
import { Card, CardContent } from "@/components/ui/card";
import { FiArrowLeft } from "react-icons/fi";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import Loading from "@/components/Loading/Loading";

const fallback = "Not available";

const normalizeMeeting = (raw) => {
    const detail = raw?.data?.data || raw?.data || raw || {};

    const participantsRaw =
        detail?.participants ?? detail?.attendees ?? detail?.invitees ?? [];
    const participants =
        Array.isArray(participantsRaw)
            ? participantsRaw.map((p) => (p ? String(p) : "")).filter(Boolean)
            : [];

    const normalizeTextList = (v) =>
        Array.isArray(v)
            ? v
                .map((x) => {
                    if (x == null) return "";
                    if (typeof x === "string") return x;
                    if (typeof x === "object" && typeof x.text === "string") return x.text;
                    return "";
                })
                .filter(Boolean)
            : [];

    const meetingDateValue = detail?.meetingDate ?? detail?.createdAt ?? detail?.date ?? "";
    const meetingDate = meetingDateValue ? new Date(meetingDateValue) : null;
    const date = meetingDate && !Number.isNaN(meetingDate.getTime())
        ? meetingDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : fallback;
    const time = meetingDate && !Number.isNaN(meetingDate.getTime())
        ? meetingDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true })
        : fallback;

    // API shape from your payload:
    // agenda: { meetingTopics: string[], coreDiscussionPoints: string[] }
    const agenda = normalizeTextList(detail?.agenda?.meetingTopics);

    const discussionSummary = normalizeTextList(detail?.agenda?.coreDiscussionPoints).map((text) => ({
        topic: "",
        text,
    }));

    // keyPoints: [{ content: string, ... }]
    const decisions = Array.isArray(detail?.keyPoints)
        ? detail.keyPoints.map((kp) => kp?.content).filter(Boolean)
        : [];

    // actionPoints: [{ content: string, status: string, ... }]
    const actionItems = Array.isArray(detail?.actionPoints)
        ? detail.actionPoints.map((ap) => ({
            task: ap?.content ?? ap?.task ?? "",
            owner: ap?.status ?? "",
            dueDate: "",
        }))
        : [];

    // notes: string
    const notes = typeof detail?.notes === "string" && detail.notes.trim()
        ? [detail.notes]
        : normalizeTextList(detail?.notes ?? detail?.meetingNotes);

    return {
        title: detail?.title ?? detail?.subject ?? detail?.name ?? "Meeting Notes",
        date,
        time,
        organizer: detail?.organizer ?? detail?.organizerName ?? detail?.host ?? fallback,
        participants,
        agenda,
        discussionSummary,
        decisions,
        actionItems,
        notes,
        recordingLink:
            detail?.recordingLink ??
            detail?.meetingRecordingLink ??
            detail?.recording_url ??
            detail?.videoPlayUrl ??
            detail?.link ??
            detail?.url ??
            "",
    };
};

export default function MeetingSummary() {
    return (
        <Suspense fallback={<Loading />}>
            <MeetingSummaryInner />
        </Suspense>
    );
}

function MeetingSummaryInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const meetingId = searchParams.get("id") || params?.id;

    const {
        data: meetingResponse,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["meeting-details", meetingId],
        enabled: Boolean(meetingId),
        queryFn: () => apiGet(`/api/project-manager/project-meeting/${meetingId}`),
    });

    const meetingData = useMemo(() => normalizeMeeting(meetingResponse), [meetingResponse]);

    if (isLoading) return <Loading />;
    if (isError || !meetingId) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-sm text-slate-500 sm:text-base">
                    {error?.message || "Failed to load meeting details."}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6 ">
            {/* Back Button */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => router.back()}
                    className="text-blue-600 cursor-pointer hover:underline flex items-center gap-2"
                >
                    <FiArrowLeft className="h-4 w-4" /> Go Back
                </button>
            </div>

            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                    🚀 Meeting Notes
                </h1>
                <p className="text-lg sm:text-xl text-slate-700">
                    Meeting Title: {meetingData.title || fallback}
                </p>
            </div>

            {/* Meeting Details */}
            <Card>
                <CardContent className="p-6 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                        <div>
                            <span className="text-slate-600 font-medium">Date:</span>{" "}
                            <span className="text-slate-900">{meetingData.date || fallback}</span>
                        </div>
                        <div>
                            <span className="text-slate-600 font-medium">Time:</span>{" "}
                            <span className="text-slate-900">{meetingData.time || fallback}</span>
                        </div>
                        <div>
                            <span className="text-slate-600 font-medium">Organizer:</span>{" "}
                            <span className="text-slate-900">{meetingData.organizer || fallback}</span>
                        </div>
                        <div>
                            <span className="text-slate-600 font-medium">Participants:</span>{" "}
                            <span className="text-slate-900">
                                {meetingData.participants?.length ? meetingData.participants.join(", ") : fallback}
                            </span>
                        </div>
                    </div>

                    {meetingData.recordingLink ? (
                        <div className="pt-3">
                            <span className="text-slate-600 font-medium">Recording:</span>{" "}
                            <a
                                href={meetingData.recordingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#6051E2] hover:underline break-all"
                            >
                                Click to view
                            </a>
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            {/* Agenda */}
            <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    📋 Agenda
                </h2>
                <Card>
                    <CardContent className="p-6">
                        {meetingData.agenda?.length ? (
                            <ul className="space-y-2">
                                {meetingData.agenda.map((item, index) => (
                                    <li key={index} className="text-slate-700 flex items-start gap-2">
                                        <span className="text-slate-400 mt-1">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500">No agenda found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Discussion Summary */}
            <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    💬 Discussion Summary
                </h2>
                <Card>
                    <CardContent className="p-6">
                        {meetingData.discussionSummary?.length ? (
                            <ul className="space-y-4">
                                {meetingData.discussionSummary.map((item, index) => (
                                    <li key={index} className="text-slate-700">
                                        <div className="flex items-start gap-2">
                                            <span className="text-slate-400 mt-1">•</span>
                                            <div className="flex-1">
                                                {item.topic ? (
                                                    <span className="font-semibold text-slate-900">
                                                        {item.topic}:
                                                    </span>
                                                ) : null}{" "}
                                                <span>{item.text || fallback}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500">No discussion summary found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Decisions Made */}
            <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    ✅ Decisions Made
                </h2>
                <Card>
                    <CardContent className="p-6">
                        {meetingData.decisions?.length ? (
                            <ul className="space-y-2">
                                {meetingData.decisions.map((item, index) => (
                                    <li key={index} className="text-slate-700 flex items-start gap-2">
                                        <span className="text-slate-400 mt-1">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500">No decisions found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Action Items */}
            <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    📄 Action Items
                </h2>
                <Card>
                    <CardContent className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">
                                            Task
                                        </th>
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">
                                            Owner
                                        </th>
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">
                                            Due Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {meetingData.actionItems?.length ? (
                                        meetingData.actionItems.map((item, index) => (
                                            <tr
                                                key={index}
                                                className="border-b border-slate-100 last:border-b-0"
                                            >
                                                <td className="py-3 px-3 text-slate-700">
                                                    {item.task || fallback}
                                                </td>
                                                <td className="py-3 px-3 text-slate-700">
                                                    {item.owner || fallback}
                                                </td>
                                                <td className="py-3 px-3 text-slate-700">
                                                    {item.dueDate || fallback}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="py-5 px-3 text-center text-sm text-slate-500"
                                            >
                                                No action items found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Notes */}
            <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    📎 Notes
                </h2>
                <Card>
                    <CardContent className="p-6">
                        {meetingData.notes?.length ? (
                            <ul className="space-y-2">
                                {meetingData.notes.map((item, index) => (
                                    <li key={index} className="text-slate-700 flex items-start gap-2">
                                        <span className="text-slate-400 mt-1">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500">No notes found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
