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

    const meetingDateValue = detail?.start_time ?? detail?.start?.dateTime ?? detail?.start ?? detail?.meetingDate ?? detail?.createdAt ?? detail?.date ?? "";
    const meetingDate = meetingDateValue ? new Date(meetingDateValue) : null;
    const date = meetingDate && !Number.isNaN(meetingDate.getTime())
        ? meetingDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
        : fallback;
    const time = meetingDate && !Number.isNaN(meetingDate.getTime())
        ? `${String(meetingDate.getUTCHours()).padStart(2, "0")}:${String(meetingDate.getUTCMinutes()).padStart(2, "0")}`
        : fallback;

    // API shape from your payload:
    const agenda = typeof detail?.agenda === "string" ? [detail.agenda] : normalizeTextList(detail?.agenda);
    
    const aiMeetingSummary = normalizeTextList(detail?.aiMeetingSummary);
    const lastMeetingSummary = detail?.lastMeetingSummary || "";

    const keyPoints = Array.isArray(detail?.keyPoints)
        ? detail.keyPoints.map((kp) => typeof kp === 'string' ? kp : (kp?.content || kp?.text || "")).filter(Boolean)
        : [];

    const actionItems = Array.isArray(detail?.actionPoints)
        ? detail.actionPoints.map((ap) => ({
            task: typeof ap === 'string' ? ap : (ap?.content ?? ap?.task ?? ""),
            owner: ap?.status ?? "",
            dueDate: "",
        }))
        : [];

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
        aiMeetingSummary,
        lastMeetingSummary,
        keyPoints,
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

    const isUuid = useMemo(() => {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(meetingId || "");
    }, [meetingId]);

    const {
        data: dbMeetingResponse,
        isLoading: isDbLoading,
        isError: isDbError,
        error: dbError,
    } = useQuery({
        queryKey: ["meeting-details", meetingId],
        enabled: Boolean(meetingId),
        queryFn: () => apiGet(`/api/project-manager/project-meeting/${meetingId}`),
        retry: false,
    });

    const {
        data: calendarEventsResponse,
        isLoading: isCalendarLoading,
        isError: isCalendarError,
        error: calendarError,
    } = useQuery({
        queryKey: ["google-calendar-events-fallback"],
        enabled: Boolean(meetingId),
        queryFn: () => apiGet("/api/project-manager/google-calendar/all-events"),
    });

    const meetingData = useMemo(() => {
        if (dbMeetingResponse && !dbMeetingResponse.error) {
            return normalizeMeeting(dbMeetingResponse);
        } else if (calendarEventsResponse) {
            const rawEvents = calendarEventsResponse?.data || calendarEventsResponse || [];
            const eventsList = Array.isArray(rawEvents) ? rawEvents : (Array.isArray(rawEvents?.data) ? rawEvents.data : []);
            const foundEvent = eventsList.find(ev => String(ev?.id) === String(meetingId) || String(ev?.meetingId) === String(meetingId));
            
            if (foundEvent) {
                const participantsRaw = foundEvent?.attendees ?? foundEvent?.participants ?? foundEvent?.invitees ?? [];
                const participants = Array.isArray(participantsRaw)
                    ? participantsRaw.map(p => typeof p === 'string' ? p : (p?.email || p?.displayName || "")).filter(Boolean)
                    : [];

                const meetingDateValue = foundEvent?.start ?? foundEvent?.meetingDate ?? foundEvent?.createdAt ?? "";
                const meetingDate = meetingDateValue ? new Date(meetingDateValue) : null;
                const date = meetingDate && !Number.isNaN(meetingDate.getTime())
                    ? meetingDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                    : fallback;
                const time = meetingDate && !Number.isNaN(meetingDate.getTime())
                    ? `${String(meetingDate.getHours()).padStart(2, "0")}:${String(meetingDate.getMinutes()).padStart(2, "0")}`
                    : fallback;

                const aiSummaryRaw = foundEvent?.aiSummary ?? foundEvent?.aiMeetingSummary ?? foundEvent?.description ?? "";
                const aiMeetingSummary = Array.isArray(aiSummaryRaw)
                    ? aiSummaryRaw.filter(Boolean)
                    : (typeof aiSummaryRaw === "string" && aiSummaryRaw.trim() ? [aiSummaryRaw] : []);

                const keyPoints = Array.isArray(foundEvent?.keyPoints)
                    ? foundEvent.keyPoints.map(kp => typeof kp === 'string' ? kp : (kp?.content || kp?.text || "")).filter(Boolean)
                    : [];

                const actionItems = Array.isArray(foundEvent?.actionPoints)
                    ? foundEvent.actionPoints.map(ap => ({
                        task: typeof ap === 'string' ? ap : (ap?.content ?? ap?.task ?? ""),
                        owner: ap?.status ?? "",
                        dueDate: "",
                    }))
                    : [];

                return {
                    title: foundEvent?.summary ?? foundEvent?.title ?? foundEvent?.subject ?? "Meeting Notes",
                    date,
                    time,
                    organizer: foundEvent?.organizer?.email ?? foundEvent?.organizer?.displayName ?? foundEvent?.organizer ?? foundEvent?.host ?? fallback,
                    participants,
                    agenda: typeof foundEvent?.agenda === 'string' ? [foundEvent.agenda] : (Array.isArray(foundEvent?.agenda) ? foundEvent.agenda : []),
                    aiMeetingSummary,
                    lastMeetingSummary: foundEvent?.lastMeetingSummary ?? "",
                    keyPoints,
                    actionItems,
                    notes: typeof foundEvent?.notes === 'string' ? [foundEvent.notes] : (Array.isArray(foundEvent?.notes) ? foundEvent.notes : []),
                    recordingLink: foundEvent?.htmlLink ?? foundEvent?.url ?? foundEvent?.videoPlayUrl ?? foundEvent?.meetingRecordingLink ?? "",
                };
            }
        }
        return {
            title: fallback,
            date: fallback,
            time: fallback,
            organizer: fallback,
            participants: [],
            agenda: [],
            aiMeetingSummary: [],
            lastMeetingSummary: "",
            keyPoints: [],
            actionItems: [],
            notes: [],
            recordingLink: "",
        };
    }, [isUuid, dbMeetingResponse, calendarEventsResponse, meetingId]);

    const isLoading = isDbLoading && isCalendarLoading;
    const isError = isDbError && isCalendarError;
    const error = dbError || calendarError;

    if (isLoading) return <Loading />;
    if (!meetingId || !meetingData || (meetingData.title === fallback && isDbError && isCalendarError)) {
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

            {/* Last Meeting Summary */}
            <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    📝 Last Meeting Summary
                </h2>
                <Card>
                    <CardContent className="p-6">
                        {meetingData.lastMeetingSummary ? (
                            <p className="text-slate-700">{meetingData.lastMeetingSummary}</p>
                        ) : (
                            <p className="text-sm text-slate-500">No last meeting summary found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Key Points */}
            <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    🔑 Key Points
                </h2>
                <Card>
                    <CardContent className="p-6">
                        {meetingData.keyPoints?.length ? (
                            <ul className="space-y-2">
                                {meetingData.keyPoints.map((item, index) => (
                                    <li key={index} className="text-slate-700 flex items-start gap-2">
                                        <span className="text-slate-400 mt-1">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500">No key points found.</p>
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
