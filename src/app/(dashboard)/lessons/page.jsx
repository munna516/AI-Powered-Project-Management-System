"use client";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import DateFilter, { getDateRangeFromFilter } from "@/components/DateFilter/Datefilter";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FiSearch, FiEdit2, FiEye, FiX, FiDownload } from "react-icons/fi";
import toast from "react-hot-toast";
import Loading from "@/components/Loading/Loading";
import { apiGet, apiPatch } from "@/lib/api";

const formatDate = (value) => {
    if (!value) return "Not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const normalizeLesson = (lesson, index) => ({
    id: String(lesson?.id || index),
    projectId: String(lesson?.projectId || lesson?.project?.id || "Not available"),
    projectName:
        lesson?.projectName ||
        lesson?.project?.name ||
        "Not available",
    owner:
        lesson?.owner ||
        lesson?.clientName ||
        "Not available",
    mail: lesson?.mail || lesson?.email || "Not available",
    source: lesson?.source || "Not available",
    date: formatDate(lesson?.loggedDate || lesson?.created_at || lesson?.createdAt),
    rawDate: lesson?.loggedDate || lesson?.created_at || lesson?.createdAt || null,
    logger: lesson?.source || "Not available",
    title: lesson?.title || "Not available",
    client: lesson?.clientName || "Not available",
    description: lesson?.description || "Not available",
});

export default function Lessons() {
    const queryClient = useQueryClient();
    const [searchValue, setSearchValue] = useState("");
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const [dateFilterState, setDateFilterState] = useState({
        filter: "all",
        startDate: null,
        endDate: null,
    });

    const {
        data: lessonsResponse,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["lesson-learn"],
        queryFn: async () => {
            try {
                return await apiGet("/api/project-manager/lesson-learn/all");
            } catch {
                return apiGet("/api/project-manager/lesson-learn");
            }
        },
    });

    const lessons = useMemo(() => {
        const rawLessons = Array.isArray(lessonsResponse?.data)
            ? lessonsResponse.data
            : Array.isArray(lessonsResponse?.data?.data)
                ? lessonsResponse.data.data
                : [];

        return rawLessons.map(normalizeLesson);
    }, [lessonsResponse]);

    const updateLessonMutation = useMutation({
        mutationFn: ({ lessonId, payload }) =>
            apiPatch(`/api/project-manager/lesson-learn/${lessonId}`, payload),
        onSuccess: async () => {
            toast.success("Lesson learned updated successfully!");
            await queryClient.invalidateQueries({ queryKey: ["lesson-learn"] });
            setIsEditMode(false);
        },
        onError: (mutationError) => {
            toast.error(mutationError?.message || "Failed to update lesson learned.");
        },
    });

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
                    lesson.logger.toLowerCase().includes(searchLower) ||
                    lesson.title.toLowerCase().includes(searchLower) ||
                    lesson.description.toLowerCase().includes(searchLower)
            );
        }

        if (dateFilterState.filter !== "all") {
            const { start, end } = getDateRangeFromFilter(
                dateFilterState.filter,
                dateFilterState.startDate,
                dateFilterState.endDate
            );

            if (start && end) {
                filtered = filtered.filter((lesson) => {
                    if (!lesson.rawDate) return true;
                    const lessonDate = new Date(lesson.rawDate);
                    if (Number.isNaN(lessonDate.getTime())) return true;
                    return lessonDate >= start && lessonDate <= end;
                });
            }
        }

        return filtered;
    }, [searchValue, lessons, dateFilterState]);

    const handleViewLesson = (id) => {
        const lesson = lessons.find((l) => l.id === id);
        if (lesson) {
            setSelectedLesson(lesson);
            setEditedData({
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
            setSelectedLesson({
                ...selectedLesson,
                description: editedData.description,
            });
            updateLessonMutation.mutate({
                lessonId: selectedLesson.id,
                payload: {
                    description: editedData.description,
                },
            });
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

    if (isLoading) {
        return <Loading />;
    }

    if (isError) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-sm text-slate-500 sm:text-base">
                    {error?.message || "Failed to load lessons learned."}
                </CardContent>
            </Card>
        );
    }

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
                <DateFilter
                    onFilterChange={setDateFilterState}
                    initialFilter="all"
                />

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
            {dateFilterState.filter === "custom" && dateFilterState.startDate && dateFilterState.endDate && (
                <div className="flex items-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 w-fit">
                    <span>{dateFilterState.startDate} - {dateFilterState.endDate}</span>
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
                                        Lessons Learned by Logger
                                    </TableHead>
                                    <TableHead className="py-3 px-4 text-white font-semibold">
                                        Date
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
                                    filteredLessons.map((lesson, index) => (
                                        <TableRow
                                            key={lesson.id}
                                            className="border-b border-slate-100 hover:bg-slate-50"
                                        >
                                            <TableCell className="py-3 px-4 text-slate-800">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-slate-800">
                                                {lesson.projectName}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-slate-800">
                                                {lesson.owner}
                                            </TableCell>


                                            <TableCell className="py-3 px-4 text-slate-800">
                                                {lesson.logger}
                                            </TableCell>
                                            <TableCell className="py-3 px-4 text-slate-800">
                                                {lesson.date}
                                            </TableCell>
                                            <TableCell className="py-3 px-4">
                                                <button
                                                    onClick={() => handleViewLesson(lesson.id)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#6051E2]/20 bg-[#6051E2]/10 text-[#6051E2] transition-colors hover:bg-[#6051E2] hover:text-white cursor-pointer"
                                                    aria-label="View lesson"
                                                    title="View lesson"
                                                >
                                                    <FiEye className="h-4 w-4" />
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
                                {filteredLessons.map((lesson, index) => (
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
                                                    ID: {index + 1}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleViewLesson(lesson.id)}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#6051E2]/20 bg-[#6051E2]/10 text-[#6051E2] transition-colors hover:bg-[#6051E2] hover:text-white cursor-pointer"
                                                aria-label="View lesson"
                                                title="View lesson"
                                            >
                                                <FiEye className="h-4 w-4" />
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
                                <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 pr-8 flex-1">
                                    {selectedLesson?.title || ""}
                                </DialogTitle>
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
                                <p className="text-sm font-medium text-slate-900">
                                    {selectedLesson?.projectName || ""}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-600 mb-1">Logged Date</p>
                                <p className="text-sm font-medium text-slate-900">
                                    {selectedLesson?.date || ""}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-600 mb-1">Clients</p>
                                <p className="text-sm font-medium text-slate-900">
                                    {selectedLesson?.client || ""}
                                </p>
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
                                    disabled={updateLessonMutation.isPending}
                                    className="bg-[#6051E2] hover:bg-[#4a3db8] text-white px-6 py-2 cursor-pointer"
                                >
                                    {updateLessonMutation.isPending ? "Saving..." : "Save"}
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
