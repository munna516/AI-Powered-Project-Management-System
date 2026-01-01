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
import { FiSearch, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader/PageHeader";

// Dummy data for Lessons Learned
const lessonsData = [
    { id: 1, projectId: "654645", projectName: "NexaPay", owner: "Arlene McCoy", mail: "abc@gm..", date: "20 Nov, 2025", logger: "Email", lessonLearned: "view" },
    { id: 2, projectId: "654645", projectName: "Fit-loop", owner: "Albert Flores", mail: "abc@gm..", date: "20 Nov, 2025", logger: "Meeting notes", lessonLearned: "view" },
    { id: 3, projectId: "654645", projectName: "ShopEase", owner: "Esther Howard", mail: "abc@gm..", date: "20 Nov, 2025", logger: "Recording", lessonLearned: "view" },
    { id: 4, projectId: "457832", projectName: "EduSphere", owner: "Cameron Williamson", mail: "abc@gm..", date: "20 Nov, 2025", logger: "Meeting transcript", lessonLearned: "view" },
    { id: 5, projectId: "487525", projectName: "Foodio", owner: "Guy Hawkins", mail: "abc@gm..", date: "20 Nov, 2025", logger: "Attachment", lessonLearned: "view" },
    { id: 6, projectId: "654645", projectName: "Eventify", owner: "Savannah Nguyen", mail: "abc@gm..", date: "20 Nov, 2025", logger: "Email", lessonLearned: "view" },
    { id: 7, projectId: "564657", projectName: "FinPro", owner: "Kristin Watson", mail: "abc@gm..", date: "20 Nov, 2025", logger: "Meeting notes", lessonLearned: "view" },

];

export default function Lessons() {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState("");

    const filteredLessons = useMemo(() => {
        if (!searchValue.trim()) return lessonsData;

        const searchLower = searchValue.toLowerCase();
        return lessonsData.filter(
            (lesson) =>
                lesson.projectId.toLowerCase().includes(searchLower) ||
                lesson.projectName.toLowerCase().includes(searchLower) ||
                lesson.owner.toLowerCase().includes(searchLower) ||
                lesson.mail.toLowerCase().includes(searchLower) ||
                lesson.date.toLowerCase().includes(searchLower) ||
                lesson.logger.toLowerCase().includes(searchLower)
        );
    }, [searchValue]);

    const handleViewLesson = (id) => {
        // Navigate to lesson detail page or open modal
        console.log("View lesson:", id);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <PageHeader
                title="Lesson Learned"
                description="AI powered insights for all your projects"
                searchPlaceholder="search lesson learned"
                searchValue={searchValue}
                onSearchChange={(e) => setSearchValue(e.target.value)}
            />

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
        </div>
    );
}
