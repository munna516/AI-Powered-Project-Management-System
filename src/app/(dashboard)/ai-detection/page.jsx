"use client";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FiCheck, FiX, FiEye } from "react-icons/fi";
import PageHeader from "@/components/PageHeader/PageHeader";

const tabs = [
  { id: "email", label: "Email" },
  { id: "meeting-notes", label: "Meeting notes" },
  { id: "recording", label: "Recording" },
  { id: "meetings-transcript", label: "Meetings transcript" },
  { id: "attachments", label: "Attachments" },
];

const initialCommunications = [
  // Email communications
  {
    id: 1,
    type: "email",
    summary: "Hey, This Is Pilot, Your Project Manager. I've Noticed A Few Issues With Your Project. Here Is The Project #Mobile App And Your Project ID: #8987724.",
    details: "I've Reviewed The Latest Updates And Identified A Few Areas That Need Attention To Keep The Project On Schedule. Some Tasks Have Missing Requirements, A Few Design Components Are Still Pending Approval, And There Are Delays In Content Delivery. I've Summarized The Issues Along With Recommended Actions So You Can Quickly Address Them. Please Go Through The List Below And Update The Status Where Needed.",
  },
  {
    id: 2,
    type: "email",
    summary: "Project Status Update: Q4 Milestones Review Required",
    details: "We need to review the Q4 milestones and ensure all deliverables are on track. The development team has completed 75% of the planned features, but there are some concerns about the timeline for the remaining 25%. Please schedule a meeting to discuss the priorities and potential adjustments to the project scope.",
  },
  {
    id: 3,
    type: "email",
    summary: "Urgent: Client Feedback on Design Mockups",
    details: "The client has provided feedback on the latest design mockups. They are generally satisfied but have requested changes to the color scheme and typography. The design team needs to address these concerns before the next review meeting scheduled for next week.",
  },
  // Meeting notes
  {
    id: 4,
    type: "meeting-notes",
    summary: "Sprint Planning Meeting - January 15, 2024",
    details: "Discussed the upcoming sprint goals and priorities. Team agreed on focusing on user authentication features and dashboard improvements. Identified potential blockers related to API integration. Action items: Backend team to provide API documentation by end of week, Frontend team to start working on authentication UI components.",
  },
  {
    id: 5,
    type: "meeting-notes",
    summary: "Client Review Meeting - Project Status Update",
    details: "Presented current project status to the client. Highlighted completed features and upcoming milestones. Client expressed satisfaction with progress but requested additional features for the mobile app. Need to discuss timeline implications with the development team.",
  },
  {
    id: 6,
    type: "meeting-notes",
    summary: "Team Standup - Daily Progress Check",
    details: "Team members shared their progress on assigned tasks. Most tasks are on track, but there are some dependencies that need attention. Discussed potential solutions for the database performance issues identified during testing.",
  },
  // Recording
  {
    id: 7,
    type: "recording",
    summary: "Client Interview Recording - User Requirements Discussion",
    details: "Recorded interview with the client to gather detailed user requirements. Key points discussed: User interface preferences, feature priorities, integration requirements with existing systems, and timeline expectations. Duration: 45 minutes. Recording quality: Good.",
  },
  {
    id: 8,
    type: "recording",
    summary: "Technical Architecture Review - System Design Discussion",
    details: "Recorded technical discussion about system architecture and design decisions. Covered topics: Database schema, API structure, security considerations, and scalability requirements. Duration: 1 hour 15 minutes. Participants: Tech lead, Senior developers, and System architect.",
  },
  {
    id: 9,
    type: "recording",
    summary: "Stakeholder Feedback Session - Product Demo",
    details: "Recorded product demonstration session with key stakeholders. Showed current features and gathered feedback. Stakeholders provided valuable insights on user experience and suggested improvements. Duration: 30 minutes.",
  },
  // Meetings transcript
  {
    id: 10,
    type: "meetings-transcript",
    summary: "Project Kickoff Meeting Transcript - January 5, 2024",
    details: "Full transcript of the project kickoff meeting. Discussed project objectives, team introductions, timeline, and initial requirements. All team members were present. Key decisions: Project will use Agile methodology, weekly sprint reviews, and bi-weekly client updates.",
  },
  {
    id: 11,
    type: "meetings-transcript",
    summary: "Sprint Retrospective Transcript - Team Reflection Session",
    details: "Complete transcript of the sprint retrospective meeting. Team discussed what went well, what could be improved, and action items for the next sprint. Identified areas for process improvement and team collaboration enhancement.",
  },
  {
    id: 12,
    type: "meetings-transcript",
    summary: "Client Presentation Transcript - Feature Showcase",
    details: "Full transcript of the client presentation where we showcased new features. Client asked questions about implementation details, timeline, and future roadmap. All questions were addressed during the meeting.",
  },
  // Attachments
  {
    id: 13,
    type: "attachments",
    summary: "Project Requirements Document - Version 2.1",
    details: "Updated project requirements document with latest changes and client feedback. Includes detailed feature specifications, user stories, acceptance criteria, and technical requirements. File size: 2.5 MB. Format: PDF.",
  },
  {
    id: 14,
    type: "attachments",
    summary: "Design Mockups - Mobile App UI/UX",
    details: "Complete set of design mockups for the mobile application. Includes wireframes, high-fidelity designs, and interactive prototypes. Covers all major screens and user flows. File size: 15.3 MB. Format: Figma files and PDF exports.",
  },
  {
    id: 15,
    type: "attachments",
    summary: "Technical Documentation - API Integration Guide",
    details: "Comprehensive technical documentation for API integration. Includes endpoint specifications, authentication methods, request/response formats, error handling, and code examples. File size: 1.8 MB. Format: PDF and Markdown files.",
  },
];

