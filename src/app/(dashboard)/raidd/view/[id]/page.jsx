"use client";
// Forced recompile to clear Label module resolution error

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FiArrowLeft, FiFlag, FiEdit, FiPlus, FiUser, FiCalendar, FiCopy } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { MdOutlineEmail } from "react-icons/md";
import Loading from "@/components/Loading/Loading";
import { apiGet, apiPatch } from "@/lib/api";
import toast from "react-hot-toast";

const formatLabel = (value) => {
    if (!value) return "Not available";
    return String(value)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeRaiddDetails = (item) => {
    const managerFirstName = item?.project?.manager?.firstName?.trim() || "";
    const managerLastName = item?.project?.manager?.lastName?.trim() || "";
    const projectManagerName =
        [managerFirstName, managerLastName]
            .filter(Boolean)
            .join(" ")
            .trim() || "Not available";

    const isBulk = Array.isArray(item?.type) && item.type.length > 1;

    let parsedDescription = item?.description || "Not available";

    if (isBulk) {
        const groupedDescription = {};
        if (item.risks && item.risks.length > 0) {
            groupedDescription["Risks"] = item.risks.map(r => r.data || r);
        }
        if (item.issues && item.issues.length > 0) {
            groupedDescription["Issues"] = item.issues.map(i => i.data || i);
        }
        if (item.assumptions && item.assumptions.length > 0) {
            groupedDescription["Assumptions"] = item.assumptions.map(a => a.data || a);
        }
        if (item.decisions && item.decisions.length > 0) {
            groupedDescription["Decisions"] = item.decisions.map(d => d.data || d);
        }
        if (item.dependencies && item.dependencies.length > 0) {
            groupedDescription["Dependencies"] = item.dependencies.map(d => d.data || d);
        }

        if (Object.keys(groupedDescription).length > 0) {
            parsedDescription = groupedDescription;
        }
    }

    return {
        id: String(item?.id || ""),
        type: isBulk ? item.type.map(t => formatLabel(t)).join(", ") : formatLabel(item?.type),
        title: item?.title || "Not available",
        description: parsedDescription,
        projectId: item?.project?.id || item?.projectId || "Not available",
        projectName: item?.project?.name || "Not available",
        projectDescription: item?.project?.description || "Not available",
        vendorName: item?.project?.vendorName || "Not available",
        decisionOwner: item?.decisionOwner || "Not assigned",
        decisionDueDate: item?.decisionDueDate || item?.dueDate || item?.due_date || "",
        raisedBy: {
            firstName: managerFirstName,
            name: projectManagerName,
            email: item?.project?.manager?.email || "Not available",
            role: "Project Manager",
            image:
                item?.project?.manager?.avatar ||
                item?.project?.manager?.image ||
                item?.project?.manager?.photoUrl ||
                item?.project?.manager?.profileImage ||
                "",
        },
    };
};

export default function ViewRAIDD() {
    const params = useParams();
    const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const router = useRouter();
    const {
        data: raiddResponse,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["raidd-details", id],
        enabled: Boolean(id),
        queryFn: () => apiGet(`/api/project-manager/raidd/${id}`),
    });

    const raiddData = useMemo(() => {
        const rawItem =
            raiddResponse?.data?.data ||
            raiddResponse?.data ||
            null;

        return rawItem ? normalizeRaiddDetails(rawItem) : null;
    }, [raiddResponse]);

    const queryClient = useQueryClient();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(null); // 'owner' or 'date'
    const [formData, setFormData] = useState({
        decisionOwner: "",
        decisionDueDate: "",
    });

    const updateMutation = useMutation({
        mutationFn: (data) => apiPatch(`/api/project-manager/raidd/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["raidd-details", id] });
            toast.success("RAIDD updated successfully");
            setIsEditModalOpen(false);
        },
        onError: (err) => {
            toast.error(err.message || "Failed to update RAIDD");
        },
    });

    const handleOpenOwnerEdit = () => {
        setEditMode("owner");
        setFormData({
            decisionOwner: raiddData?.decisionOwner === "Not assigned" ? "" : raiddData?.decisionOwner,
            decisionDueDate: raiddData?.decisionDueDate && !isNaN(new Date(raiddData.decisionDueDate).getTime())
                ? new Date(raiddData.decisionDueDate).toISOString().split("T")[0]
                : "",
        });
        setIsEditModalOpen(true);
    };

    const handleOpenDateEdit = () => {
        setEditMode("date");
        setFormData({
            decisionOwner: raiddData?.decisionOwner === "Not assigned" ? "" : raiddData?.decisionOwner,
            decisionDueDate: raiddData?.decisionDueDate && !isNaN(new Date(raiddData.decisionDueDate).getTime())
                ? new Date(raiddData.decisionDueDate).toISOString().split("T")[0]
                : "",
        });
        setIsEditModalOpen(true);
    };

    const handleCopyDescription = () => {
        if (!raiddData?.description) return;

        let textToCopy = "";
        if (typeof raiddData.description === "object" && raiddData.description !== null) {
            textToCopy = Object.entries(raiddData.description)
                .map(([key, value]) => {
                    const items = Array.isArray(value) ? value : [value];
                    if (items.length === 0) return "";
                    return `${key.toUpperCase()}:\n${items.map(item => `- ${String(item)}`).join('\n')}`;
                })
                .filter(Boolean)
                .join("\n\n");
        } else {
            textToCopy = String(raiddData.description);
        }

        navigator.clipboard.writeText(textToCopy)
            .then(() => toast.success("Description copied successfully!"))
            .catch(() => toast.error("Failed to copy description"));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {};
        if (editMode === "owner") {
            payload.decisionOwner = formData.decisionOwner;
        } else {
            // Ensure date is in ISO format as expected by backend
            if (formData.decisionDueDate) {
                payload.decisionDueDate = new Date(formData.decisionDueDate).toISOString();
            }
        }

        updateMutation.mutate(payload);
    };

    if (isLoading) {
        return <Loading />;
    }

    if (isError || !raiddData) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => router.push("/raidd")}
                    className="flex items-center gap-2 text-sm text-primary hover:underline transition cursor-pointer"
                >
                    <FiArrowLeft className="h-4 w-4" />
                    Go Back
                </button>

                <Card>
                    <CardContent className="p-6 text-center text-sm text-slate-500 sm:text-base">
                        {error?.message || "RAIDD details not available."}
                    </CardContent>
                </Card>
            </div>
        );
    }

    const displayType = raiddData?.type && raiddData.type !== "All Type" ? raiddData.type : "Decision";

    return (
        <div className="space-y-6">
            <button
                onClick={() => router.push("/raidd")}
                className="flex items-center gap-2 text-sm text-primary hover:underline transition cursor-pointer"
            >
                <FiArrowLeft className="h-4 w-4" />
                Go Back
            </button>

            <div className="mt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                        Project Description
                    </h2>
                    <Button
                        onClick={handleOpenDateEdit}
                        variant="outline"
                        className="flex items-center gap-2 border-[#6051E2]/20 text-[#6051E2] hover:bg-[#6051E2]/5 font-semibold cursor-pointer"
                    >
                        <FiPlus className="h-4 w-4" />
                        Add {displayType} Due Date
                    </Button>
                </div>
                <Card className="border-slate-200 bg-[#EFEEFC]">
                    <CardContent className="space-y-4 p-6">
                        <div className="space-y-2">
                            <p className="text-base text-slate-600">
                                <span className="font-medium text-slate-700">Project ID:</span>{" "}
                                <span className="font-medium text-slate-900">{String(raiddData.projectId).slice(-8)}</span>
                            </p>
                            <p className="text-base text-slate-600">
                                <span className="font-medium text-slate-700">Project Name:</span>{" "}
                                <span className="font-bold text-slate-900">{raiddData.projectName}</span>
                            </p>
                            {/* <p className="text-base text-slate-600">
                                <span className="font-medium text-slate-700">Client Name:</span>{" "}
                                <span className="font-medium text-slate-900">{raiddData.vendorName}</span>
                            </p> */}
                        </div>
                        {raiddData.projectDescription && raiddData.projectDescription !== "Not available" && (
                            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                                {raiddData.projectDescription}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div>
                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                    AI Summary RAIDD
                </h1>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {typeof raiddData.description === "object" && raiddData.description !== null ? (
                        Object.entries(raiddData.description).map(([key, value]) => {
                            const items = Array.isArray(value) ? value : [value];
                            if (items.length === 0) return null;
                            return (
                                <Card key={key} className="bg-[#EFEEFC] p-4 sm:p-5">
                                    <CardContent className="space-y-4 p-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                                                AI {key}
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    const textToCopy = `${key.toUpperCase()}:\n${items.map(item => `- ${String(item)}`).join('\n')}`;
                                                    navigator.clipboard.writeText(textToCopy)
                                                        .then(() => toast.success(`${key} copied successfully!`))
                                                        .catch(() => toast.error(`Failed to copy ${key}`));
                                                }}
                                                title={`Copy ${key}`}
                                                className="flex items-center gap-1.5 text-xs font-medium text-[#6051E2] hover:text-white bg-[#6051E2]/10 hover:bg-[#6051E2] px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
                                            >
                                                <FiCopy className="h-3.5 w-3.5" />
                                                <span>Copy</span>
                                            </button>
                                        </div>
                                        <div className="rounded-lg p-3">
                                            <div className="flex items-start gap-2">
                                                <HiOutlineSparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                                                <div className="w-full">
                                                    <p className="mb-1 text-xs font-medium text-slate-700 uppercase">
                                                        Description
                                                    </p>
                                                    <ul className="space-y-1 list-disc pl-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
                                                        {items.map((item, idx) => (
                                                            <li key={idx} className="text-slate-600">
                                                                {String(item)}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <Card className="bg-[#EFEEFC] p-4 sm:p-5">
                            <CardContent className="space-y-4 p-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                                        {raiddData.type === "All Type" ? "AI Summary" : `AI ${raiddData.type}`}
                                    </h3>
                                    <button
                                        onClick={handleCopyDescription}
                                        title="Copy Description"
                                        className="flex items-center gap-1.5 text-xs font-medium text-[#6051E2] hover:text-white bg-[#6051E2]/10 hover:bg-[#6051E2] px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
                                    >
                                        <FiCopy className="h-3.5 w-3.5" />
                                        <span>Copy</span>
                                    </button>
                                </div>
                                <div className="rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <HiOutlineSparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                                        <div>
                                            <p className="mb-1 text-xs font-medium text-slate-700 uppercase">
                                                Description
                                            </p>
                                            <div className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                                                <p>{raiddData.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                <div className="space-y-4 sm:space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
                            Responsibility Details
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                            Project manager information
                        </p>
                    </div>

                    <Card className="border border-primary/50 p-4 sm:p-5">
                        <CardContent className="space-y-4 p-0">
                            <div className="flex items-center gap-2">
                                <FiFlag className="h-4 w-4 text-red-500" />
                                <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                                    Raised by
                                </h3>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#6051E2]/10 text-sm font-semibold text-[#6051E2] sm:h-12 sm:w-12 sm:text-base">
                                        {raiddData.raisedBy.image ? (
                                            <Image
                                                src={raiddData.raisedBy.image}
                                                alt={raiddData.raisedBy.name}
                                                fill
                                                sizes="48px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span>
                                                {(raiddData.raisedBy.name || "P")
                                                    .trim()
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <p className="font-medium text-slate-900 text-sm sm:text-base">
                                            {raiddData.raisedBy.name}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <MdOutlineEmail className="h-3 w-3 flex-shrink-0 text-slate-400 sm:h-4 sm:w-4" />
                                            <span className="text-xs text-slate-600 sm:text-sm">
                                                {raiddData.raisedBy.email}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 sm:text-sm">
                                    {raiddData.raisedBy.role}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-primary/50 p-4 sm:p-5">
                        <CardContent className="space-y-4 p-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FiFlag className="h-4 w-4 text-[#6051E2]" />
                                    <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                                        {displayType} Details
                                    </h3>
                                </div>
                                <button
                                    onClick={handleOpenOwnerEdit}
                                    className="text-slate-400 hover:text-[#6051E2] transition cursor-pointer"
                                >
                                    <FiEdit className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 sm:h-12 sm:w-12">
                                        <FiUser className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                                            {displayType} Owner
                                        </p>
                                        <p className="font-semibold text-slate-900 text-sm sm:text-base">
                                            {raiddData.decisionOwner}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 sm:h-12 sm:w-12">
                                        <FiCalendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                                            {displayType} Due Date
                                        </p>
                                        <p className="font-semibold text-slate-900 text-sm sm:text-base">
                                            {raiddData.decisionDueDate
                                                ? new Date(raiddData.decisionDueDate).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })
                                                : "Pending due date"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">
                            {editMode === "owner" ? `Update ${displayType} Owner` : `Update ${displayType} Due Date`}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        {editMode === "owner" ? (
                            <div className="space-y-2">
                                <label htmlFor="decisionOwner" className="text-sm font-semibold text-slate-700">
                                    {displayType} Owner
                                </label>
                                <Input
                                    id="decisionOwner"
                                    placeholder="Enter owner name"
                                    value={formData.decisionOwner}
                                    onChange={(e) => setFormData({ ...formData, decisionOwner: e.target.value })}
                                    className="border-slate-200 focus:border-[#6051E2] focus:ring-[#6051E2]"
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label htmlFor="decisionDueDate" className="text-sm font-semibold text-slate-700">
                                    {displayType} Due Date
                                </label>
                                <Input
                                    id="decisionDueDate"
                                    type="date"
                                    value={formData.decisionDueDate}
                                    onChange={(e) => setFormData({ ...formData, decisionDueDate: e.target.value })}
                                    className="border-slate-200 focus:border-[#6051E2] focus:ring-[#6051E2]"
                                />
                            </div>
                        )}
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={updateMutation.isPending}
                                className="bg-[#6051E2] hover:bg-[#4a3db8] text-white cursor-pointer"
                            >
                                {updateMutation.isPending ? "Updating..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
