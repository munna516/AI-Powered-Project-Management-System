"use client";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import { FiArrowLeft } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
// Dummy data - in real app, fetch based on meeting/params
const meetingData = {
    topic: "website redesign",
    summary: "The Website Redesign project is progressing steadily, with major focus areas currently centered around wireframe development, content preparation, and establishing the final visual direction of the brand. Over the past week, the design team has refined multiple layout options for the homepage, evaluated the overall navigation flow, and aligned the UI style with the client's brand goals. Key discussions have revolved around improving user experience, simplifying the information hierarchy, and creating a cleaner design that supports both desktop and mobile users.",
    keyPoints: [
        { text: "Project Budget Sufficient", status: "validated" },
        { text: "Stakeholder availability for reviews", status: "to_be_validated" },
        { text: "Core technologies are stable and performance", status: "validated" },
    ],
    actionPoints: [
        { text: "Schedule stakeholder review meeting for next week", status: "pending" },
        { text: "Finalize wireframe designs by end of month", status: "in_progress" },
        { text: "Prepare content strategy document", status: "pending" },
    ],
};

export default function MeetingSummary() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const meetingId = searchParams.get("meetingId");
    const documentId = searchParams.get("documentId");
    return (

        <div className=" space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <button onClick={() => router.back()} className="text-blue-600 cursor-pointer hover:underline flex items-center gap-2"> <FiArrowLeft className="h-4 w-4" /> Go Back</button>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                AI {meetingId === "meeting" ? "Meeting" : "Document"} Summary
            </h1>

            {/* Meeting Topics Section */}
            <Card className="bg-[#6051E2]/10 border-[#6051E2]/20">
                <CardContent className="p-6 sm:p-8">
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4">
                        {meetingId === "meeting" ? "Meeting" : "Document"} Topics: {meetingData.topic}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                        {meetingData.summary}
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
                            <ol className="space-y-4">
                                {meetingData.keyPoints.map((point, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-3"
                                    >
                                        <span className="text-slate-600 font-medium mt-0.5">
                                            {index + 1}.
                                        </span>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {point.status === "validated" ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                ) : (
                                                    <Circle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                                                )}
                                                <span
                                                    className={`text-xs font-medium px-2 py-1 rounded ${point.status === "validated"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                >
                                                    {point.status === "validated"
                                                        ? "Validated"
                                                        : "To be Validated"}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700">
                                                {point.text}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
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
                            <ol className="space-y-4">
                                {meetingData.actionPoints.map((point, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-3"
                                    >
                                        <span className="text-slate-600 font-medium mt-0.5">
                                            {index + 1}.
                                        </span>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {point.status === "completed" ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                ) : (
                                                    <Circle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                )}
                                                <span
                                                    className={`text-xs font-medium px-2 py-1 rounded ${point.status === "completed"
                                                        ? "bg-green-100 text-green-800"
                                                        : point.status === "in_progress"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                >
                                                    {point.status === "completed"
                                                        ? "Completed"
                                                        : point.status === "in_progress"
                                                            ? "In Progress"
                                                            : "Pending"}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700">
                                                {point.text}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>

    );
}
