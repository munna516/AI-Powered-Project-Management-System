"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FiEdit,
    FiPaperclip,
    FiLink,
    FiTrash2,
    FiFile,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { BsEmojiSmile } from "react-icons/bs";
import { FiFileText } from "react-icons/fi";

export default function GenerateEmail() {
    const [emailContent, setEmailContent] = useState("");
    const [prompt, setPrompt] = useState("");
    const [tone, setTone] = useState("Professional");
    const [length, setLength] = useState("Short");
    const [selectedContexts, setSelectedContexts] = useState([]);

    const contextOptions = [
        { id: "project-data", label: "Project data" },
        { id: "meeting-notes", label: "Meeting notes" },
        { id: "last-email", label: "Last email" },
        { id: "add-file", label: "Add file" },
    ];

    const toggleContext = (id) => {
        setSelectedContexts((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleGenerate = () => {
        // Handle AI email generation
        console.log("Generating email with:", { prompt, tone, length, selectedContexts });
    };

    return (
        <div className="space-y-6 ">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Compose your email...
            </h1>

            {/* Email Composition Area */}
            <Card className="bg-white">
                <CardContent className="p-4 sm:p-6">
                    <div className="relative">
                        <Textarea
                            value={emailContent}
                            onChange={(e) => setEmailContent(e.target.value)}
                            placeholder="Start typing your email..."
                            className="min-h-[200px] sm:min-h-[250px] pr-24 pb-12 text-sm sm:text-base"
                        />
                        <Button
                            className="absolute bottom-4 right-4 bg-[#6051E2] hover:bg-[#4a3db8] text-white px-4 py-2 flex items-center gap-2 cursor-pointer"
                        >
                            <FiEdit className="h-4 w-4" />
                            <span className="text-sm">Compose</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* AI Draft Section */}
            <Card className="bg-[#EFEEFC] border-[#6051E2]/20">
                <CardContent className="p-4 sm:p-6 space-y-6">
                    {/* AI Draft Header */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#6051E2] rounded-lg flex items-center justify-center flex-shrink-0">
                            <HiOutlineSparkles className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">AI Draft</h2>
                    </div>

                    {/* Use context from */}
                    <div>
                        <p className="text-sm font-medium text-slate-700 mb-3">Use context from:</p>
                        <div className="flex flex-wrap gap-3">
                            {contextOptions.map((option) => {
                                const isSelected = selectedContexts.includes(option.id);
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => toggleContext(option.id)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${isSelected
                                            ? "bg-[#6051E2] text-white"
                                            : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Prompt */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Prompt
                        </label>
                        <Input
                            type="text"
                            placeholder="e.g., Draft a follow-up email asking for feedback"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Tone and Length */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Tone
                            </label>
                            <Select value={tone} onValueChange={setTone}>
                                <SelectTrigger className="w-full bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Professional">Professional</SelectItem>
                                    <SelectItem value="Casual">Casual</SelectItem>
                                    <SelectItem value="Friendly">Friendly</SelectItem>
                                    <SelectItem value="Formal">Formal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Length
                            </label>
                            <Select value={length} onValueChange={setLength}>
                                <SelectTrigger className="w-full bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Short">Short</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Long">Long</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-4 pt-2">
                        <Button
                            onClick={handleGenerate}
                            className="bg-[#6051E2] hover:bg-[#4a3db8] text-white px-6 py-3 flex items-center gap-2 cursor-pointer"
                        >
                            <FiFileText className="h-5 w-5" />
                            <span>Generate</span>
                        </Button>

                        <div className="flex items-center gap-3">
                            <button
                                className="p-2 hover:bg-white/50 rounded-lg transition-colors cursor-pointer"
                                title="Attach file"
                            >
                                <FiPaperclip className="h-5 w-5 text-slate-600" />
                            </button>
                            <button
                                className="p-2 hover:bg-white/50 rounded-lg transition-colors cursor-pointer"
                                title="Insert link"
                            >
                                <FiLink className="h-5 w-5 text-slate-600" />
                            </button>
                            <button
                                className="p-2 hover:bg-white/50 rounded-lg transition-colors cursor-pointer"
                                title="Insert emoji"
                            >
                                <BsEmojiSmile className="h-5 w-5 text-slate-600" />
                            </button>
                            <button
                                className="p-2 hover:bg-white/50 rounded-lg transition-colors cursor-pointer"
                                title="Delete"
                            >
                                <FiTrash2 className="h-5 w-5 text-slate-600" />
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
