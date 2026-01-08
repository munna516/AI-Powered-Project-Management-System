"use client";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FiSearch, FiArrowLeft, FiArrowRight, FiEdit2, FiX, FiDownload } from "react-icons/fi";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader/PageHeader";
import toast from "react-hot-toast";

// Dummy data for Lessons Learned
const lessonsData = [
    {
        id: 1,
        projectId: "654645",
        projectName: "NexaPay(05-46-45)",
        owner: "Arlene McCoy",
        mail: "abc@gm..",
        date: "28 Nov, 2025",
        logger: "Email",
        lessonLearned: "view",
        title: "Communication Delays Impacted Project Timeline",
        client: "Mr Mirja",
        description: "During the user testing phase, we identified significant communication gaps between the design and development teams. Feedback from designers was not relayed to developers in a timely manner, causing rework and extending the project timeline by approximately two weeks. Implementing a daily stand-up call and using a shared project management board for real-time updates could mitigate this issue in future projects.",
    },
    {
        id: 2,
        projectId: "654645",
        projectName: "Fit-loop",
        owner: "Albert Flores",
        mail: "abc@gm..",
        date: "20 Nov, 2025",
        logger: "Meeting notes",
        lessonLearned: "view",
        title: "Resource Allocation Challenges",
        client: "Mr Smith",
        description: "The project faced delays due to insufficient resource allocation during peak development phases. Better planning and resource forecasting could have prevented these issues.",
    },
    {
        id: 3,
        projectId: "654645",
        projectName: "ShopEase",
        owner: "Esther Howard",
        mail: "abc@gm..",
        date: "20 Nov, 2025",
        logger: "Recording",
        lessonLearned: "view",
        title: "Scope Creep Management",
        client: "Ms Johnson",
        description: "Uncontrolled scope changes led to timeline extensions. Implementing stricter change control processes would help manage future projects more effectively.",
    },
    {
        id: 4,
        projectId: "457832",
        projectName: "EduSphere",
        owner: "Cameron Williamson",
        mail: "abc@gm..",
        date: "20 Nov, 2025",
        logger: "Meeting transcript",
        lessonLearned: "view",
        title: "Testing Phase Optimization",
        client: "Dr Brown",
        description: "Early integration of testing phases helped identify issues sooner. This approach should be adopted for all future projects.",
    },
    {
        id: 5,
        projectId: "487525",
        projectName: "Foodio",
        owner: "Guy Hawkins",
        mail: "abc@gm..",
        date: "20 Nov, 2025",
        logger: "Attachment",
        lessonLearned: "view",
        title: "Client Communication Best Practices",
        client: "Mr Davis",
        description: "Regular client updates and transparent communication improved project satisfaction and reduced revision cycles.",
    },
    {
        id: 6,
        projectId: "654645",
        projectName: "Eventify",
        owner: "Savannah Nguyen",
        mail: "abc@gm..",
        date: "20 Nov, 2025",
        logger: "Email",
        lessonLearned: "view",
        title: "Technology Stack Selection",
        client: "Ms Wilson",
        description: "Choosing the right technology stack early in the project prevented major refactoring later. This decision should be made during the planning phase.",
    },
    {
        id: 7,
        projectId: "564657",
        projectName: "FinPro",
        owner: "Kristin Watson",
        mail: "abc@gm..",
        date: "20 Nov, 2025",
        logger: "Meeting notes",
        lessonLearned: "view",
        title: "Documentation Importance",
        client: "Mr Taylor",
        description: "Comprehensive documentation throughout the project lifecycle significantly reduced onboarding time for new team members and improved knowledge transfer.",
    },
];

