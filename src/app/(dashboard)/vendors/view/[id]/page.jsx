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
    FiEye,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const fallback = "Not available";

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
        return vendorResponse?.data?.data || vendorResponse?.data || null;
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
                <h1 className="text-2xl font-bold text-slate-900">{vendor.name || fallback}</h1>
                <p className="text-sm text-slate-500">{vendor.designation || fallback}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="border-amber-100 bg-amber-50 p-4">
                    <CardContent className="p-0">
                        <p className="mb-2 text-xs text-slate-500">Total Projects</p>
                        <p className="text-2xl font-bold text-slate-900">{vendor.numberOfProjects || 0}</p>
                    </CardContent>
                </Card>
                <Card className="p-4">
                    <CardContent className="p-0">
                        <p className="mb-2 text-xs text-slate-500">Email Address</p>
                        <p className="truncate text-sm text-slate-700">{vendor.email || fallback}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <Card className="p-4">
                        <CardContent className="space-y-4 p-0">
                            <h3 className="font-semibold text-slate-900">Associated Projects</h3>
                            {Array.isArray(vendor.projects) && vendor.projects.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-[#6051E2]">
                                            <TableRow className="hover:bg-[#6051E2]/90 border-none">
                                                <TableHead className="text-white font-bold">Project ID</TableHead>
                                                <TableHead className="text-white font-bold">Project Name</TableHead>
                                                <TableHead className="text-white font-bold">Status</TableHead>
                                                <TableHead className="text-white font-bold text-center">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {vendor.projects.map((project, idx) => (
                                                <TableRow key={project.id || idx} className="hover:bg-slate-50 transition-colors">
                                                    <TableCell className="text-xs font-mono text-slate-600 font-medium">
                                                        {project.id}
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-slate-900">
                                                        {project.name}
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">
                                                        {project.status || fallback}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.push(`/projects/project-details/${project.id}`)}
                                                            className="border-[#6051E2]/20 text-[#6051E2] hover:bg-[#6051E2] hover:text-white transition-all font-bold text-[10px] uppercase tracking-wider h-8 cursor-pointer"
                                                        >
                                                            <FiEye className="mr-1.5 h-3 w-3" />
                                                            View Details
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">No associated projects found.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="p-4">
                        <CardContent className="space-y-4 p-0">
                            <h3 className="font-semibold text-slate-900">Meeting Link</h3>
                            {vendor.meetingLink ? (
                                <div className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-3">
                                    <div className="min-w-0">
                                        <p className="font-medium text-slate-900">Initial Discussion</p>
                                        <a
                                            href={vendor.meetingLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="break-all text-xs text-primary hover:underline"
                                        >
                                            {vendor.meetingLink}
                                        </a>
                                    </div>
                                    <a
                                        href={vendor.meetingLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-slate-500 transition hover:text-primary"
                                        aria-label="Open meeting link"
                                    >
                                        <FiExternalLink className="h-4 w-4" />
                                    </a>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">No meeting link available.</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Card className="p-4 h-full">
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
                                <DetailRow
                                    icon={<FiPhone className="h-4 w-4" />}
                                    label="Phone"
                                    value={vendor.contactPhone}
                                />
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <Card className="p-4">
                                <CardContent className="space-y-4 p-0">
                                    <h3 className="font-semibold text-slate-900">Document</h3>
                                    {vendor.documentUrl ? (
                                        <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <FiFileText className="h-4 w-4 flex-shrink-0 text-slate-500" />
                                                <span className="truncate text-sm text-slate-700">Vendor Document</span>
                                            </div>
                                            <a
                                                href={vendor.documentUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-slate-500 transition hover:text-primary"
                                                aria-label="Download Document"
                                            >
                                                <FiDownload className="h-4 w-4" />
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">No document available.</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="p-4">
                                <CardContent className="space-y-4 p-0">
                                    <h3 className="font-semibold text-slate-900">SLA Document</h3>
                                    {vendor.slaUrl ? (
                                        <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <FiFileText className="h-4 w-4 flex-shrink-0 text-slate-500" />
                                                <span className="truncate text-sm text-slate-700">SLA Agreement</span>
                                            </div>
                                            <a
                                                href={vendor.slaUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-slate-500 transition hover:text-primary"
                                                aria-label="Download SLA"
                                            >
                                                <FiDownload className="h-4 w-4" />
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">No SLA document available.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
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
                            <DetailRow icon={<FiPhone className="h-4 w-4" />} label="Phone" value={vendor.phoneNumber || vendor.phone} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
