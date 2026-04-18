"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FiArrowLeft, FiCopy } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/Loading/Loading";
import { apiGet } from "@/lib/api";
import toast from "react-hot-toast";

const UNIFIED_INBOX_KEY = ["unified-inbox"];

function resolveGeneratedReply(data, emailIdFromQuery) {
    if (!data) return null;

    if (!Array.isArray(data) && data.generatedReply) {
        return data.generatedReply;
    }

    const list = Array.isArray(data) ? data : data?.data;
    if (!Array.isArray(list) || list.length === 0) return null;

    if (emailIdFromQuery) {
        const match = list.find(
            (item) => String(item?.id) === String(emailIdFromQuery)
        );
        if (match?.generatedReply) return match.generatedReply;
    }

    const withReply = list.find((item) => item?.generatedReply);
    return withReply?.generatedReply ?? list[0]?.generatedReply ?? null;
}

export default function GenerateEmail() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailIdFromQuery = searchParams.get("id");

    const { data: inboxResponse, isLoading, error } = useQuery({
        queryKey: UNIFIED_INBOX_KEY,
        queryFn: () => apiGet("/api/project-manager/outlook/unified-inbox"),
    });

    const generatedReply = useMemo(() => {
        if (inboxResponse?.generatedReply) return inboxResponse.generatedReply;
        return resolveGeneratedReply(inboxResponse?.data, emailIdFromQuery);
    }, [inboxResponse, emailIdFromQuery]);

    const toDisplay = (value) => {
        if (value == null) return "Not Available";
        const s = String(value).trim();
        return s || "Not Available";
    };

    const subjectDisplay = toDisplay(generatedReply?.subject);
    const bodyDisplay = toDisplay(generatedReply?.body);

    const copyText = async (text, label) => {
        if (!text || text === "Not Available") {
            toast.error(`No ${label.toLowerCase()} to copy`);
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${label} copied`);
        } catch {
            toast.error("Could not copy to clipboard");
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="space-y-6">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-blue-600 cursor-pointer hover:underline flex items-center gap-2"
                >
                    <FiArrowLeft className="h-4 w-4" /> Go Back
                </button>
                <p className="text-slate-700">
                    {error?.message || "Failed to load generated reply."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-blue-600 cursor-pointer hover:underline flex items-center gap-2"
                >
                    <FiArrowLeft className="h-4 w-4" /> Go Back
                </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Generated email
            </h1>

            <div className="space-y-4">
                <Card className="bg-white">
                    <CardContent className="p-4 sm:p-6 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <label className="text-sm font-medium text-slate-700">
                                Subject
                            </label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="cursor-pointer shrink-0"
                                onClick={() => copyText(subjectDisplay, "Subject")}
                            >
                                <FiCopy className="h-4 w-4 mr-1.5" />
                                Copy
                            </Button>
                        </div>
                        <Textarea
                            readOnly
                            value={subjectDisplay}
                            className="min-h-[52px] resize-none text-sm sm:text-base bg-slate-50"
                        />
                    </CardContent>
                </Card>

                <Card className="bg-white">
                    <CardContent className="p-4 sm:p-6 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <label className="text-sm font-medium text-slate-700">
                                Body
                            </label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="cursor-pointer shrink-0"
                                onClick={() => copyText(bodyDisplay, "Body")}
                            >
                                <FiCopy className="h-4 w-4 mr-1.5" />
                                Copy
                            </Button>
                        </div>
                        <Textarea
                            readOnly
                            value={bodyDisplay}
                            className="min-h-[220px] sm:min-h-[280px] resize-y text-sm sm:text-base bg-slate-50"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
