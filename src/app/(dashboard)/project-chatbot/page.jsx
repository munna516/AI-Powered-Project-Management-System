"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    FiArrowRight,
    FiPaperclip,
    FiRefreshCw,
    FiMenu,
    FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import Loading from "@/components/Loading/Loading";
import { apiGet, apiPost, getStoredUser } from "@/lib/api";

const CHAT_QUERY_KEY = ["project-chatbot-messages"];

const normalizeMessage = (message, index, currentUser) => {
    const senderValue = String(message?.sender || "").toUpperCase();
    const isUser = senderValue === "USER";
    const userName =
        [
            message?.user?.firstName,
            message?.user?.lastName,
        ]
            .filter(Boolean)
            .join(" ")
            .trim() ||
        [currentUser?.firstName, currentUser?.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() ||
        "User";

    return {
        id: String(message?.id || index),
        sender: isUser ? "user" : "ai",
        text: message?.content || "",
        senderName: isUser ? userName : message?.agentName || "Project AI",
        createdAt: message?.createdAt || null,
        documentUrl: message?.documentUrl || "",
        documentName: message?.documentPath
            ? String(message.documentPath).split("/").pop()
            : "",
    };
};

export default function ProjectChatbot() {
    const queryClient = useQueryClient();
    const currentUser = useMemo(() => getStoredUser(), []);
    const [inputValue, setInputValue] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [awaitingReplyMeta, setAwaitingReplyMeta] = useState(null);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [isProjectSidebarOpen, setIsProjectSidebarOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const inputRef = useRef(null);

    const {
        data: projectsResponse,
        isLoading: isProjectsLoading,
        isError: isProjectsError,
        error: projectsError,
    } = useQuery({
        queryKey: ["project-chatbot-projects"],
        queryFn: () => apiGet("/api/project-manager/project-management/my-projects"),
    });

    const projects = useMemo(() => {
        const rawProjects = Array.isArray(projectsResponse?.data)
            ? projectsResponse.data
            : Array.isArray(projectsResponse?.data?.data)
                ? projectsResponse.data.data
                : [];

        return rawProjects
            .map((p) => ({
                id: String(p?.id || p?.projectId || ""),
                name: p?.name || p?.projectName || p?.title || `Project ${p?.id || ""}`,
            }))
            .filter((p) => p.id);
    }, [projectsResponse]);

    const {
        data: messagesResponse,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: [...CHAT_QUERY_KEY, selectedProjectId],
        queryFn: () =>
            apiGet("/api/project-manager/project-chatbot/all", {
                params: { projectId: selectedProjectId },
            }),
        enabled: Boolean(selectedProjectId),
        refetchInterval: awaitingReplyMeta ? 3000 : false,
    });

    const messages = useMemo(() => {
        const rawMessages = Array.isArray(messagesResponse?.data)
            ? messagesResponse.data
            : Array.isArray(messagesResponse?.data?.data)
                ? messagesResponse.data.data
                : [];

        return rawMessages.map((message, index) =>
            normalizeMessage(message, index, currentUser)
        );
    }, [currentUser, messagesResponse]);

    const sendMessageMutation = useMutation({
        mutationFn: (payload) =>
            apiPost("/api/project-manager/project-chatbot/send", payload),
        onMutate: async (payload) => {
            const queryKey = [...CHAT_QUERY_KEY, selectedProjectId];
            await queryClient.cancelQueries({ queryKey });

            const previous = queryClient.getQueryData(queryKey);
            const optimisticId = `optimistic-${Date.now()}`;
            const optimisticCreatedAt = new Date().toISOString();
            const optimisticContent = String(payload?.get?.("content") || "").trim();

            const optimisticMessage = {
                id: optimisticId,
                sender: "USER",
                content: optimisticContent,
                createdAt: optimisticCreatedAt,
                documentUrl: "",
                documentPath: payload?.get?.("document")?.name || "",
            };

            queryClient.setQueryData(queryKey, (current) => {
                const append = (arr) => [...(Array.isArray(arr) ? arr : []), optimisticMessage];

                if (Array.isArray(current)) {
                    return append(current);
                }

                if (current && Array.isArray(current.data)) {
                    return { ...current, data: append(current.data) };
                }

                if (current?.data && Array.isArray(current.data.data)) {
                    return { ...current, data: { ...current.data, data: append(current.data.data) } };
                }

                return { ...(current || {}), data: [optimisticMessage] };
            });

            return { previous, optimisticId };
        },
        onSuccess: async (response) => {
            const createdMessage = response?.data || {};
            setAwaitingReplyMeta({
                createdAt: createdMessage?.createdAt || new Date().toISOString(),
            });
            setInputValue("");
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            await queryClient.invalidateQueries({ queryKey: [...CHAT_QUERY_KEY, selectedProjectId] });
        },
        onError: (mutationError, _payload, context) => {
            const queryKey = [...CHAT_QUERY_KEY, selectedProjectId];
            if (context?.previous) {
                queryClient.setQueryData(queryKey, context.previous);
            } else if (context?.optimisticId) {
                queryClient.setQueryData(queryKey, (current) => {
                    const remove = (arr) =>
                        (Array.isArray(arr) ? arr : []).filter(
                            (item) => String(item?.id) !== String(context.optimisticId)
                        );

                    if (Array.isArray(current)) return remove(current);
                    if (current && Array.isArray(current.data)) {
                        return { ...current, data: remove(current.data) };
                    }
                    if (current?.data && Array.isArray(current.data.data)) {
                        return { ...current, data: { ...current.data, data: remove(current.data.data) } };
                    }
                    return current;
                });
            }
            toast.error(mutationError?.message || "Failed to send message.");
        },
        onSettled: async (_data, _error, _variables, context) => {
            const queryKey = [...CHAT_QUERY_KEY, selectedProjectId];
            const createdMessage = _data?.data;
            if (!createdMessage || !context?.optimisticId) return;

            queryClient.setQueryData(queryKey, (current) => {
                const replace = (arr) =>
                    (Array.isArray(arr) ? arr : []).map((item) =>
                        String(item?.id) === String(context.optimisticId) ? createdMessage : item
                    );

                if (Array.isArray(current)) return replace(current);
                if (current && Array.isArray(current.data)) {
                    return { ...current, data: replace(current.data) };
                }
                if (current?.data && Array.isArray(current.data.data)) {
                    return { ...current, data: { ...current.data, data: replace(current.data.data) } };
                }
                return current;
            });
        },
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isFetching, sendMessageMutation.isPending]);

    useEffect(() => {
        if (!awaitingReplyMeta) return;

        const sentAt = new Date(awaitingReplyMeta.createdAt).getTime();
        const hasAgentReply = messages.some(
            (message) =>
                message.sender === "ai" &&
                message.createdAt &&
                new Date(message.createdAt).getTime() > sentAt
        );

        if (hasAgentReply) {
            setAwaitingReplyMeta(null);
        }
    }, [awaitingReplyMeta, messages]);

    const handleSend = () => {
        if (!selectedProjectId) {
            toast.error("Please select a project to start chatting.");
            return;
        }
        if ((!inputValue.trim() && !selectedFile) || sendMessageMutation.isPending) {
            return;
        }

        const payload = new FormData();
        payload.append("content", inputValue.trim());
        payload.append("sender", "USER");
        payload.append("projectId", selectedProjectId);

        if (selectedFile) {
            payload.append("document", selectedFile);
        }

        sendMessageMutation.mutate(payload);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRefresh = async () => {
        await refetch();
        toast.success("Chat refreshed successfully");
    };

    if (isLoading) {
        return <Loading />;
    }

    if (isError) {
        return (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                {error?.message || "Failed to load chat messages."}
            </div>
        );
    }

    return (
        <div className="mx-auto flex h-[calc(100vh-2rem)]  flex-col overflow-x-hidden sm:h-[calc(100vh-10rem)]">
            <div className="mb-4 sm:mb-6 flex items-start justify-between gap-3">
                <div>
                    <h1 className="mb-2 text-2xl font-bold text-blue-900 sm:text-3xl">
                        Project AI Chatbot
                    </h1>
                    <p className="text-sm text-slate-600 sm:text-base">
                        Ask me anything about your projects, tasks, risks, issues, and actions. I'm here to help you stay on top of your work.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="sm:hidden cursor-pointer"
                    onClick={() => setIsProjectSidebarOpen(true)}
                    disabled={isProjectsLoading}
                >
                    <FiMenu className="mr-2 h-4 w-4" />
                    Projects
                </Button>
            </div>

            <div className="flex flex-1 min-h-0 relative">
                {isProjectSidebarOpen ? (
                    <div
                        className="fixed inset-0 bg-black/20 z-40 sm:hidden"
                        onClick={() => setIsProjectSidebarOpen(false)}
                    />
                ) : null}

                {/* Sidebar like ChatGPT */}
                <aside
                    className={`w-72 border-r border-slate-200 bg-white overflow-y-auto fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ${
                        isProjectSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } sm:static sm:inset-auto sm:translate-x-0 sm:z-auto`}
                >
                    <div className="p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold text-slate-700">Projects</div>
                                <div className="mt-1 text-xs text-slate-500">Select a project to chat.</div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsProjectSidebarOpen(false)}
                                className="sm:hidden rounded-md p-2 hover:bg-slate-50 cursor-pointer"
                                aria-label="Close projects drawer"
                                title="Close"
                            >
                                <FiX className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {isProjectsLoading ? (
                        <div className="px-4 pb-6">
                            <Loading />
                        </div>
                    ) : isProjectsError ? (
                        <div className="px-4 pb-6 text-sm text-red-600">
                            {projectsError?.message || "Failed to load projects"}
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="px-4 pb-6 text-sm text-slate-500">
                            No projects found.
                        </div>
                    ) : (
                        <div className="pb-6">
                            {projects.map((project) => {
                                const active = project.id === selectedProjectId;
                                return (
                                    <button
                                        key={project.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedProjectId(project.id);
                                            setIsProjectSidebarOpen(false);
                                            setAwaitingReplyMeta(null);
                                            setInputValue("");
                                            setSelectedFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                                            active
                                                ? "bg-[#6051E2] text-white"
                                                : "text-slate-700 hover:bg-slate-50"
                                        }`}
                                        aria-current={active ? "page" : undefined}
                                    >
                                        {project.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </aside>

                {/* Chat */}
                <div className="flex-1 min-w-0 flex flex-col pl-3">
                    <div
                        ref={chatContainerRef}
                        className="mb-4 flex-1 space-y-4 overflow-x-hidden overflow-y-auto pr-2 sm:mb-6"
                    >
                        {!selectedProjectId ? (
                            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                                Select a project to start chatting.
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                                No messages found.
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex items-start gap-3 ${
                                        message.sender === "user" ? "flex-row-reverse" : "flex-row"
                                    }`}
                                >
                                    <div className="flex flex-shrink-0 flex-col items-center gap-1">
                                        <span
                                            className={`text-xs text-slate-500 ${
                                                message.sender === "user" ? "text-right" : "text-left"
                                            }`}
                                        >
                                            {message.senderName}
                                        </span>
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full sm:h-10 sm:w-10 ${
                                                message.sender === "ai"
                                                    ? "bg-teal-700 text-white"
                                                    : "bg-slate-200 text-orange-600"
                                            }`}
                                        >
                                            <span className="text-xs font-semibold sm:text-sm">
                                                {message.sender === "ai"
                                                    ? "A"
                                                    : ((currentUser?.firstName || "U").charAt(0).toUpperCase())}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex max-w-[75%] flex-col sm:max-w-[70%]">
                                        <div
                                            className={`rounded-lg border-0 px-4 py-2.5 sm:px-5 sm:py-3 ${
                                                message.sender === "ai"
                                                    ? "bg-purple-100 text-slate-900"
                                                    : "bg-[#6051E2] text-white"
                                            }`}
                                        >
                                            <p className="whitespace-pre-wrap text-sm leading-relaxed sm:text-base">
                                                {message.text || "Attachment"}
                                            </p>
                                            {message.documentUrl ? (
                                                <a
                                                    href={message.documentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`mt-3 inline-flex rounded-md px-3 py-1.5 text-xs font-medium underline-offset-2 hover:underline ${
                                                        message.sender === "ai"
                                                            ? "bg-white/70 text-[#6051E2]"
                                                            : "bg-white/15 text-white"
                                                    }`}
                                                >
                                                    {message.documentName || "View attachment"}
                                                </a>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {(sendMessageMutation.isPending || awaitingReplyMeta) && (
                            <div className="flex items-start gap-3">
                                <div className="flex flex-shrink-0 flex-col items-center gap-1">
                                    <span className="text-left text-xs text-slate-500">Project AI</span>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-white sm:h-10 sm:w-10">
                                        <span className="text-xs font-semibold sm:text-sm">A</span>
                                    </div>
                                </div>
                                <div className="mt-5 flex max-w-[75%] flex-col sm:max-w-[70%]">
                                    <div className="rounded-lg border-0 bg-purple-100 px-4 py-2.5 sm:px-5 sm:py-3">
                                        <div className="flex items-center gap-1.5">
                                            <div
                                                className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                                                style={{ animationDelay: "0ms" }}
                                            ></div>
                                            <div
                                                className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                                                style={{ animationDelay: "150ms" }}
                                            ></div>
                                            <div
                                                className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                                                style={{ animationDelay: "300ms" }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {selectedProjectId ? (
                        <div className="pt-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 sm:gap-6 sm:text-sm">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-1.5 transition-colors hover:text-slate-700 cursor-pointer"
                                >
                                    <FiPaperclip className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <span>Attach</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleRefresh}
                                    disabled={isFetching}
                                    className="flex items-center gap-1.5 transition-colors hover:text-slate-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <FiRefreshCw
                                        className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                                            isFetching ? "animate-spin" : ""
                                        }`}
                                    />
                                    <span>Refresh</span>
                                </button>
                            </div>

                            {selectedFile ? (
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#6051E2]/20 bg-[#6051E2]/10 px-3 py-1.5 text-xs text-[#6051E2] sm:text-sm">
                                    <FiPaperclip className="h-3.5 w-3.5" />
                                    <span className="max-w-[220px] truncate">{selectedFile.name}</span>
                                    <button
                                        type="button"
                                        onClick={clearSelectedFile}
                                        className="rounded-full p-1 transition-colors hover:bg-[#6051E2]/10 cursor-pointer"
                                        aria-label="Remove attachment"
                                        title="Remove attachment"
                                    >
                                        <FiX className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ) : null}

                            <div className="flex gap-2 sm:gap-3">
                                <Input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Ask anything"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={sendMessageMutation.isPending}
                                    className="h-10 flex-1 rounded-lg border-slate-300 bg-white text-sm placeholder:text-slate-400 focus-visible:border-[#6051E2] focus-visible:ring-[#6051E2] disabled:opacity-50 sm:h-11 sm:text-base"
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={(!inputValue.trim() && !selectedFile) || sendMessageMutation.isPending}
                                    className="flex h-10 items-center gap-2 rounded-lg bg-[#6051E2] px-4 text-white hover:bg-[#6051E2]/90 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:px-6 cursor-pointer"
                                >
                                    <FiArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="text-sm font-medium">
                                        {sendMessageMutation.isPending ? "Sending" : "Send"}
                                    </span>
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
