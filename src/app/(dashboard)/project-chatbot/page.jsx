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

        const mappedProjects = rawProjects
            .map((p) => ({
                id: String(p?.projectId ?? p?.id ?? ""),
                name:
                    p?.name ||
                    p?.projectName ||
                    p?.title ||
                    `Project ${p?.projectId ?? p?.id ?? ""}`,
            }))
            .filter((p) => p.id);

        return [
            { id: "global", name: "Global Chatbot" },
            ...mappedProjects
        ];
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
                params: selectedProjectId === "global" ? undefined : { projectId: selectedProjectId },
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

        const scoped = rawMessages.filter((m) => {
            const pid = m?.projectId ?? m?.project?.id;
            if (selectedProjectId === "global") {
                return pid == null || pid === "";
            }
            return String(pid) === String(selectedProjectId);
        });

        return scoped.map((message, index) =>
            normalizeMessage(message, index, currentUser)
        );
    }, [currentUser, messagesResponse, selectedProjectId]);

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
                projectId: selectedProjectId !== "global" ? selectedProjectId : null,
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
                projectId: selectedProjectId,
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
        if (
            awaitingReplyMeta.projectId != null &&
            awaitingReplyMeta.projectId !== "" &&
            String(awaitingReplyMeta.projectId) !== String(selectedProjectId)
        ) {
            return;
        }

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
    }, [awaitingReplyMeta, messages, selectedProjectId]);

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
        if (selectedProjectId !== "global") {
            payload.append("projectId", selectedProjectId);
        }

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
        <div className="flex h-full flex-col overflow-hidden">
            {/* Header with improved styling */}
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-900 to-[#6051E2] bg-clip-text text-transparent sm:text-3xl">
                        Project AI Assistant
                    </h1>
                    <p className="mt-1 text-sm font-medium text-slate-500 max-w-2xl">
                        Intelligent insights for your projects and tasks. Ask anything about risks, milestones, or project health.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="sm:hidden border-slate-200 bg-white/50 backdrop-blur-md hover:bg-white transition-all shadow-sm"
                    onClick={() => setIsProjectSidebarOpen(true)}
                    disabled={isProjectsLoading}
                >
                    <FiMenu className="mr-2 h-4 w-4" />
                    Projects
                </Button>
            </div>

            <div className="flex flex-1 min-h-0 relative gap-6">
                {/* Overlay for mobile */}
                {isProjectSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 sm:hidden transition-opacity duration-300"
                        onClick={() => setIsProjectSidebarOpen(false)}
                    />
                )}

                {/* Sidebar with Premium Design */}
                <aside
                    className={`w-72 rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl overflow-hidden flex flex-col fixed inset-y-4 left-4 z-50 transform transition-all duration-300 shadow-xl ${isProjectSidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
                        } sm:static sm:inset-auto sm:shadow-sm sm:bg-white/40 sm:rounded-xl`}
                >
                    <div className="p-5 border-b border-slate-200/50 bg-white/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Projects</div>
                                <div className="text-[10px] text-slate-500 font-medium">Select to analyze data</div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsProjectSidebarOpen(false)}
                                className="sm:hidden rounded-full p-1.5 bg-slate-100/50 hover:bg-slate-100 transition-colors"
                            >
                                <FiX className="h-4 w-4 text-slate-600" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                        {isProjectsLoading ? (
                            <div className="py-10 flex justify-center"><Loading /></div>
                        ) : isProjectsError ? (
                            <div className="px-4 py-4 text-xs font-medium text-red-500 bg-red-50 rounded-lg border border-red-100 text-center">
                                {projectsError?.message || "Error loading projects"}
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="px-4 py-10 text-xs text-slate-400 text-center italic font-medium">
                                No projects assigned yet.
                            </div>
                        ) : (
                            projects.map((project) => {
                                const active = project.id === selectedProjectId;
                                const isGlobal = project.id === "global";
                                
                                let bgClass = active
                                    ? "bg-[#6051E2] text-white shadow-sm"
                                    : "text-slate-600 hover:bg-white/80 hover:text-blue-900 hover:shadow-sm";
                                    
                                if (isGlobal) {
                                    bgClass = active
                                        ? "bg-emerald-600 text-white shadow-sm"
                                        : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm";
                                }

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
                                        className={`w-full group relative flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium cursor-pointer ${bgClass}`}
                                    >
                                        <div className={`h-2 w-2 rounded-full ${active || isGlobal ? "bg-white" : "bg-slate-300 group-hover:bg-[#6051E2]"}`} />
                                        <span className="truncate flex-1">{project.name}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </aside>

                {/* Chat Container with Modern Aesthetic */}
                <div className="flex-1 min-w-0 flex flex-col bg-slate-50/30 rounded-2xl border border-slate-200/40 backdrop-blur-sm overflow-hidden shadow-inner">
                    <div
                        ref={chatContainerRef}
                        className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar"
                    >
                        {!selectedProjectId ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                                <div className="h-20 w-20 rounded-3xl bg-white/80 shadow-sm flex items-center justify-center text-[#6051E2] animate-pulse">
                                    <FiRefreshCw className="h-10 w-10 opacity-20" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-slate-800">Ready to assist</h3>
                                    <p className="text-sm text-slate-500 font-medium">Please select a session from the sidebar to begin our conversation.</p>
                                </div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                <div className="p-4 bg-white/60 rounded-full border border-slate-100 mb-4 animate-bounce duration-1000">
                                    <div className="h-4 w-4 bg-[#6051E2] rounded-full" />
                                </div>
                                <p className="text-sm text-slate-400 font-medium italic">No conversation history yet. Start by asking a question!</p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={`${selectedProjectId}-${message.id}`}
                                    className={`flex items-end gap-3 max-w-[90%] sm:max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-500 ${message.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                        }`}
                                >
                                    {/* Avatar */}
                                    <div className={`flex flex-shrink-0 h-9 w-9 items-center justify-center rounded-2xl shadow-sm border transition-transform hover:scale-105 ${message.sender === "ai"
                                        ? "bg-gradient-to-br from-teal-500 to-teal-700 text-white border-teal-400/30"
                                        : "bg-white text-[#6051E2] border-slate-100"
                                        }`}>
                                        <span className="text-[10px] font-bold tracking-tighter">
                                            {message.sender === "ai" ? "AI" : "YOU"}
                                        </span>
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`group flex flex-col gap-1.5 ${message.sender === "user" ? "items-end" : "items-start"}`}>
                                        <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${message.sender === "ai"
                                            ? "bg-white/90 backdrop-blur-md text-slate-800 border border-slate-200/50 rounded-bl-none"
                                            : "bg-[#6051E2] text-white rounded-br-none"
                                            }`}>
                                            {message.text || <span className="italic opacity-70">Processing attachment...</span>}

                                            {message.documentUrl && (
                                                <a
                                                    href={message.documentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all ${message.sender === "ai"
                                                        ? "bg-slate-100 text-[#6051E2] hover:bg-slate-200"
                                                        : "bg-white/10 text-white hover:bg-white/20"
                                                        }`}
                                                >
                                                    <FiPaperclip className="h-3 w-3" />
                                                    <span className="truncate max-w-[150px]">{message.documentName || "Document"}</span>
                                                </a>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                                            {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}

                        {(sendMessageMutation.isPending || awaitingReplyMeta) && (
                            <div className="flex items-end gap-3 mr-auto animate-pulse">
                                <div className="h-9 w-9 rounded-2xl bg-teal-600/20 flex items-center justify-center text-teal-600 font-bold text-[10px]">AI</div>
                                <div className="bg-white/80 backdrop-blur-md px-5 py-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500" style={{ animationDelay: "0ms" }} />
                                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500" style={{ animationDelay: "150ms" }} />
                                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer / Input Area - Floating Style */}
                    {selectedProjectId && (
                        <div className="p-4 sm:p-6 bg-white/60 backdrop-blur-xl border-t border-slate-200/50">
                            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

                            <div className="flex items-center gap-4 mb-4">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 rounded-xl bg-slate-100/80 text-slate-500 hover:bg-[#6051E2]/10 hover:text-[#6051E2] transition-all cursor-pointer group"
                                    title="Attach File"
                                >
                                    <FiPaperclip className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                </button>

                                <button
                                    type="button"
                                    onClick={handleRefresh}
                                    disabled={isFetching}
                                    className="p-2 rounded-xl bg-slate-100/80 text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-all cursor-pointer disabled:opacity-40"
                                    title="Refresh Conversation"
                                >
                                    <FiRefreshCw className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`} />
                                </button>

                                {selectedFile && (
                                    <div className="flex-1 flex items-center gap-2 bg-[#6051E2]/5 border border-[#6051E2]/10 rounded-xl px-3 py-1.5 text-[#6051E2] animate-in zoom-in-95">
                                        <div className="p-1 bg-[#6051E2]/10 rounded-lg">
                                            <FiPaperclip className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="text-xs font-bold truncate max-w-[200px]">{selectedFile.name}</span>
                                        <button
                                            onClick={clearSelectedFile}
                                            className="ml-auto p-1 rounded-full hover:bg-[#6051E2]/10 transition-colors"
                                        >
                                            <FiX className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="relative group flex items-center">
                                <Input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Type your question here..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={sendMessageMutation.isPending}
                                    className="h-14 flex-1 rounded-2xl border-slate-200 bg-white/90 pl-6 pr-24 text-sm font-medium shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#6051E2]/20 focus-visible:border-[#6051E2] group-hover:border-[#6051E2]/40"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={(!inputValue.trim() && !selectedFile) || sendMessageMutation.isPending}
                                    className="absolute right-2 h-10 px-5 rounded-xl bg-gradient-to-br from-[#6051E2] to-[#4e3fca] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#6051E2]/20 hover:shadow-lg hover:shadow-[#6051E2]/30 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale cursor-pointer"
                                >
                                    <span>{sendMessageMutation.isPending ? "SENDING..." : "SEND"}</span>
                                    <FiArrowRight className="h-4 w-4" />
                                </button>
                            </div>

                            {/* AI Disclaimer */}
                            <div className="mt-4 flex justify-center">
                                <p className="text-[13px] text-slate-500 font-medium animate-in fade-in animate-duration-500 animate-delay-300 animate-once animate-ease-out  ">
                                    Project Pilot can make mistakes. Check important info.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </div>
    );

}
