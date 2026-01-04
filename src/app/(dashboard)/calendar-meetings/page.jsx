"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ChevronLeft, ChevronRight, Plus, Zap, Monitor } from "lucide-react"

// Sample meetings data
const meetings = [
  {
    id: 1,
    title: "Monday Wake-Up Hour",
    time: "8:00 AM",
    date: "2026-01-06",
    duration: 60,
    color: "bg-blue-100 border-blue-300",
    dotColor: "bg-blue-500",
    aiSummary: "The team discussed the week's priorities and aligned on key deliverables. Action items were assigned for the upcoming sprint.",
  },
  {
    id: 3,
    title: "Product Demo",
    time: "9:00 AM",
    date: "2026-01-06",
    duration: 60,
    color: "bg-green-100 border-green-300",
    dotColor: "bg-blue-500",
    aiSummary: "The team discussed the week's priorities and aligned on key deliverables. Action items were assigned for the upcoming sprint.",
  },
  {
    id: 4,
    title: "AI-Team Kickoff",
    time: "10:00 AM",
    date: "2026-01-07",
    duration: 60,
    color: "bg-blue-100 border-blue-300",
    dotColor: "bg-blue-500",
    aiSummary: "Kickoff meeting for the AI project. Team members introduced themselves and discussed project goals. Timeline and milestones were established.",
  },
  {
    id: 5,
    title: "Financial Update",
    time: "10:00 AM",
    date: "2026-01-12",
    duration: 60,
    color: "bg-blue-100 border-blue-300",
    dotColor: "bg-blue-500",
    aiSummary: "Quarterly financial review meeting. Revenue targets were discussed, and budget allocations for Q2 were approved.",
  },
  {
    id: 6,
    title: "New Employee Welcome...",
    time: "11:00 AM",
    date: "2026-01-24",
    duration: 60,
    color: "bg-purple-100 border-purple-300",
    dotColor: "bg-purple-500",
    aiSummary: "Welcome lunch for new team members. Introductions were made, and company culture was discussed. Great team bonding session!",
  },
  {
    id: 7,
    title: "Design Review",
    time: "1:00 PM",
    date: "2026-01-24",
    duration: 60,
    color: "bg-blue-100 border-blue-300",
    dotColor: "bg-blue-500",
    aiSummary: "Design review session for the new product features. Feedback was collected and design iterations were planned.",
  },
  {
    id: 8,
    title: "Design Review",
    time: "1:00 PM",
    date: "2026-01-08",
    duration: 60,
    color: "bg-blue-100 border-blue-300",
    dotColor: "bg-blue-500",
    aiSummary: "Design review session for the new product features. Feedback was collected and design iterations were planned.",
  },
  {
    id: 2,
    title: "Daily Standup",
    time: "7:00 AM",
    date: "2026-01-08",
    duration: 60,
    color: "bg-green-100 border-green-300",
    dotColor: "bg-blue-500",
    aiSummary: "Daily standup meeting to discuss the progress of the project. Feedback was collected and design iterations were planned.",
  },


]

const integrations = [
  { id: 1, name: "Microsoft Teams", status: "Connected" },
  { id: 2, name: "Google Meeting", status: "Connected" },
  { id: 3, name: "Zoom", status: "Connected" },
]

