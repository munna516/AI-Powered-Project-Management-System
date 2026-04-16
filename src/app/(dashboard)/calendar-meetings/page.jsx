"use client"

import { useMemo, useState } from "react"
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
import { ChevronLeft, ChevronRight, Zap } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost } from "@/lib/api"
import Loading from "@/components/Loading/Loading"
import toast from "react-hot-toast"

const MEETING_COLORS = [
  { color: "bg-blue-100 border-blue-300", dotColor: "bg-blue-500" },
  { color: "bg-green-100 border-green-300", dotColor: "bg-green-500" },
  { color: "bg-purple-100 border-purple-300", dotColor: "bg-purple-500" },
  { color: "bg-amber-100 border-amber-300", dotColor: "bg-amber-500" },
  { color: "bg-rose-100 border-rose-300", dotColor: "bg-rose-500" },
]

const formatDateForMeeting = (d) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const formatTimeForMeeting = (d) => {
  const hours24 = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, "0")
  const ampm = hours24 >= 12 ? "PM" : "AM"
  const hours12Raw = hours24 % 12
  const hours12 = hours12Raw === 0 ? 12 : hours12Raw
  return `${hours12}:${minutes} ${ampm}`
}

const fallbackAiSummary = "No AI summary available"

export default function CalendarMeetings() {
  const queryClient = useQueryClient()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [topic, setTopic] = useState("")
  const [startTime, setStartTime] = useState("")

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

  const toDateTimeLocalValue = (d) => {
    if (!d || Number.isNaN(d.getTime())) return ""
    const pad = (n) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
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

  const {
    data: eventsResponse,
    isLoading: isEventsLoading,
    isError: isEventsError,
    error: eventsError,
  } = useQuery({
    queryKey: ["google-calendar-events"],
    queryFn: () => apiGet("/api/project-manager/google-calendar/all-events"),
  })

  const {
    data: projectsResponse,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
    error: projectsError,
  } = useQuery({
    queryKey: ["projects-for-zoom-meeting"],
    queryFn: () => apiGet("/api/project-manager/project-management/my-projects"),
  })

  const projects = useMemo(() => {
    const raw = Array.isArray(projectsResponse?.data)
      ? projectsResponse.data
      : Array.isArray(projectsResponse?.data?.data)
        ? projectsResponse.data.data
        : []

    return raw
      .map((p) => ({
        id: String(p?.id ?? p?.projectId ?? ""),
        name: p?.name || p?.projectName || p?.title || `Project ${p?.id ?? ""}`,
      }))
      .filter((p) => p.id)
  }, [projectsResponse])

  const createMeetingMutation = useMutation({
    mutationFn: async (payload) => apiPost("/api/project-manager/zoom/meetings", payload),
    onSuccess: async () => {
      toast.success("Meeting created successfully")
      setIsCreateOpen(false)
      setSelectedProjectId("")
      setTopic("")
      setStartTime("")
      await queryClient.invalidateQueries({ queryKey: ["google-calendar-events"] })
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to create meeting")
    },
  })

  const handleCreateMeeting = () => {
    const trimmedTopic = topic.trim()
    if (!selectedProjectId) {
      toast.error("Please select a project")
      return
    }
    if (!trimmedTopic) {
      toast.error("Please enter a topic")
      return
    }
    if (!startTime) {
      toast.error("Please select start time")
      return
    }

    const parsed = new Date(startTime)
    if (Number.isNaN(parsed.getTime())) {
      toast.error("Invalid start time")
      return
    }

    createMeetingMutation.mutate({
      projectId: selectedProjectId,
      topic: trimmedTopic,
      start_time: parsed.toISOString(),
    })
  }

  const meetings = useMemo(() => {
    const rawEvents = Array.isArray(eventsResponse?.data) ? eventsResponse.data : []
    return rawEvents
      .map((ev, idx) => {
      const start = ev?.start ? new Date(ev.start) : null
      const end = ev?.end ? new Date(ev.end) : null
      if (!start || Number.isNaN(start.getTime())) return null
      const durationMinutes = (() => {
        if (!start || !end) return 60
        const diff = Math.round((end.getTime() - start.getTime()) / 60000)
        return Number.isFinite(diff) && diff > 0 ? diff : 60
      })()

      const dateStr = start ? formatDateForMeeting(start) : ""
      const timeStr = start ? formatTimeForMeeting(start) : ""

      const theme = MEETING_COLORS[idx % MEETING_COLORS.length]

      const rawAiSummary = ev?.aiSummary ?? ev?.description ?? fallbackAiSummary
      const aiSummary =
        Array.isArray(rawAiSummary) ? rawAiSummary.find(Boolean) || fallbackAiSummary : rawAiSummary || fallbackAiSummary

      return {
        id: String(ev?.id ?? idx),
        title: ev?.summary || "Meeting",
        time: timeStr,
        date: dateStr,
        duration: durationMinutes,
        color: theme.color,
        dotColor: theme.dotColor,
        aiSummary,
        joinUrl: ev?.htmlLink || ev?.url || "",
      }
      })
      .filter(Boolean)
  }, [eventsResponse])

  const getShortSummary = (value) => {
    const text = Array.isArray(value) ? value.find(Boolean) : value
    if (!text || typeof text !== "string") return fallbackAiSummary
    const firstLine = text.split("\n").map((s) => s.trim()).find(Boolean) || fallbackAiSummary
    return firstLine.length > 120 ? `${firstLine.slice(0, 120)}...` : firstLine
  }

  if (isEventsLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loading />
      </div>
    )
  }

  if (isEventsError) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-slate-500 sm:text-base">
          {eventsError?.message || "Failed to load calendar events."}
        </CardContent>
      </Card>
    )
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

  const parseTimeToMinutes = (time) => {
    const match = String(time || "").match(/(\d+):(\d+)\s*(AM|PM)/)
    if (!match) return null
    const [hours, minutes, period] = match.slice(1)
    let hour = parseInt(hours, 10)
    if (period === "PM" && hour !== 12) hour += 12
    if (period === "AM" && hour === 12) hour = 0
    const totalMinutes = hour * 60 + parseInt(minutes, 10)
    return Number.isFinite(totalMinutes) ? totalMinutes : null
  }

  // Derive a dynamic time window for Week view so meetings like "6:15 PM" don't overflow.
  const timeRange = (() => {
    const weekMeetings = weekDays.flatMap((d) => getMeetingsForDate(d))
    if (!weekMeetings.length) {
      return { timeStartHour: 7, timeEndHour: 15, totalHours: 8 }
    }

    const startMins = weekMeetings
      .map((m) => parseTimeToMinutes(m.time))
      .filter((x) => typeof x === "number" && Number.isFinite(x))

    const endMins = weekMeetings
      .map((m) => {
        const startMin = parseTimeToMinutes(m.time)
        if (startMin == null) return null
        const dur = Number(m.duration || 60)
        const safeDur = Number.isFinite(dur) && dur > 0 ? dur : 60
        return startMin + safeDur
      })
      .filter((x) => typeof x === "number" && Number.isFinite(x))

    const minStart = Math.min(...startMins)
    const maxEnd = Math.max(...endMins)

    let timeStartHour = Math.max(0, Math.floor(minStart / 60) - 1)
    let timeEndHour = Math.min(24, Math.ceil(maxEnd / 60) + 1)

    if (timeEndHour - timeStartHour < 8) {
      timeEndHour = Math.min(24, timeStartHour + 8)
      if (timeEndHour - timeStartHour < 8) timeStartHour = Math.max(0, timeEndHour - 8)
    }

    const totalHours = Math.max(1, timeEndHour - timeStartHour)
    return { timeStartHour, timeEndHour, totalHours }
  })()

  // Get time slot top in px (each hour = 60px)
  const getTimeSlotTop = (time, timeStartHour) => {
    const totalMinutes = parseTimeToMinutes(time)
    if (totalMinutes == null) return 0
    const relativeMinutes = totalMinutes - timeStartHour * 60
    const top = (relativeMinutes / 60) * 60
    return Math.max(0, top)
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
          <Button
            onClick={() => {
              const next = new Date()
              next.setMinutes(Math.ceil(next.getMinutes() / 15) * 15)
              next.setHours(next.getHours() + 1)
              setStartTime(toDateTimeLocalValue(next))
              setIsCreateOpen(true)
            }}
            className="w-full sm:w-auto cursor-pointer bg-[#6051E2] hover:bg-[#4a3db8] text-white"
          >
            Create meeting
          </Button>
        </div>

        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open)
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Meeting</DialogTitle>
              <DialogDescription>
                Create a new Zoom meeting and add it to the calendar.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Project</label>
                <select
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  disabled={isProjectsLoading}
                >
                  <option value="">{isProjectsLoading ? "Loading projects..." : "Select a project"}</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {isProjectsError ? (
                  <p className="text-xs text-red-600">
                    {projectsError?.message || "Failed to load projects"}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter meeting topic"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Start time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateMeeting}
                disabled={createMeetingMutation.isPending}
                className="bg-[#6051E2] text-white hover:bg-[#4a3db8] disabled:opacity-60 cursor-pointer"
              >
                {createMeetingMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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

          </div>

          {/* Right Content */}
          <div className="lg:col-span-3 space-y-6">

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
                            {Array.from({ length: timeRange.totalHours }, (_, i) => {
                              const hour = timeRange.timeStartHour + i
                              const isLast = i === timeRange.totalHours - 1
                              return (
                                <div
                                  key={hour}
                                  className={`h-[60px] ${isLast ? "" : "border-b"} border-gray-200 flex items-start justify-end pr-3 pt-2`}
                                >
                                  <span className="text-xs text-gray-500 font-medium">
                                    {hour === 12
                                      ? "12 PM"
                                      : hour === 0
                                        ? "12 AM"
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
                                {Array.from({ length: timeRange.totalHours }, (_, i) => {
                                  const isLast = i === timeRange.totalHours - 1
                                  return (
                                    <div
                                      key={i}
                                      className={`h-[60px] ${isLast ? "" : "border-b"} border-gray-200`}
                                    ></div>
                                  )
                                })}
                                {/* Meetings */}
                                {dayMeetings.map((meeting) => {
                                  const top = getTimeSlotTop(meeting.time, timeRange.timeStartHour)
                                  const height = getMeetingHeight(meeting.duration)
                                  const available = timeRange.totalHours * 60 - (top + 2)
                                  const finalHeight = available > 0 ? Math.min(Math.max(height - 4, 28), available) : 0

                                  if (finalHeight <= 0) return null

                                  return (
                                    <Tooltip key={meeting.id}>
                                      <TooltipTrigger asChild>
                                        <div
                                          className={`absolute left-2 right-2 ${meeting.color} border rounded-md p-1.5 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all z-10`}
                                          style={{
                                            top: `${top + 2}px`,
                                            height: `${finalHeight}px`,
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
                                              Summary:
                                            </div>
                                            <div className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                                              {getShortSummary(meeting.aiSummary)}
                                            </div>
                                          </div>
                                          <div className="pt-2 border-t border-purple-200">
                                          <div className="text-xs font-semibold text-purple-700 mb-1">
                                            Join meeting:
                                          </div>
                                          {meeting.joinUrl ? (
                                            <a
                                              href={meeting.joinUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-xs text-blue-600 hover:underline leading-relaxed"
                                            >
                                              Click here
                                              <span className="text-xs text-gray-600"> ({meeting.title})</span>
                                            </a>
                                          ) : (
                                            <span className="text-xs text-gray-500">URL not available</span>
                                          )}
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
                                          Summary:
                                        </div>
                                        <div className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                                          {getShortSummary(meeting.aiSummary)}
                                        </div>
                                      </div>
                                      <div className="pt-2 border-t border-purple-200">
                                        <div className="text-xs font-semibold text-purple-700 mb-1">
                                          Join meeting:
                                        </div>
                                        {meeting.joinUrl ? (
                                          <a
                                            href={meeting.joinUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-blue-600 hover:underline leading-relaxed"
                                          >
                                            Click here
                                            <span className="text-xs text-gray-600"> ({meeting.title})</span>
                                          </a>
                                        ) : (
                                          <span className="text-xs text-gray-500">URL not available</span>
                                        )}
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