export default function AiDetection() {
  const [activeTab, setActiveTab] = useState("email");
  const [searchValue, setSearchValue] = useState("");
  const [communications, setCommunications] = useState(initialCommunications);
  const [expandedItems, setExpandedItems] = useState(new Set([]));

  const handleRemove = (id) => {
    setCommunications((prev) => prev.filter((item) => item.id !== id));
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleViewDetails = (id) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredCommunications = useMemo(() => {
    const searchLower = searchValue.toLowerCase();
    return communications.filter((item) => {
      const matchesTab = item.type === activeTab;
      const matchesSearch =
        item.summary.toLowerCase().includes(searchLower) ||
        item.details.toLowerCase().includes(searchLower);
      return matchesTab && matchesSearch;
    });
  }, [communications, activeTab, searchValue]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="AI Detection"
        description="Analyze project communications to understand stakeholder emotions and sentiment trends."
        searchPlaceholder="Search by project, client, or keyword..."
        searchValue={searchValue}
        onSearchChange={(e) => setSearchValue(e.target.value)}
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3 mt-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer ${activeTab === tab.id
              ? "bg-[#6051E2] text-white"
              : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Communications List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredCommunications.length === 0 ? (
          <Card>
            <CardContent className="p-6 sm:p-8 text-center text-slate-500 text-sm sm:text-base">
              No communications found matching your search.
            </CardContent>
          </Card>
        ) : (
          filteredCommunications.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            return (
              <Card
                key={item.id}
                className="rounded-lg"
              >
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 w-full sm:w-auto">
                      <p className="font-bold text-slate-900 text-xs sm:text-sm md:text-base mb-2 sm:mb-3 leading-snug sm:leading-normal">
                        {item.summary}
                      </p>
                      {isExpanded && (
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200">
                          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                            {item.details}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                      {/* Approve Button */}
                      <button
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 transition cursor-pointer"
                        title="Approve"
                        aria-label="Approve"
                      >
                        <FiCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition cursor-pointer"
                        title="Remove"
                        aria-label="Remove"
                      >
                        <FiX className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      {/* View Details Button */}
                      <button
                        onClick={() => handleViewDetails(item.id)}
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-400 flex items-center justify-center text-white hover:bg-slate-500 transition cursor-pointer"
                        title="View details"
                        aria-label="View details"
                      >
                        <FiEye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