export default function CalendarMeetings() {
  // Get today's date but in 2026
  const today = new Date()
  const today2026 = new Date(2026, today.getMonth(), today.getDate())

  const [currentDate, setCurrentDate] = useState(today2026)
  const [selectedDate, setSelectedDate] = useState(today2026)
  const [hoveredMeeting, setHoveredMeeting] = useState(null)
  const [viewMode, setViewMode] = useState("week") // "week", "month"

  // Get current month and year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Helper function to get today in 2026
  const getToday2026 = () => {
    return new Date(2026, today.getMonth(), today.getDate())
  }

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  // Generate calendar days
  const calendarDays = []
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

  // Add previous month's trailing days
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate()
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth - 1, prevMonthDays - i),
    })
  }

  // Add current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(currentYear, currentMonth, i),
    })
  }

  // Add next month's leading days
  const remainingDays = 42 - calendarDays.length
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth + 1, i),
    })
  }

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  // Get week start date (Sunday)
  const getWeekStart = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  const weekStart = getWeekStart(selectedDate)
  const weekDays = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    weekDays.push(date)
  }

  // Get meetings for a specific date
  const getMeetingsForDate = (date) => {
    // Format date as YYYY-MM-DD without timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const dateStr = `${year}-${month}-${day}`
    return meetings.filter((m) => m.date === dateStr)
  }

  // Get time slot height (each hour = 60px)
  const getTimeSlotTop = (time) => {
    const [hours, minutes, period] = time.match(/(\d+):(\d+)\s*(AM|PM)/).slice(1)
    let hour = parseInt(hours)
    if (period === "PM" && hour !== 12) hour += 12
    if (period === "AM" && hour === 12) hour = 0
    const totalMinutes = hour * 60 + parseInt(minutes)
    return ((totalMinutes - 7 * 60) / 60) * 60 // Start from 7 AM
  }

  const getMeetingHeight = (duration) => {
    return (duration / 60) * 60 // Convert minutes to pixels
  }

  // Format month name
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <TooltipProvider>
      <div className="mb-10">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar & Meetings</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your schedule across Zoom, Meet, and Teams.
            </p>
          </div>
          {/* <Button variant="primary" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Meeting
          </Button> */}
        </div>

        {/* AI Alert */}
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
          <Zap className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            AI detected 2 Overlapping meetings On Thursday.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Calendar */}
            <Card>
              <CardContent className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {monthNames[currentMonth]} {currentYear}
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={goToNextMonth}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="text-xs font-medium text-gray-600 text-center py-1"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((dayData, index) => {
                    const dayMeetings = getMeetingsForDate(dayData.date)
                    const isSelected =
                      dayData.date.toDateString() === selectedDate.toDateString()
                    const isToday =
                      dayData.date.toDateString() === getToday2026().toDateString()

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (dayData.isCurrentMonth) {
                            setSelectedDate(dayData.date)
                          }
                        }}
                        className={`relative p-2 text-sm rounded transition-colors ${!dayData.isCurrentMonth
                          ? "text-gray-300"
                          : isSelected
                            ? "bg-primary text-white"
                            : isToday
                              ? "bg-purple-100 text-purple-700 font-semibold"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        {dayData.day}
                        {dayMeetings.length > 0 && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Integrations */}
            <Card>
              <CardContent className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Integrations</h3>
                  <button className="text-sm text-primary hover:underline">Manage</button>
                </div>
                <div className="space-y-3">
                  {integrations.map((integration) => (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {integration.name}
                        </div>
                        <div className="text-xs text-green-600 mt-0.5">
                          {integration.status}
                        </div>
                      </div>
                      <Monitor className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* AI Summary Box */}
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Last Meeting AI Summary
                    </h3>
                    <p className="text-sm text-gray-700">
                      The project is processing well, with key design milestones met.
                      However, there are some concerns about the timeline that need to
                      be addressed in the next sprint planning session.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* View Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("week")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "week"
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "month"
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                Month
              </button>
            </div>

            {/* Week Calendar */}
            {viewMode === "week" && (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                      {/* Week Header */}
                      <div className="grid grid-cols-8 border-b bg-gray-50">
                        <div className="p-3 border-r"></div>
                        {weekDays.map((date, index) => {
                          const isSelected =
                            date.toDateString() === selectedDate.toDateString()
                          const isToday =
                            date.toDateString() === getToday2026().toDateString()
                          return (
                            <div
                              key={index}
                              className={`p-3 text-center border-r last:border-r-0 ${isToday
                                ? "bg-purple-100"
                                : isSelected
                                  ? "bg-primary/5"
                                  : ""
                                }`}
                            >
                              <div className="text-xs text-gray-600 uppercase font-medium">
                                {daysOfWeek[date.getDay()]}
                              </div>
                              <div
                                className={`text-lg font-semibold mt-1 ${isToday
                                  ? "text-purple-700"
                                  : isSelected
                                    ? "text-primary"
                                    : "text-gray-900"
                                  }`}
                              >
                                {date.getDate()}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Time Slots */}
                      <div className="relative">
                        {/* Unified Grid for perfect alignment */}
                        <div className="grid grid-cols-8">
                          {/* Time Labels Column */}
                          <div className="border-r bg-gray-50">
                            {Array.from({ length: 8 }, (_, i) => {
                              const hour = 7 + i
                              const isLast = i === 7
                              return (
                                <div
                                  key={hour}
                                  className={`h-[60px] ${isLast ? "" : "border-b"} border-gray-200 flex items-start justify-end pr-3 pt-2`}
                                >
                                  <span className="text-xs text-gray-500 font-medium">
                                    {hour === 12
                                      ? "12 PM"
                                      : hour > 12
                                        ? `${hour - 12} PM`
                                        : `${hour} AM`}
                                  </span>
                                </div>
                              )
                            })}
                          </div>

                          {/* Calendar Day Columns */}
                          {weekDays.map((date, dayIndex) => {
                            const dayMeetings = getMeetingsForDate(date)
                            return (
                              <div
                                key={dayIndex}
                                className="relative border-r last:border-r-0 bg-white"
                              >
                                {Array.from({ length: 8 }, (_, i) => {
                                  const isLast = i === 7
                                  return (
                                    <div
                                      key={i}
                                      className={`h-[60px] ${isLast ? "" : "border-b"} border-gray-200`}
                                    ></div>
                                  )
                                })}
                                {/* Meetings */}
                                {dayMeetings.map((meeting) => {
                                  const top = getTimeSlotTop(meeting.time)
                                  const height = getMeetingHeight(meeting.duration)

                                  return (
                                    <Tooltip key={meeting.id}>
                                      <TooltipTrigger asChild>
                                        <div
                                          className={`absolute left-2 right-2 ${meeting.color} border rounded-md p-1.5 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all z-10`}
                                          style={{
                                            top: `${top + 2}px`,
                                            height: `${Math.max(height - 4, 28)}px`,
                                          }}
                                        >
                                          <div className="flex items-start gap-1.5 h-full">
                                            <div
                                              className={`w-1.5 h-1.5 rounded-full ${meeting.dotColor || "bg-primary"} mt-0.5 flex-shrink-0`}
                                            ></div>
                                            <div className="flex-1 min-w-0 overflow-hidden">
                                              <div className="text-[10px] font-semibold text-gray-900 truncate leading-tight">
                                                {meeting.time}
                                              </div>
                                              <div className="text-[10px] text-gray-700 mt-0.5 line-clamp-2 leading-tight">
                                                {meeting.title}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="right"
                                        className="max-w-xs bg-purple-50 border-purple-200 shadow-lg"
                                      >
                                        <div className="space-y-2">
                                          <div>
                                            <div className="font-semibold text-sm text-gray-900">
                                              {meeting.title}
                                            </div>
                                            <div className="text-xs text-gray-600 mt-0.5">
                                              {meeting.time} • {meeting.duration} min
                                            </div>
                                          </div>
                                          <div className="pt-2 border-t border-purple-200">
                                            <div className="text-xs font-semibold text-purple-700 mb-1">
                                              AI Summary:
                                            </div>
                                            <div className="text-xs text-gray-700 leading-relaxed">
                                              {meeting.aiSummary}
                                            </div>
                                          </div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  )
                                })}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Month Calendar */}
            {viewMode === "month" && (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Month Header */}
                    <div className="grid grid-cols-7 gap-2 border-b pb-3">
                      {daysOfWeek.map((day) => (
                        <div
                          key={day}
                          className="text-xs font-semibold text-gray-600 text-center uppercase"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Month Grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {calendarDays.map((dayData, index) => {
                        const dayMeetings = getMeetingsForDate(dayData.date)
                        const isSelected =
                          dayData.date.toDateString() === selectedDate.toDateString()
                        const isToday =
                          dayData.date.toDateString() === getToday2026().toDateString()

                        return (
                          <div
                            key={index}
                            className={`min-h-[120px] md:min-h-[140px] p-2 rounded-lg border transition-all ${!dayData.isCurrentMonth
                              ? "bg-gray-50/50 border-gray-100"
                              : isSelected
                                ? "bg-primary/5 border-primary/30 ring-2 ring-primary/20 shadow-sm"
                                : isToday
                                  ? "bg-purple-100 border-purple-300 shadow-sm"
                                  : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                              }`}
                          >
                            <div
                              className={`text-sm font-semibold mb-2 ${!dayData.isCurrentMonth
                                ? "text-gray-300"
                                : isSelected
                                  ? "text-primary"
                                  : isToday
                                    ? "text-purple-700"
                                    : "text-gray-700"
                                }`}
                            >
                              {dayData.day}
                            </div>
                            <div className="space-y-1.5">
                              {dayMeetings.slice(0, 3).map((meeting) => (
                                <Tooltip key={meeting.id}>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={`text-xs p-1.5 rounded-md ${meeting.color} cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all`}
                                      onClick={() => {
                                        setSelectedDate(dayData.date)
                                        setViewMode("week")
                                      }}
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <div
                                          className={`w-1.5 h-1.5 rounded-full ${meeting.dotColor || "bg-primary"} flex-shrink-0`}
                                        ></div>
                                        <span className="text-xs font-semibold text-gray-900">
                                          {meeting.time}
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-700 truncate mt-0.5 font-medium">
                                        {meeting.title}
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="right"
                                    className="max-w-xs bg-purple-50 border-purple-200 shadow-lg"
                                  >
                                    <div className="space-y-2">
                                      <div>
                                        <div className="font-semibold text-sm text-gray-900">
                                          {meeting.title}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-0.5">
                                          {meeting.time} • {meeting.duration} min
                                        </div>
                                      </div>
                                      <div className="pt-2 border-t border-purple-200">
                                        <div className="text-xs font-semibold text-purple-700 mb-1">
                                          AI Summary:
                                        </div>
                                        <div className="text-xs text-gray-700 leading-relaxed">
                                          {meeting.aiSummary}
                                        </div>
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                              {dayMeetings.length > 3 && (
                                <div className="text-xs text-gray-500 font-semibold pt-1 hover:text-primary cursor-pointer transition-colors">
                                  +{dayMeetings.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
