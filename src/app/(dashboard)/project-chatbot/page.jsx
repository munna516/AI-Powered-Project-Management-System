"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    FiArrowRight,
    FiPaperclip,
    FiRefreshCw,
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
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const inputRef = useRef(null);

    const {
        data: messagesResponse,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: CHAT_QUERY_KEY,
        queryFn: () => apiGet("/api/project-manager/project-chatbot/all"),
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
            await queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEY });
        },
        onError: (mutationError) => {
            toast.error(mutationError?.message || "Failed to send message.");
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
        if ((!inputValue.trim() && !selectedFile) || sendMessageMutation.isPending) {
            return;
        }

        const payload = new FormData();
        payload.append("content", inputValue.trim());
        payload.append("sender", "USER");

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
        <div className="mx-auto flex h-[calc(100vh-2rem)] max-w-[1440px] flex-col overflow-x-hidden sm:h-[calc(100vh-10rem)]">
            <div className="mb-4 sm:mb-6">
                <h1 className="mb-2 text-2xl font-bold text-blue-900 sm:text-3xl">
                    Project AI Chatbot
                </h1>
                <p className="text-sm text-slate-600 sm:text-base">
                    Ask me anything about your projects, tasks, risks, issues, and actions. I'm here to help you stay on top of your work.
                </p>
            </div>

            <div
                ref={chatContainerRef}
                className="mb-4 flex-1 space-y-4 overflow-x-hidden overflow-y-auto pr-2 sm:mb-6"
            >
                {messages.length === 0 ? (
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
                        <FiRefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isFetching ? "animate-spin" : ""}`} />
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
        </div>
    );
}
