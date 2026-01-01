"use client";
import { Card, CardContent } from "@/components/ui/card";
import { FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";

// Dummy meeting data
const meetingData = {
    title: "Weekly Project Sync",
    date: "December 14, 2025",
    time: "10:00-10:30 AM",
    organizer: "Alex Johnson",
    participants: ["Alex", "Priya", "Sam", "Jordan"],
    agenda: [
        "Project status updates",
        "Blockers & risks",
        "Next sprint planning",
    ],
    discussionSummary: [
        {
            topic: "Frontend progress",
            text: "Sam confirmed the UI redesign is 80% complete and on track for Friday delivery.",
            hasIcon: true,
        },
        {
            topic: "Backend updates",
            text: "Priya reported API integration is complete, pending final testing.",
        },
        {
            topic: "Blockers",
            text: "Jordan noted delays due to missing analytics requirements.",
        },
        {
            topic: "Timeline",
            text: "Team agreed to extend the testing phase by 2 days.",
        },
    ],
    decisions: [
        "Final UI review scheduled for Dec 16",
        "Testing phase extended until Dec 20",
        "Analytics requirements to be finalized this week",
    ],
    actionItems: [
        { task: "Share analytics requirements", owner: "Jordan", dueDate: "Dec 15" },
        { task: "Complete UI redesign", owner: "Sam", dueDate: "Dec 15" },
        { task: "Run full QA testing", owner: "Priya", dueDate: "Dec 18" },
    ],
    notes: [
        "Next meeting scheduled for Dec 18 at 10:00 AM",
        "Meeting notes auto-saved to Google Docs and shared with all attendees",
    ],
};

export default function MeetingSummary() {
    const router = useRouter();

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
                    🚀 AI summary Google Meet – Meeting Notes
                </h1>
                <p className="text-lg sm:text-xl text-slate-700">
                    Meeting Title: {meetingData.title}
                </p>
            </div>

            {/* Meeting Details */}
            <Card>
                <CardContent className="p-6 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                        <div>
                            <span className="text-slate-600 font-medium">Date:</span>{" "}
                            <span className="text-slate-900">{meetingData.date}</span>
                        </div>
                        <div>
                            <span className="text-slate-600 font-medium">Time:</span>{" "}
                            <span className="text-slate-900">{meetingData.time}</span>
                        </div>
                        <div>
                            <span className="text-slate-600 font-medium">Organizer:</span>{" "}
                            <span className="text-slate-900">{meetingData.organizer}</span>
                        </div>
                        <div>
                            <span className="text-slate-600 font-medium">Participants:</span>{" "}
                            <span className="text-slate-900">
                                {meetingData.participants.join(", ")}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Agenda */}
            <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    📋 Agenda
                </h2>
                <Card>
                    <CardContent className="p-6">
                        <ul className="space-y-2">
                            {meetingData.agenda.map((item, index) => (
                                <li key={index} className="text-slate-700 flex items-start gap-2">
                                    <span className="text-slate-400 mt-1">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
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
                        <ul className="space-y-4">
                            {meetingData.discussionSummary.map((item, index) => (
                                <li key={index} className="text-slate-700">
                                    <div className="flex items-start gap-2">
                                        <span className="text-slate-400 mt-1">•</span>
                                        <div className="flex-1">
                                            <span className="font-semibold text-slate-900">
                                                {item.topic}:
                                            </span>{" "}
                                            <span>{item.text}</span>
                                            
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
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
                        <ul className="space-y-2">
                            {meetingData.decisions.map((item, index) => (
                                <li key={index} className="text-slate-700 flex items-start gap-2">
                                    <span className="text-slate-400 mt-1">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
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
                                    {meetingData.actionItems.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="border-b border-slate-100 last:border-b-0"
                                        >
                                            <td className="py-3 px-3 text-slate-700">
                                                {item.task}
                                            </td>
                                            <td className="py-3 px-3 text-slate-700">
                                                {item.owner}
                                            </td>
                                            <td className="py-3 px-3 text-slate-700">
                                                {item.dueDate}
                                            </td>
                                        </tr>
                                    ))}
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
                        <ul className="space-y-2">
                            {meetingData.notes.map((item, index) => (
                                <li key={index} className="text-slate-700 flex items-start gap-2">
                                    <span className="text-slate-400 mt-1">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
