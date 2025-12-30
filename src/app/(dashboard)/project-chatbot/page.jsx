"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiArrowRight, FiRefreshCw, FiSearch, FiPaperclip } from "react-icons/fi";

// Initial messages
const initialMessages = [
    {
        id: 1,
        sender: "ai",
        text: "Hello! How can I assist you today with your project management needs?",
    },
];

// AI response templates based on user queries  
const getAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("phoenix") && lowerMessage.includes("status")) {
        return "The 'Phoenix' project is currently in the 'Execution' phase. The project is on track with a completion rate of 65%. There are two open tasks and one identified risk regarding resource allocation.";
    }

    if (lowerMessage.includes("task") || lowerMessage.includes("open task")) {
        return "Certainly. The open tasks for the 'Phoenix' project are: 1. 'Finalize Marketing Strategy' due in 5 days, assigned to Sarah Lee. 2. 'Conduct User Testing' due in 10 days, assigned to David Chen.";
    }

    if (lowerMessage.includes("risk") || lowerMessage.includes("resource")) {
        return "The risk is related to potential delays due to the limited availability of key personnel. The mitigation plan involves cross-training team members to ensure task coverage.";
    }

    // Default responses
    const defaultResponses = [
        "I understand your question. Let me help you with that.",
        "Based on the project data, I can provide you with the following information.",
        "That's a great question! Here's what I found in the project records.",
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

export default function ProjectChatbot() {
    const [messages, setMessages] = useState(initialMessages);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSend = () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();

        // Add user message
        const newUserMessage = {
            id: Date.now(),
            sender: "user",
            text: userMessage,
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setInputValue("");
        setIsLoading(true);

        // Simulate AI response after 2-3 seconds
        const delay = Math.random() * 1000 + 2000; // 2000-3000ms

        setTimeout(() => {
            const aiResponse = {
                id: Date.now() + 1,
                sender: "ai",
                text: getAIResponse(userMessage),
            };

            setMessages((prev) => [...prev, aiResponse]);
            setIsLoading(false);
        }, delay);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] sm:h-[calc(100vh-10rem)] max-w-7xl mx-auto  overflow-x-hidden">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-2">
                    Project AI Chatbot
                </h1>
                <p className="text-sm sm:text-base text-slate-600">
                    Ask me anything about your projects, tasks, risks, issues, and actions. I'm here to help you stay on top of your work.
                </p>
            </div>

            {/* Chat Messages Area */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 mb-4 sm:mb-6 pr-2"
            >
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex items-start gap-3 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"
                            }`}
                    >
                        {/* Avatar and Name Container */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            <span className={`text-xs text-slate-500 ${message.sender === "user" ? "text-right" : "text-left"}`}>
                                {message.sender === "ai" ? "Project AI" : "User"}
                            </span>
                            <div
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${message.sender === "ai"
                                    ? "bg-teal-700 text-white"
                                    : "bg-slate-200 text-orange-600"
                                    }`}
                            >
                                {message.sender === "ai" ? (
                                    <span className="text-xs sm:text-sm font-semibold">A</span>
                                ) : (
                                    <span className="text-xs sm:text-sm font-semibold">U</span>
                                )}
                            </div>
                        </div>

                        {/* Message Bubble */}
                        <div className="flex flex-col max-w-[75%] sm:max-w-[70%] mt-5">
                            <div
                                className={`rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 border-0 ${message.sender === "ai"
                                    ? "bg-purple-100 text-slate-900"
                                    : "bg-[#6051E2] text-white"
                                    }`}
                            >
                                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                                    {message.text}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        {/* Avatar and Name Container */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            <span className="text-xs text-slate-500 text-left">Project AI</span>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-teal-700 text-white flex items-center justify-center">
                                <span className="text-xs sm:text-sm font-semibold">A</span>
                            </div>
                        </div>
                        {/* Loading Bubble */}
                        <div className="flex flex-col max-w-[75%] sm:max-w-[70%] mt-5">
                            <div className="bg-purple-100 rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 border-0">
                                <div className="flex gap-1.5 items-center">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Section */}
            <div className="pt-4">
                {/* Action Labels - Left of Input */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-3 text-xs sm:text-sm text-slate-500">
                    <button className="flex items-center gap-1.5 hover:text-slate-700 transition-colors cursor-pointer">
                        <FiPaperclip className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>Attach</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-slate-700 transition-colors cursor-pointer">
                        <FiSearch className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>Search</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-slate-700 transition-colors cursor-pointer">
                        <FiRefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>Refresh</span>
                    </button>
                </div>

                {/* Input Field with Send Button */}
                <div className="flex gap-2 sm:gap-3">
                    <Input
                        type="text"
                        placeholder="Ask anything"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        className="flex-1 bg-white border-slate-300 rounded-lg text-sm sm:text-base placeholder:text-slate-400 focus-visible:ring-[#6051E2] focus-visible:border-[#6051E2] disabled:opacity-50 h-10 sm:h-11"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isLoading}
                        className="bg-[#6051E2] text-white hover:bg-[#6051E2]/90 px-4 sm:px-6 h-10 sm:h-11 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <FiArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-sm font-medium">Send</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
