"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import Loading from "@/components/Loading/Loading";
import { apiGet, apiPatch, apiPost, getStoredUser } from "@/lib/api";

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

const normalizeTeam = (team, index) => ({
    id: String(team?.id || team?.teamId || index),
    name: team?.name || team?.teamName || `Team ${index + 1}`,
});

const getProjectAssignedTeamId = (project) =>
    String(
        project?.assignTeamId ||
        project?.assignTeam?.id ||
        project?.assignTeam?.teamId ||
        ""
    );

export default function CreateProject() {
    const router = useRouter();
    const initializedProjectRef = useRef("");
    const [projectId, setProjectId] = useState("");
    const documentInputRef = useRef(null);
    const startDateRef = useRef(null);
    const endDateRef = useRef(null);
    const isEditMode = Boolean(projectId);
    const currentUser = useMemo(() => getStoredUser(), []);
    const currentUserValue = useMemo(
        () =>
            String(
                currentUser?.id ||
                currentUser?._id ||
                currentUser?.userId ||
                currentUser?.email ||
                ""
            ),
        [currentUser]
    );
    const currentUserName = useMemo(
        () =>
            [currentUser?.firstName, currentUser?.lastName]
                .filter(Boolean)
                .join(" ")
                .trim() || currentUser?.name || currentUser?.email || "",
        [currentUser]
    );

    const [formData, setFormData] = useState({
        vendorName: "",
        projectName: "",
        projectDescription: "",
        projectOwner: "",
        currentUser: currentUserName,
        assignedTeam: "",
        startDate: "",
        endDate: "",
    });

    const [meetingLinks, setMeetingLinks] = useState([""]);
    const [documents, setDocuments] = useState([]);
    const [isDraggingDocuments, setIsDraggingDocuments] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        setProjectId(params.get("projectId") || "");
    }, []);

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            projectOwner: currentUserValue,
            currentUser: currentUserName,
        }));
    }, [currentUserName, currentUserValue]);

    const { data: teamsResponse, isLoading: isTeamsLoading } = useQuery({
        queryKey: ["project-teams"],
        queryFn: () => apiGet("/api/project-manager/team/all"),
    });

    const teamOptions = useMemo(() => {
        const rawTeams = Array.isArray(teamsResponse?.data)
            ? teamsResponse.data
            : Array.isArray(teamsResponse?.data?.data)
                ? teamsResponse.data.data
                : [];

        return rawTeams.map((team, index) => normalizeTeam(team, index));
    }, [teamsResponse]);

    const {
        data: projectDetails,
        isLoading: isProjectDetailsLoading,
        isError: isProjectDetailsError,
        error: projectDetailsError,
    } = useQuery({
        queryKey: ["project-details", projectId],
        enabled: isEditMode,
        queryFn: async () => {
            try {
                const response = await apiGet(`/api/project-manager/project-management/${projectId}`);
                return response?.data?.data || response?.data || response;
            } catch {
                const response = await apiGet("/api/project-manager/project-management/my-projects");
                const rawProjects = Array.isArray(response?.data)
                    ? response.data
                    : Array.isArray(response?.data?.data)
                        ? response.data.data
                        : [];

                const project = rawProjects.find((item) => String(item.id) === String(projectId));
                if (!project) {
                    throw new Error("Project not found.");
                }
                return project;
            }
        },
    });

    const createProjectMutation = useMutation({
        mutationFn: (payload) =>
            apiPost("/api/project-manager/project-management/create", payload),
        onSuccess: (response) => {
            toast.success("Project created successfully!");
            router.push("/projects");
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to create project.");
        },
    });

    const updateProjectMutation = useMutation({
        mutationFn: ({ id, payload }) =>
            apiPatch(`/api/project-manager/project-management/${id}`, payload),
        onSuccess: (response) => {
            toast.success(response?.message || "Project updated successfully!");
            router.push("/projects");
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to update project.");
        },
    });

    useEffect(() => {
        if (!projectDetails) return;
        if (initializedProjectRef.current === String(projectDetails.id)) return;

        setFormData((prev) => ({
            ...prev,
            vendorName: projectDetails.vendorName || "",
            projectName: projectDetails.name || "",
            projectDescription: projectDetails.description || "",
            projectOwner: String(
                projectDetails.projectOwnerId ||
                projectDetails.managerId ||
                currentUserValue ||
                ""
            ),
            currentUser:
                [projectDetails.manager?.firstName, projectDetails.manager?.lastName]
                    .filter(Boolean)
                    .join(" ")
                    .trim() || currentUserName,
            assignedTeam: getProjectAssignedTeamId(projectDetails),
            startDate: projectDetails.startDate
                ? new Date(projectDetails.startDate).toISOString().slice(0, 10)
                : "",
            endDate: projectDetails.endDate
                ? new Date(projectDetails.endDate).toISOString().slice(0, 10)
                : "",
        }));

        setMeetingLinks(
            Array.isArray(projectDetails.meetings) && projectDetails.meetings.length > 0
                ? projectDetails.meetings.map((meeting) => meeting.meetingUrl || "")
                : [""]
        );

        setDocuments(
            Array.isArray(projectDetails.documents)
                ? projectDetails.documents.map((document) => ({
                    name: document.fileName || "document",
                    existing: true,
                    fileUrl: document.fileUrl || "",
                }))
                : []
        );
        initializedProjectRef.current = String(projectDetails.id);
    }, [currentUserName, currentUserValue, projectDetails]);

    useEffect(() => {
        if (!projectDetails || formData.assignedTeam) return;
        const initialTeamId = getProjectAssignedTeamId(projectDetails);
        if (!initialTeamId) return;

        const matchedTeam = teamOptions.find(
            (team) => String(team.id) === String(initialTeamId)
        );

        if (matchedTeam) {
            setFormData((prev) => ({
                ...prev,
                assignedTeam: matchedTeam.id,
            }));
        }
    }, [formData.assignedTeam, projectDetails, teamOptions]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
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

    const removeDocument = (index) => {
        setDocuments((prev) => prev.filter((_, i) => i !== index));
    };


    const handleDragOver = useCallback((e, type) => {
        e.preventDefault();
        if (type === "documents") {
            setIsDraggingDocuments(true);
        }
    }, []);

    const handleDragLeave = useCallback((type) => {
        if (type === "documents") {
            setIsDraggingDocuments(false);
        }
    }, []);

    const handleDrop = useCallback((e, type) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        if (type === "documents") {
            setIsDraggingDocuments(false);
            setDocuments((prev) => [...prev, ...files]);
        }
    }, []);


    const openDatePicker = useCallback((ref) => {
        ref.current?.showPicker?.() || ref.current?.click();
    }, []);

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();

            const nextErrors = {};

            if (!formData.vendorName.trim()) nextErrors.vendorName = "Vendor name is required";
            if (!formData.projectName.trim()) nextErrors.projectName = "Project name is required";
            if (!formData.projectOwner) nextErrors.projectOwner = "Project manager is required";
            if (!formData.assignedTeam) nextErrors.assignedTeam = "Assigned team is required";
            if (!formData.startDate) nextErrors.startDate = "Start date is required";

            setErrors(nextErrors);

            if (Object.keys(nextErrors).length > 0) {
                toast.error("Please fill in required fields");
                return;
            }

            const basePayload = {
                name: formData.projectName.trim(),
                description: formData.projectDescription.trim(),
                vendorName: formData.vendorName.trim(),
                startDate: new Date(formData.startDate).toISOString(),
                assignTeamId:
                    formData.assignedTeam || getProjectAssignedTeamId(projectDetails),
            };

            if (formData.endDate) {
                basePayload.endDate = new Date(formData.endDate).toISOString();
            }

            if (isEditMode) {
                updateProjectMutation.mutate({
                    id: projectId,
                    payload: {
                        ...basePayload,
                        status: projectDetails?.status || "IN_PROGRESS",
                    },
                });
            } else {
                const payload = new FormData();
                payload.append("name", basePayload.name);
                payload.append("description", basePayload.description);
                payload.append("vendorName", basePayload.vendorName);
                payload.append("startDate", basePayload.startDate);
                payload.append("assignTeamId", basePayload.assignTeamId);

                if (basePayload.endDate) {
                    payload.append("endDate", basePayload.endDate);
                }

                meetingLinks
                    .map((link) => link.trim())
                    .filter(Boolean)
                    .forEach((link) => payload.append("meetings", link));

                documents.forEach((file) => {
                    if (file instanceof File) {
                        payload.append("documents", file);
                    }
                });

                createProjectMutation.mutate(payload);
            }
        },
        [createProjectMutation, documents, formData, isEditMode, meetingLinks, projectDetails?.status, projectId, updateProjectMutation]
    );

    if (isEditMode && isProjectDetailsLoading) {
        return <Loading />;
    }

    if (isEditMode && isProjectDetailsError) {
        return (
            <div className="space-y-6">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                        Update Project
                    </h1>
                </div>
                <Card>
                    <CardContent className="p-6 text-center space-y-4">
                        <p className="text-sm text-slate-500">
                            {projectDetailsError?.message || "Failed to load project details."}
                        </p>
                        <Button type="button" variant="primary" onClick={() => router.push("/projects")}>
                            Back to Projects
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {isEditMode ? "Update Project" : "Create New Project"}
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
                                    {errors.vendorName && (
                                        <p className="text-xs text-red-500">{errors.vendorName}</p>
                                    )}
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
                                    {errors.projectName && (
                                        <p className="text-xs text-red-500">{errors.projectName}</p>
                                    )}
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
                                        Project Manager
                                    </label>
                                    <Input
                                        name="currentUser"
                                        readOnly
                                        value={formData.currentUser}
                                        className="bg-gray-100"
                                        placeholder="Project manager"
                                    />

                                    {errors.projectOwner && (
                                        <p className="text-xs text-red-500">{errors.projectOwner}</p>
                                    )}
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
                                            <SelectValue
                                                placeholder={
                                                    isTeamsLoading
                                                        ? "Loading teams..."
                                                        : "Select team"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teamOptions.map((member) => (
                                                <SelectItem
                                                    key={member.id}
                                                    value={member.id}
                                                >
                                                    {member.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.assignedTeam && (
                                        <p className="text-xs text-red-500">{errors.assignedTeam}</p>
                                    )}
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
                                    {errors.startDate && (
                                        <p className="text-xs text-red-500">{errors.startDate}</p>
                                    )}
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


                    </CardContent>
                </Card>

                {/* Footer Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="w-full sm:w-auto cursor-pointer bg-red-400 text-white transition-colors border-red-400 hover:bg-red-500"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
                        className="w-full sm:w-auto"
                    >
                        {createProjectMutation.isPending || updateProjectMutation.isPending
                            ? isEditMode
                                ? "Updating Project..."
                                : "Creating Project..."
                            : isEditMode
                                ? "Update Project"
                                : "Create Project"}
                    </Button>
                </div>
            </form>
        </div>
    );
}