export default function Lessons() {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState("");
    const [lessons, setLessons] = useState(lessonsData);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const [dateFilter, setDateFilter] = useState("all");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");

    const handleFilterChange = (value) => {
        setDateFilter(value);
        if (value !== "custom") {
            setCustomStartDate("");
            setCustomEndDate("");
        }
    };

    const formatDateRange = () => {
        if (dateFilter === "custom" && customStartDate && customEndDate) {
            return `${customStartDate} - ${customEndDate}`;
        } else if (dateFilter === "today") {
            return "Today";
        } else if (dateFilter === "7days") {
            return "Last 7 Days";
        } else if (dateFilter === "month") {
            return "This Month";
        }
        return "All Time";
    };

    const filteredLessons = useMemo(() => {
        let filtered = lessons;

        // Search filtering
        if (searchValue.trim()) {
            const searchLower = searchValue.toLowerCase();
            filtered = filtered.filter(
                (lesson) =>
                    lesson.projectId.toLowerCase().includes(searchLower) ||
                    lesson.projectName.toLowerCase().includes(searchLower) ||
                    lesson.owner.toLowerCase().includes(searchLower) ||
                    lesson.mail.toLowerCase().includes(searchLower) ||
                    lesson.date.toLowerCase().includes(searchLower) ||
                    lesson.logger.toLowerCase().includes(searchLower)
            );
        }

        // Date filtering (based on date field)
        if (dateFilter !== "all") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            filtered = filtered.filter((lesson) => {
                // Parse date (format: "20 Nov, 2025")
                const lessonDate = new Date(lesson.date);
                if (isNaN(lessonDate.getTime())) return true; // Skip invalid dates

                if (dateFilter === "today") {
                    return lessonDate.toDateString() === today.toDateString();
                } else if (dateFilter === "7days") {
                    const sevenDaysAgo = new Date(today);
                    sevenDaysAgo.setDate(today.getDate() - 7);
                    return lessonDate >= sevenDaysAgo && lessonDate <= today;
                } else if (dateFilter === "month") {
                    return lessonDate.getMonth() === today.getMonth() &&
                        lessonDate.getFullYear() === today.getFullYear();
                } else if (dateFilter === "custom" && customStartDate && customEndDate) {
                    const start = new Date(customStartDate);
                    const end = new Date(customEndDate);
                    end.setHours(23, 59, 59, 999);
                    return lessonDate >= start && lessonDate <= end;
                }
                return true;
            });
        }

        return filtered;
    }, [searchValue, lessons, dateFilter, customStartDate, customEndDate]);

    const handleViewLesson = (id) => {
        const lesson = lessons.find((l) => l.id === id);
        if (lesson) {
            setSelectedLesson(lesson);
            setEditedData({
                title: lesson.title,
                projectName: lesson.projectName,
                date: lesson.date,
                client: lesson.client,
                description: lesson.description,
            });
            setIsEditMode(false);
            setIsModalOpen(true);
        }
    };

    const handleEdit = () => {
        setIsEditMode(true);
    };

    const handleSave = () => {
        if (editedData && selectedLesson) {
            // Update the lesson data
            setLessons((prevLessons) =>
                prevLessons.map((lesson) =>
                    lesson.id === selectedLesson.id
                        ? {
                            ...lesson,
                            ...editedData,
                        }
                        : lesson
                )
            );
            // Update selected lesson to reflect changes
            setSelectedLesson({
                ...selectedLesson,
                ...editedData,
            });
            toast.success("Lesson learned updated successfully!");
            setIsEditMode(false);
        }
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setSelectedLesson(null);
        setEditedData(null);
    };

    const handleExport = () => {
        toast.success("Lessons learned data exported successfully!");
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">Lesson Learned</h1>
                    <p className="text-sm text-slate-500 mt-3">AI powered insights for all your projects</p>
                </div>

                {/* Search Bar */}
                <div className="relative mt-6">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="search lesson learned"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="pl-10 py-7 bg-white border-[#6051E2] !text-md md:!text-lg placeholder:!text-md md:placeholder:!text-lg"
                    />
                </div>
            </div>

            {/* Date Filter and Export Button */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between">
                {/* Date Filter - Left Side */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                    <div className="flex flex-col gap-2 min-w-[200px] sm:min-w-[220px]">
                        <label className="text-xs sm:text-sm font-medium text-slate-700">
                            Filter by Date
                        </label>
                        <Select value={dateFilter} onValueChange={handleFilterChange}>
                            <SelectTrigger className="h-9 sm:h-10 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="7days">Last 7 Days</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                                <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Custom Date Range Inputs */}
                    {dateFilter === "custom" && (
                        <>
                            <div className="flex flex-col gap-1 min-w-[140px]">
                                <label className="text-xs text-slate-600">Start Date</label>
                                <Input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="h-9 sm:h-10 text-sm"
                                />
                            </div>
                            <div className="flex flex-col gap-1 min-w-[140px]">
                                <label className="text-xs text-slate-600">End Date</label>
                                <Input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    min={customStartDate}
                                    className="h-9 sm:h-10 text-sm"
                                />
                            </div>
                        </>
                    )}

                    {/* Date Range Display for preset filters */}
                    {dateFilter !== "custom" && dateFilter !== "all" && (
                        <div className="flex items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 min-w-[180px] sm:min-w-[200px] h-9 sm:h-10">
                            <span className="text-xs sm:text-sm">{formatDateRange()}</span>
                        </div>
                    )}
                </div>

                {/* Export Button - Right Side */}
                <Button
                    onClick={handleExport}
                    className="bg-[#6051E2] hover:bg-[#4a3db8] text-white px-4 py-2 h-9 sm:h-10 text-sm font-medium cursor-pointer flex items-center gap-2 w-full sm:w-auto"
                >
                    <FiDownload className="h-4 w-4" />
                    Export
                </Button>
            </div>

            {/* Show selected custom range */}
            {dateFilter === "custom" && customStartDate && customEndDate && (
                <div className="flex items-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 w-fit">
                    <span>{formatDateRange()}</span>
                </div>
            )}

            {/* Lessons Table */}
            <Card className="overflow-hidden mt-4 sm:mt-6">
                <CardContent className="p-0">
                    {/* Desktop & Large Tablet Table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-[#6051E2] text-white">
                                <TableRow className="border-b-0 hover:bg-[#6051E2]">
                                    <TableHead className="py-3 px-4 text-white font-semibold">
                                        Project ID
                                    </TableHead>
                                    <TableHead className="py-3 px-4 text-white font-semibold">
                                        Project Name
                                    </TableHead>
                                    <TableHead className="py-3 px-4 text-white font-semibold">
                                        Owner
                                    </TableHead>
                                    <TableHead className="py-3 px-4 text-white font-semibold">
                                        Mail
                                    </TableHead>
                                    <TableHead className="py-3 px-4 text-white font-semibold">
                                        Date
                                    </TableHead>
                                    <TableHead className="py-3 px-4 text-white font-semibold">
                                        Lessons Learned by Logger
                                    </TableHead>
                                    <TableHead className="py-3 px-4 text-white font-semibold">
                                        Lesson Learned
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLessons.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-8 text-slate-500"
                                        >
                                            No lessons found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLessons.map((lesson) => (
                                        <TableRow
                                            key={lesson.id}
                                            className="border-b border-slate-100 hover:bg-slate-50"
                                        >
                                            <TableCell className="py-3 px-4 text-slate-800">
                                                {lesson.projectId}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-slate-800">
                                                {lesson.projectName}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-slate-800">
                                                {lesson.owner}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-slate-800">
                                                {lesson.mail}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-slate-800">
                                                {lesson.date}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-slate-800">
                                                {lesson.logger}
                                            </TableCell>
                                            <TableCell className="py-3 px-4">
                                                <button
                                                    onClick={() => handleViewLesson(lesson.id)}
                                                    className="text-[#6051E2] hover:text-[#4a3db8] hover:underline transition-colors cursor-pointer font-medium"
                                                >
                                                    {lesson.lessonLearned}
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile & Tablet Cards */}
                    <div className="lg:hidden">
                        {filteredLessons.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                No lessons found
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-200">
                                {filteredLessons.map((lesson) => (
                                    <div
                                        key={lesson.id}
                                        className="p-4 space-y-3 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {lesson.projectName}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    ID: {lesson.projectId}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleViewLesson(lesson.id)}
                                                className="text-[#6051E2] hover:text-[#4a3db8] hover:underline transition-colors cursor-pointer font-medium text-sm"
                                            >
                                                {lesson.lessonLearned}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <p className="text-slate-500">Owner</p>
                                                <p className="text-slate-800 font-medium">
                                                    {lesson.owner}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Mail</p>
                                                <p className="text-slate-800 font-medium">
                                                    {lesson.mail}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Date</p>
                                                <p className="text-slate-800 font-medium">
                                                    {lesson.date}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Logger</p>
                                                <p className="text-slate-800 font-medium">
                                                    {lesson.logger}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Lesson Detail Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden rounded-xl" showCloseButton={false}>
                    <div className="bg-[#EFEEFC] p-6">
                        <DialogHeader className="relative">
                            <div className="flex items-start justify-between gap-4">
                                {isEditMode ? (
                                    <Input
                                        value={editedData?.title || ""}
                                        onChange={(e) =>
                                            setEditedData({
                                                ...editedData,
                                                title: e.target.value,
                                            })
                                        }
                                        className="text-xl sm:text-2xl font-bold text-slate-900 bg-white border-slate-300 flex-1"
                                    />
                                ) : (
                                    <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 pr-8 flex-1">
                                        {selectedLesson?.title || ""}
                                    </DialogTitle>
                                )}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {!isEditMode && (
                                        <button
                                            onClick={handleEdit}
                                            className="p-2 hover:bg-white/50 rounded-lg transition-colors cursor-pointer"
                                            title="Edit"
                                        >
                                            <FiEdit2 className="h-5 w-5 text-slate-600" />
                                        </button>
                                    )}
                                    <button
                                        onClick={handleClose}
                                        className="p-2 hover:bg-white/50 rounded-lg transition-colors cursor-pointer"
                                        title="Close"
                                    >
                                        <FiX className="h-5 w-5 text-slate-600" />
                                    </button>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Project Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                            <div>
                                <p className="text-xs text-slate-600 mb-1">Project Name</p>
                                {isEditMode ? (
                                    <Input
                                        value={editedData?.projectName || ""}
                                        onChange={(e) =>
                                            setEditedData({
                                                ...editedData,
                                                projectName: e.target.value,
                                            })
                                        }
                                        className="bg-white border-slate-300"
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-slate-900">
                                        {selectedLesson?.projectName || ""}
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-slate-600 mb-1">Logged Date</p>
                                {isEditMode ? (
                                    <Input
                                        value={editedData?.date || ""}
                                        onChange={(e) =>
                                            setEditedData({
                                                ...editedData,
                                                date: e.target.value,
                                            })
                                        }
                                        className="bg-white border-slate-300"
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-slate-900">
                                        {selectedLesson?.date || ""}
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-slate-600 mb-1">Clients</p>
                                {isEditMode ? (
                                    <Input
                                        value={editedData?.client || ""}
                                        onChange={(e) =>
                                            setEditedData({
                                                ...editedData,
                                                client: e.target.value,
                                            })
                                        }
                                        className="bg-white border-slate-300"
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-slate-900">
                                        {selectedLesson?.client || ""}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="p-6">
                        <p className="text-sm font-medium text-slate-700 mb-3">Description</p>
                        {isEditMode ? (
                            <Textarea
                                value={editedData?.description || ""}
                                onChange={(e) =>
                                    setEditedData({
                                        ...editedData,
                                        description: e.target.value,
                                    })
                                }
                                className="min-h-[150px] bg-white border-slate-300"
                                placeholder="Enter description..."
                            />
                        ) : (
                            <div className="min-h-[150px] p-4 bg-slate-50 rounded-md border border-slate-200">
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {selectedLesson?.description || ""}
                                </p>
                            </div>
                        )}

                        {/* Save Button */}
                        {isEditMode && (
                            <div className="flex justify-end mt-6">
                                <Button
                                    onClick={handleSave}
                                    className="bg-[#6051E2] hover:bg-[#4a3db8] text-white px-6 py-2 cursor-pointer"
                                >
                                    Save
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
