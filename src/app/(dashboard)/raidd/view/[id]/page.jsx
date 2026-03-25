"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { FiArrowLeft, FiFlag } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { MdOutlineEmail } from "react-icons/md";
import Loading from "@/components/Loading/Loading";
import { apiGet } from "@/lib/api";

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

    return {
        id: String(item?.id || ""),
        type: formatLabel(item?.type),
        title: item?.title || "Not available",
        description: item?.description || "Not available",
        projectId: item?.project?.id || item?.projectId || "Not available",
        projectName: item?.project?.name || "Not available",
        projectDescription: item?.project?.description || "Not available",
        vendorName: item?.project?.vendorName || "Not available",
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
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                    Project Description
                </h2>
                <Card className="border-slate-200 bg-[#EFEEFC]">
                    <CardContent className="space-y-4 p-6">
                        <div className="space-y-2">
                            <p className="text-base text-slate-600">
                                <span className="font-medium text-slate-700">Project ID:</span>{" "}
                                <span className="font-medium text-slate-900">{raiddData.projectId}</span>
                            </p>
                            <p className="text-base text-slate-600">
                                <span className="font-medium text-slate-700">Project Name:</span>{" "}
                                <span className="font-bold text-slate-900">{raiddData.projectName}</span>
                            </p>
                            <p className="text-base text-slate-600">
                                <span className="font-medium text-slate-700">Vendor Name:</span>{" "}
                                <span className="font-medium text-slate-900">{raiddData.vendorName}</span>
                            </p>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                            {raiddData.projectDescription}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                    AI Summary RAIDD
                </h1>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card className="bg-[#EFEEFC] p-4 sm:p-5">
                        <CardContent className="space-y-4 p-0">
                            <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                                AI {raiddData.type}
                            </h3>
                            <div className="rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <HiOutlineSparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                                    <div>
                                        <p className="mb-1 text-xs font-medium text-slate-700">
                                            DESCRIPTION
                                        </p>
                                        <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                                            {raiddData.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
                                        {raiddData.raisedBy.avatarUrl ? (
                                            <Image
                                                src={raiddData.raisedBy.avatarUrl}
                                                alt={raiddData.raisedBy.firstName + " " + raiddData.raisedBy.lastName}
                                                fill
                                                sizes="48px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span>
                                                {(raiddData.raisedBy.firstName || raiddData.raisedBy.lastName || "P")
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
                </div>
            </div>
        </div>
    );
}
