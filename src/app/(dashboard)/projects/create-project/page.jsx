"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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
import { Upload, Calendar, Link2, X } from "lucide-react";
import toast from "react-hot-toast";

// Dummy data for team members
const teamMembers = [
    { id: "1", name: "System Saviour" },
    { id: "2", name: "AI Waiver" },
    { id: "3", name: "Design Enthusiast" },
    { id: "4", name: "Backend Wizard" },
    { id: "5", name: "Frontend Fanatic" },
];

const projectOwners = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Smith" },
    { id: "3", name: "Mike Johnson" },
    { id: "4", name: "Sarah Williams" },
    { id: "5", name: "David Brown" },
];

// Reusable File List Component
const FileList = ({ files, onRemove }) => {
    if (files.length === 0) return null;

    return (
        <div className="space-y-2">
            {files.map((file, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                    <span className="text-sm text-slate-700 truncate flex-1">
                        {file.name}
                    </span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onRemove(index)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
    );
};

export default function CreateProject() {
    const router = useRouter();
    const documentInputRef = useRef(null);
    const slaInputRef = useRef(null);
    const startDateRef = useRef(null);
    const endDateRef = useRef(null);

    const [formData, setFormData] = useState({
        vendorName: "",
        projectName: "",
        projectDescription: "",
        projectOwner: "",
        assignedTeam: "",
        startDate: "",
        endDate: "",
    });

    const [meetingLinks, setMeetingLinks] = useState([""]);
    const [documents, setDocuments] = useState([]);
    const [slaFiles, setSlaFiles] = useState([]);
    const [isDraggingDocuments, setIsDraggingDocuments] = useState(false);
    const [isDraggingSla, setIsDraggingSla] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleMeetingLinkChange = (index, value) => {
        const newLinks = [...meetingLinks];
        newLinks[index] = value;
        setMeetingLinks(newLinks);
    };

    const addMeetingLink = () => {
        setMeetingLinks([...meetingLinks, ""]);
    };

    const removeMeetingLink = (index) => {
        if (meetingLinks.length > 1) {
            setMeetingLinks(meetingLinks.filter((_, i) => i !== index));
        }
    };

    const handleDocumentUpload = (e) => {
        const files = Array.from(e.target.files);
        setDocuments((prev) => [...prev, ...files]);
    };

    const handleSlaUpload = (e) => {
        const files = Array.from(e.target.files);
        setSlaFiles((prev) => [...prev, ...files]);
    };

    const removeDocument = (index) => {
        setDocuments((prev) => prev.filter((_, i) => i !== index));
    };

    const removeSlaFile = (index) => {
        setSlaFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = useCallback((e, type) => {
        e.preventDefault();
        if (type === "documents") {
            setIsDraggingDocuments(true);
        } else {
            setIsDraggingSla(true);
        }
    }, []);

    const handleDragLeave = useCallback((type) => {
        if (type === "documents") {
            setIsDraggingDocuments(false);
        } else {
            setIsDraggingSla(false);
        }
    }, []);

    const handleDrop = useCallback((e, type) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        if (type === "documents") {
            setIsDraggingDocuments(false);
            setDocuments((prev) => [...prev, ...files]);
        } else {
            setIsDraggingSla(false);
            setSlaFiles((prev) => [...prev, ...files]);
        }
    }, []);


    const openDatePicker = useCallback((ref) => {
        ref.current?.showPicker?.() || ref.current?.click();
    }, []);

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            // Basic validation
            if (!formData.projectName || !formData.vendorName) {
                toast.error("Please fill in required fields");
                return;
            }
            console.log("Form Data:", formData);
            console.log("Meeting Links:", meetingLinks);
            console.log("Documents:", documents);
            console.log("SLA Files:", slaFiles);
            // Handle form submission here
            toast.success("Project created successfully!");
        },
        [formData, meetingLinks, documents, slaFiles]
    );

    return (
        <div className="">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Create New Project
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardContent className="p-4 sm:p-6 space-y-6">
                        {/* Project Details Section */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Project Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Vendor Name
                                    </label>
                                    <Input
                                        name="vendorName"
                                        value={formData.vendorName}
                                        onChange={handleInputChange}
                                        placeholder="e.g., G4 Marketing Campaign"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Project Name
                                    </label>
                                    <Input
                                        name="projectName"
                                        value={formData.projectName}
                                        onChange={handleInputChange}
                                        placeholder="e.g., G4 Marketing Campaign"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Project Description
                                </label>
                                <Textarea
                                    name="projectDescription"
                                    value={formData.projectDescription}
                                    onChange={handleInputChange}
                                    placeholder="Provide a brief overview of the project's goals, scope, and objectives. Our AI will use this to provide suggestions"
                                    className="min-h-32"
                                />
                            </div>
                        </div>

                        {/* Team & Stakeholders Section */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Team & Stakeholders
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Project Owner
                                    </label>
                                    <Select
                                        value={formData.projectOwner}
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                projectOwner: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Search by name or email" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projectOwners.map((member) => (
                                                <SelectItem
                                                    key={member.id}
                                                    value={member.id}
                                                >
                                                    {member.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Assign Team
                                    </label>
                                    <Select
                                        value={formData.assignedTeam}
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                assignedTeam: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Search by name or email" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teamMembers.map((member) => (
                                                <SelectItem
                                                    key={member.id}
                                                    value={member.id}
                                                >
                                                    {member.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Timeline & Priority Section */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Timeline & Priority
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Start Date
                                    </label>
                                    <div className="relative">
                                        <Input
                                            ref={startDateRef}
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            className="pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => openDatePicker(startDateRef)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-slate-600 transition-colors"
                                        >
                                            <Calendar className="h-4 w-4 text-primary" />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        End Date
                                    </label>
                                    <div className="relative">
                                        <Input
                                            ref={endDateRef}
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            className="pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => openDatePicker(endDateRef)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-slate-600 transition-colors"
                                        >
                                            <Calendar className="h-4 w-4 text-primary" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upload Meeting Link Section */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Upload meeting link here
                            </h2>
                            <div className="space-y-3">
                                {meetingLinks.map((link, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <div className="relative flex-1">
                                                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    type="url"
                                                    value={link}
                                                    onChange={(e) =>
                                                        handleMeetingLinkChange(
                                                            index,
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Upload meeting link here"
                                                    className="pl-10"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="primary"
                                                    onClick={async () => {
                                                        try {
                                                            const text =
                                                                await navigator.clipboard.readText();
                                                            handleMeetingLinkChange(
                                                                index,
                                                                text
                                                            );
                                                            toast.success(
                                                                "Link pasted successfully"
                                                            );
                                                        } catch (error) {
                                                            toast.error(
                                                                "Failed to paste from clipboard"
                                                            );
                                                        }
                                                    }}
                                                >
                                                    Paste
                                                </Button>
                                                {meetingLinks.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() =>
                                                            removeMeetingLink(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        {index ===
                                            meetingLinks.length - 1 && (
                                                <button
                                                    type="button"
                                                    onClick={addMeetingLink}
                                                    className="text-primary hover:underline cursor-pointer text-sm font-medium"
                                                >
                                                    + Add Another
                                                </button>
                                            )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upload Document Section */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Upload Document
                            </h2>
                            <div
                                className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${isDraggingDocuments
                                    ? "border-primary bg-primary/5"
                                    : "border-slate-300 bg-slate-50"
                                    }`}
                                onDragOver={(e) => handleDragOver(e, "documents")}
                                onDragLeave={() =>
                                    handleDragLeave("documents")
                                }
                                onDrop={(e) => handleDrop(e, "documents")}
                            >
                                <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                                <p className="text-sm text-slate-600 mb-2">
                                    Upload 10 files here. PDF, JPEG, PPT,
                                    DOCX, XLSX, CSV. Supported file formats.
                                </p>
                                <input
                                    ref={documentInputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpeg,.jpg,.ppt,.pptx,.docx,.xlsx,.csv"
                                    onChange={handleDocumentUpload}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={() =>
                                        documentInputRef.current?.click()
                                    }
                                    className="flex items-center gap-2 mx-auto"
                                >
                                    <Upload className="h-4 w-4" />
                                    Upload File
                                </Button>
                            </div>
                            <FileList files={documents} onRemove={removeDocument} />
                        </div>

                        {/* Upload SLA Section */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Upload service level agreements (SLA)
                            </h2>
                            <div
                                className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${isDraggingSla
                                    ? "border-primary bg-primary/5"
                                    : "border-slate-300 bg-slate-50"
                                    }`}
                                onDragOver={(e) => handleDragOver(e, "sla")}
                                onDragLeave={() => handleDragLeave("sla")}
                                onDrop={(e) => handleDrop(e, "sla")}
                            >
                                <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                                <p className="text-sm text-slate-600 mb-2">
                                    Max 100 MB files are allowed.
                                </p>
                                <input
                                    ref={slaInputRef}
                                    type="file"
                                    multiple
                                    onChange={handleSlaUpload}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={() => slaInputRef.current?.click()}
                                    className="flex items-center gap-2 mx-auto"
                                >
                                    <Upload className="h-4 w-4" />
                                    Upload File
                                </Button>
                            </div>
                            <FileList files={slaFiles} onRemove={removeSlaFile} />
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="w-full sm:w-auto cursor-pointer hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full sm:w-auto"
                    >
                        Create Project
                    </Button>
                </div>
            </form>
        </div>
    );
}