"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HiOutlineSparkles } from "react-icons/hi2";
import { FiX, FiSend } from "react-icons/fi";

// Dummy data for AI reminder items
const aiReminderItems = [
  {
    id: 1,
    title: "AI Tasks",
    timestamp: "30m ago",
    description: "AI analyzed meetings, emails and docs and identified potential delivery risks. Timeline may be affected if delays occur.",
    source: "Emails",
  },
  {
    id: 2,
    title: "AI Risks",
    timestamp: "30m ago",
    description: "AI analyzed meetings, emails and docs and identified potential delivery risks. Timeline may be affected if delays occur.",
    source: "Meeting Notes",
  },
  {
    id: 3,
    title: "AI Assumptions",
    timestamp: "30m ago",
    description: "AI analyzed meetings, emails and docs and identified potential delivery risks. Timeline may be affected if delays occur.",
    source: "Transcripts",
  },
  {
    id: 4,
    title: "AI Decisions",
    timestamp: "30m ago",
    description: "AI analyzed meetings, emails and docs and identified potential delivery risks. Timeline may be affected if delays occur.",
    source: "Transcripts",
  },
  {
    id: 5,
    title: "AI Actions",
    timestamp: "30m ago",
    description: "Follow up with the design team to confirm the revised UI delivery date and update the project timeline accordingly.",
    source: "Transcripts",
  },
];

export default function AiReminder() {
  const [aiPrompt, setAiPrompt] = useState("");

  const handleSend = () => {
    if (aiPrompt.trim()) {
      console.log("Sending AI prompt:", aiPrompt);
      // Handle AI prompt submission here
      setAiPrompt("");
    }
  };

  return (
    <div className=" bg-slate-50/50 ">
      <div className=" ">
        {/* AI Reminder System Modal */}
        <Card className="rounded-lg shadow-lg">
          <CardContent className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HiOutlineSparkles className="h-5 w-5 sm:h-6 sm:w-6 text-[#6051E2]" />
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
                  AI Reminder System
                </h1>
              </div>
              
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 mb-6">
              3 new items require attention
            </p>

            {/* AI Reminder Items */}
            <div className="space-y-0 divide-y divide-slate-200 mb-6">
              {aiReminderItems.map((item, index) => (
                <div
                  key={item.id}
                  className="py-4 sm:py-5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <span className="text-xs sm:text-sm text-slate-500 whitespace-nowrap">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-3 leading-relaxed">
                    {item.description}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Source: <span className="text-slate-700">{item.source}</span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
