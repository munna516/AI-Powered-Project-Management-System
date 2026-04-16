"use client";
import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import Loading from "@/components/Loading/Loading";
import { apiGet } from "@/lib/api";
import {
    FiArrowLeft,
    FiCheckCircle,
    FiDownload,
    FiExternalLink,
    FiFileText,
    FiMail,
    FiPhone,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";

const fallback = "Not available";

const formatDateTime = (value) => {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getSlaStatus = (slas) => {
    if (Array.isArray(slas) && slas.length > 0) {
        return { label: "Submitted", className: "bg-green-100 text-green-700" };
    }
    return { label: "Pending", className: "bg-yellow-100 text-yellow-700" };
};

const getFlagStyle = (flag) => {
    switch (String(flag || "").toLowerCase()) {
        case "red":
            return "bg-red-100 text-red-700";
        case "amber":
        case "yellow":
            return "bg-amber-100 text-amber-700";
        case "green":
            return "bg-green-100 text-green-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
};

const normalizeDocument = (doc, index) => ({
    id: String(doc?.id || index),
    name: doc?.originalName || doc?.name || doc?.fileName || `Document ${index + 1}`,
    url: doc?.url || doc?.fileUrl || doc?.path || "",
});

const normalizeMeetingLink = (link, index) => ({
    id: String(index),
    title: link?.title || `Meeting Link ${index + 1}`,
    url: link?.link || "",
});

const normalizeProject = (project, index) => ({
    id: String(project?.id || index),
    name: project?.name || `Project ${index + 1}`,
    vendorName: project?.vendorName || fallback,
});

const normalizeVendor = (vendor) => {
    const ai = vendor?.vendorAiResponse || {};
    const raidd = ai?.raiddFlags || {};

    return {
        id: String(vendor?.id || ""),
        name: vendor?.name || fallback,
        designation: vendor?.designation || fallback,
        email: vendor?.email || fallback,
        phone: vendor?.phone || fallback,
        numberOfProjects: vendor?.numberOfProjects ?? 0,
        createdAt: vendor?.createdAt || null,
        updatedAt: vendor?.updatedAt || null,
        contactPerson: vendor?.contactPerson || fallback,
        contactRole: vendor?.contactRole || fallback,
        contactEmail: vendor?.contactEmail || fallback,
        contactPhone: vendor?.contactPhone || fallback,
        contactProjects: vendor?.contactProjects ?? 0,
        contactDesignation: vendor?.contactDesignation || fallback,
        documents: Array.isArray(vendor?.documents) ? vendor.documents.map(normalizeDocument) : [],
        slas: Array.isArray(vendor?.slas) ? vendor.slas.map(normalizeDocument) : [],
        meetingLinks: Array.isArray(vendor?.meetingLinks)
            ? vendor.meetingLinks.map(normalizeMeetingLink)
            : [],
        projects: Array.isArray(vendor?.projects) ? vendor.projects.map(normalizeProject) : [],
        ai: {
            flag: ai?.flag || fallback,
            session: ai?.session || fallback,
            notes: ai?.notes || "",
            summary: ai?.summary || "",
            performanceScore: Number(ai?.performanceScore || 0),
            lessonsLearned: Array.isArray(ai?.lessonsLearned) ? ai.lessonsLearned : [],
            actionPoints: Array.isArray(ai?.actionPoints) ? ai.actionPoints : [],
            discussionPoints: Array.isArray(ai?.discussionPoints) ? ai.discussionPoints : [],
            raiddFlags: {
                risks: Array.isArray(raidd?.risks) ? raidd.risks : [],
                issues: Array.isArray(raidd?.issues) ? raidd.issues : [],
                assumptions: Array.isArray(raidd?.assumptions) ? raidd.assumptions : [],
                decisions: Array.isArray(raidd?.decisions) ? raidd.decisions : [],
                dependencies: Array.isArray(raidd?.dependencies) ? raidd.dependencies : [],
            },
        },
    };
};

const raiddSections = [
    { key: "risks", title: "AI Risks", detailsTitle: "AI Risk Details" },
    { key: "issues", title: "AI Issues", detailsTitle: "AI Issue Details" },
    { key: "assumptions", title: "AI Assumptions", detailsTitle: "AI Assumption Details" },
    { key: "decisions", title: "AI Decisions", detailsTitle: "AI Decision Details" },
    { key: "dependencies", title: "AI Dependencies", detailsTitle: "AI Dependency Details" },
];

function DetailRow({ icon, label, value, isLink = false }) {
    return (
        <div className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-0.5 text-slate-400">{icon}</span>
            <div className="min-w-0">
                <p className="text-xs text-slate-500">{label}</p>
                {isLink && value && value !== fallback ? (
                    <a
                        href={value}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-primary hover:underline"
                    >
                        {value}
                    </a>
                ) : (
                    <p className="break-all text-slate-700">{value || fallback}</p>
                )}
            </div>
        </div>
    );
}

function AiListCard({ title, detailsTitle, items }) {
    return (
        <Card className="bg-[#EFEEFC] p-4">
            <CardContent className="space-y-3 p-0">
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <div>
                    <p className="mb-2 text-sm font-medium text-slate-700">
                        {detailsTitle || `${title} Details`}
                    </p>
                    {items.length > 0 ? (
                        <ul className="space-y-2">
                            {items.map((item, idx) => (
                                <li key={`${title}-${idx}`} className="flex gap-2 text-xs leading-relaxed text-slate-600">
                                    <span className="mt-1.5 h-1 w-1 rounded-full bg-slate-400" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-xs text-slate-500">
                            No {title.replace(/^AI\s+/i, "").toLowerCase()} found.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function TextListCard({ title, items, emptyText }) {
    return (
        <Card className="p-4">
            <CardContent className="space-y-4 p-0">
                <h3 className="font-semibold text-slate-900">{title}</h3>
                {items.length > 0 ? (
                    <ul className="space-y-2">
                        {items.map((item, idx) => (
                            <li key={`${title}-${idx}`} className="flex gap-2 text-sm text-slate-600">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-500">{emptyText}</p>
                )}
            </CardContent>
        </Card>
    );
}

export default function ViewVendor() {
    const { id } = useParams();
    const router = useRouter();

    const {
        data: vendorResponse,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["vendor-details", id],
        enabled: Boolean(id),
        queryFn: async () => {
            try {
                return await apiGet(`/api/project-manager/vendor-management/${id}`);
            } catch {
                const response = await apiGet("/api/project-manager/vendor-management/all");
                const rawVendors = Array.isArray(response?.data)
                    ? response.data
                    : Array.isArray(response?.data?.data)
                        ? response.data.data
                        : [];

                const vendor = rawVendors.find((item) => String(item?.id) === String(id));
                if (!vendor) {
                    throw new Error("Vendor not found");
                }
                return { data: vendor };
            }
        },
    });

    const vendor = useMemo(() => {
        const rawVendor = vendorResponse?.data?.data || vendorResponse?.data || null;
        return rawVendor ? normalizeVendor(rawVendor) : null;
    }, [vendorResponse]);

    if (isLoading) {
        return <Loading />;
    }

    if (isError || !vendor) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-sm text-slate-500 sm:text-base">
                    {error?.message || "Failed to load vendor details."}
                </CardContent>
            </Card>
        );
    }

    const slaStatus = getSlaStatus(vendor.slas);

    return (
        <div className="space-y-6">
            <button
                onClick={() => router.push("/vendors")}
                className="flex items-center gap-2 text-sm text-slate-600 transition hover:text-primary cursor-pointer"
            >
                <FiArrowLeft className="h-4 w-4" />
                Back to Vendors
            </button>

            <div>
                <h1 className="text-2xl font-bold text-slate-900">{vendor.name}</h1>
                <p className="text-sm text-slate-500">{vendor.designation}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card className="p-4">
                    <CardContent className="p-0">
                        <p className="mb-2 text-xs text-slate-500">SLA Status</p>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${slaStatus.className}`}>
                            <FiCheckCircle className="h-3 w-3" />
                            {slaStatus.label}
                        </span>
                    </CardContent>
                </Card>

                <Card className="border-amber-100 bg-amber-50 p-4">
                    <CardContent className="p-0">
                        <p className="mb-2 text-xs text-slate-500">Total Projects</p>
                        <p className="text-2xl font-bold text-slate-900">{vendor.numberOfProjects}</p>
                    </CardContent>
                </Card>

                <Card className="p-4">
                    <CardContent className="p-0">
                        <p className="mb-2 text-xs text-slate-500">Email Address</p>
                        <p className="truncate text-sm text-slate-700">{vendor.email}</p>
                    </CardContent>
                </Card>

                <Card className="p-4">
                    <CardContent className="p-0">
                        <p className="mb-2 text-xs text-slate-500">Performance Score</p>
                        <p className="text-2xl font-bold text-slate-900">{vendor.ai.performanceScore}%</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <Card className="border-l-4 border-l-primary p-4">
                        <CardContent className="p-0">
                            <div className="mb-3 flex items-center gap-2">
                                <HiOutlineSparkles className="h-4 w-4 text-primary" />
                                <p className="text-sm font-semibold text-primary">Vendor AI Summary</p>
                            </div>
                            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                                {vendor.ai.summary || fallback}
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {raiddSections.map((section) => (
                            <AiListCard
                                key={section.key}
                                title={section.title}
                                detailsTitle={section.detailsTitle}
                                items={vendor.ai.raiddFlags[section.key] || []}
                            />
                        ))}
                    </div>

                    <Card className="p-4">
                        <CardContent className="space-y-4 p-0">
                            <h3 className="font-semibold text-slate-900">Lessons Learned</h3>
                            {vendor.ai.lessonsLearned.length > 0 ? (
                                <ul className="space-y-2">
                                    {vendor.ai.lessonsLearned.map((item, idx) => (
                                        <li key={idx} className="flex gap-2 text-sm text-slate-600">
                                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-500">No lessons learned available.</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <TextListCard
                            title="Discussion Points"
                            items={vendor.ai.discussionPoints}
                            emptyText="No discussion points available."
                        />
                        <TextListCard
                            title="Action Points"
                            items={vendor.ai.actionPoints}
                            emptyText="No action points available."
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <Card className="p-4">
                            <CardContent className="space-y-4 p-0">
                                <h3 className="font-semibold text-slate-900">Associated Projects</h3>
                                {vendor.projects.length > 0 ? (
                                    <div className="space-y-3">
                                        {vendor.projects.map((project) => (
                                            <div key={project.id} className="rounded-lg bg-slate-50 p-3">
                                                <p className="font-medium text-slate-900">{project.name}</p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Vendor: {project.vendorName}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">No associated projects found.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="p-4">
                            <CardContent className="space-y-4 p-0">
                                <h3 className="font-semibold text-slate-900">Meeting Links</h3>
                                {vendor.meetingLinks.length > 0 ? (
                                    <div className="space-y-3">
                                        {vendor.meetingLinks.map((meeting) => (
                                            <div
                                                key={meeting.id}
                                                className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-3"
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-900">{meeting.title}</p>
                                                    <a
                                                        href={meeting.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="break-all text-xs text-primary hover:underline"
                                                    >
                                                        {meeting.url || fallback}
                                                    </a>
                                                </div>
                                                {meeting.url ? (
                                                    <a
                                                        href={meeting.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-slate-500 transition hover:text-primary"
                                                        aria-label="Open meeting link"
                                                    >
                                                        <FiExternalLink className="h-4 w-4" />
                                                    </a>
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">No meeting links available.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="space-y-4">
                    <Card className="p-4">
                        <CardContent className="space-y-4 p-0">
                            <h3 className="font-semibold text-slate-900">Vendor Profile</h3>
                            <DetailRow icon={<FiMail className="h-4 w-4" />} label="Name" value={vendor.name} />
                            <DetailRow
                                icon={<FiCheckCircle className="h-4 w-4" />}
                                label="Designation"
                                value={vendor.designation}
                            />
                            <DetailRow icon={<FiMail className="h-4 w-4" />} label="Email" value={vendor.email} />
                            <DetailRow icon={<FiPhone className="h-4 w-4" />} label="Phone" value={vendor.phone} />

                        </CardContent>
                    </Card>

                    <Card className="p-4">
                        <CardContent className="space-y-4 p-0">
                            <h3 className="font-semibold text-slate-900">Contact Person</h3>
                            <DetailRow
                                icon={<FiCheckCircle className="h-4 w-4" />}
                                label="Name"
                                value={vendor.contactPerson}
                            />
                            <DetailRow
                                icon={<FiCheckCircle className="h-4 w-4" />}
                                label="Role"
                                value={vendor.contactRole}
                            />
                            <DetailRow
                                icon={<FiCheckCircle className="h-4 w-4" />}
                                label="Designation"
                                value={vendor.contactDesignation}
                            />
                            <DetailRow
                                icon={<FiMail className="h-4 w-4" />}
                                label="Email"
                                value={vendor.contactEmail}
                            />
                            
                        </CardContent>
                    </Card>

                    <Card className="p-4">
                        <CardContent className="space-y-4 p-0">
                            <h3 className="font-semibold text-slate-900">AI Meta</h3>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-slate-500">Flag</span>
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getFlagStyle(vendor.ai.flag)}`}>
                                    {vendor.ai.flag}
                                </span>
                            </div>
                            <div className="flex items-start justify-between gap-3">
                                <span className="text-sm text-slate-500">Session</span>
                                <span className="text-right text-sm text-slate-700">{vendor.ai.session}</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500">Notes</p>
                                <p className="text-sm leading-relaxed text-slate-700">
                                    {vendor.ai.notes || fallback}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="p-4">
                        <CardContent className="space-y-4 p-0">
                            <h3 className="font-semibold text-slate-900">Documents</h3>
                            {vendor.documents.length > 0 ? (
                                <div className="space-y-3">
                                    {vendor.documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3"
                                        >
                                            <div className="flex min-w-0 items-center gap-2">
                                                <FiFileText className="h-4 w-4 flex-shrink-0 text-slate-500" />
                                                <span className="truncate text-sm text-slate-700">{doc.name}</span>
                                            </div>
                                            {doc.url ? (
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-slate-500 transition hover:text-primary"
                                                    aria-label={`Download ${doc.name}`}
                                                >
                                                    <FiDownload className="h-4 w-4" />
                                                </a>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">No documents available.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="p-4">
                        <CardContent className="space-y-4 p-0">
                            <h3 className="font-semibold text-slate-900">SLA Documents</h3>
                            {vendor.slas.length > 0 ? (
                                <div className="space-y-3">
                                    {vendor.slas.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3"
                                        >
                                            <div className="flex min-w-0 items-center gap-2">
                                                <FiFileText className="h-4 w-4 flex-shrink-0 text-slate-500" />
                                                <span className="truncate text-sm text-slate-700">{doc.name}</span>
                                            </div>
                                            {doc.url ? (
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-slate-500 transition hover:text-primary"
                                                    aria-label={`Download ${doc.name}`}
                                                >
                                                    <FiDownload className="h-4 w-4" />
                                                </a>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">No SLA documents available.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
