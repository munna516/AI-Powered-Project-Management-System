"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { FiCheck } from "react-icons/fi";

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, label }) => {
    return (
        <div className="flex items-center justify-between py-3">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#6051E2] focus:ring-offset-2 cursor-pointer ${checked ? "bg-[#6051E2]" : "bg-slate-300"
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"
                        }`}
                />
            </button>
        </div>
    );
};

// Progress Bar Component
const ProgressBar = ({ label, value }) => {
    // Calculate percentage based on a max value of 100
    const percentage = Math.min((value / 100) * 100, 100);
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <span className="text-sm font-semibold text-slate-900">{value}</span>
            </div>
            <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-[#6051E2] rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

// Tool Connection Data
const tools = [
    {
        id: 1,
        name: "Microsoft Outlook",
        icon: (
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
            </div>
        ),
        connected: true,
        email: "user@example.com",
        status: "Connection successful, last tested: 2 minutes ago",
    },
    {
        id: 2,
        name: "Microsoft Teams",
        icon: (
            <div className="w-10 h-10 bg-[#6051E2] rounded-lg flex items-center justify-center relative">
                <span className="text-white font-bold text-lg">T</span>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-[#6051E2] rounded-full"></div>
                </div>
            </div>
        ),
        connected: false,
    },
    {
        id: 3,
        name: "Google Calendar",
        icon: (
            <div className="w-10 h-10 rounded-lg overflow-hidden flex">
                <div className="w-1/4 bg-blue-500"></div>
                <div className="w-1/4 bg-green-500"></div>
                <div className="w-1/4 bg-yellow-500"></div>
                <div className="w-1/4 bg-red-500"></div>
            </div>
        ),
        connected: false,
    },
    {
        id: 4,
        name: "Outlook calendar",
        icon: (
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
            </div>
        ),
        connected: false,
    },
    {
        id: 5,
        name: "Gmail",
        icon: (
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
            </div>
        ),
        connected: false,
    },
    {
        id: 6,
        name: "Azure AD",
        icon: (
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center transform rotate-45">
                <div className="w-6 h-6 bg-white rounded-sm"></div>
            </div>
        ),
        connected: false,
    },
    {
        id: 7,
        name: "OKTA",
        icon: (
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
            </div>
        ),
        connected: false,
    },
];

export default function DataSource() {
    const [aiSettings, setAiSettings] = useState({
        tasks: true,
        risks: true,
        issues: true,
        actions: true,
        decisions: true,
    });

    const [connectedTools, setConnectedTools] = useState(
        tools.map((tool) => tool.connected)
    );

    // Modal states
    const [isAzureModalOpen, setIsAzureModalOpen] = useState(false);
    const [isOktaModalOpen, setIsOktaModalOpen] = useState(false);

    // Azure AD form data
    const [azureFormData, setAzureFormData] = useState({
        tenantId: "",
        clientId: "",
        secret: "",
    });

    // OKTA form data
    const [oktaFormData, setOktaFormData] = useState({
        domain: "",
        apiToken: "",
    });

    const handleToggle = (key) => {
        setAiSettings((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleConnect = (index) => {
        const tool = tools[index];

        // Check if it's Azure AD or OKTA
        if (tool.name === "Azure AD") {
            setIsAzureModalOpen(true);
            return;
        }

        if (tool.name === "OKTA") {
            setIsOktaModalOpen(true);
            return;
        }

        // For other tools, connect directly
        if (connectedTools[index]) {
            setConnectedTools((prev) => {
                const newState = [...prev];
                newState[index] = false;
                return newState;
            });
            toast.success(`${tool.name} disconnected successfully`);
        } else {
            setConnectedTools((prev) => {
                const newState = [...prev];
                newState[index] = true;
                return newState;
            });
            toast.success(`${tool.name} connected successfully`);
        }
    };

    const handleAzureConnect = () => {
        if (!azureFormData.tenantId || !azureFormData.clientId || !azureFormData.secret) {
            toast.error("Please fill in all fields");
            return;
        }

        // Find Azure AD index
        const azureIndex = tools.findIndex((tool) => tool.name === "Azure AD");
        if (azureIndex !== -1) {
            setConnectedTools((prev) => {
                const newState = [...prev];
                newState[azureIndex] = true;
                return newState;
            });
            toast.success("Azure AD connected successfully");
            setIsAzureModalOpen(false);
            setAzureFormData({ tenantId: "", clientId: "", secret: "" });
        }
    };

    const handleOktaConnect = () => {
        if (!oktaFormData.domain || !oktaFormData.apiToken) {
            toast.error("Please fill in all fields");
            return;
        }

        // Find OKTA index
        const oktaIndex = tools.findIndex((tool) => tool.name === "OKTA");
        if (oktaIndex !== -1) {
            setConnectedTools((prev) => {
                const newState = [...prev];
                newState[oktaIndex] = true;
                return newState;
            });
            toast.success("OKTA connected successfully");
            setIsOktaModalOpen(false);
            setOktaFormData({ domain: "", apiToken: "" });
        }
    };

    const handleDisconnect = (index) => {
        const tool = tools[index];
        setConnectedTools((prev) => {
            const newState = [...prev];
            newState[index] = false;
            return newState;
        });
        toast.success(`${tool.name} disconnected successfully`);
    };

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Data Source
                </h1>
                <p className="text-sm sm:text-base text-slate-600 mt-2">
                    Overview of your projects and team performance
                </p>
            </div>

            {/* Data Source & AI Configuration Section */}
            <Card className="bg-white">
                <CardContent className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                            Data Source & AI configuration
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600">
                            Connect your tools & configure what our AI should automatically identify from your data
                        </p>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                        {/* Recent Activity */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6">
                                Recent Activity
                            </h3>
                            <div className="space-y-5">
                                <ProgressBar label="Tasks" value={48} />
                                <ProgressBar label="Risks" value={65} />
                                <ProgressBar label="Issues" value={65} />
                                <ProgressBar label="Actions" value={65} />
                                <ProgressBar label="Decisions" value={65} />
                            </div>
                        </div>

                        {/* AI Extraction Settings */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                AI Extraction Settings
                            </h3>
                            <p className="text-sm text-slate-600 mb-6">
                                Choose what the ai should automatically identify
                            </p>
                            <div className="space-y-1">
                                <ToggleSwitch
                                    label="Tasks"
                                    checked={aiSettings.tasks}
                                    onChange={() => handleToggle("tasks")}
                                />
                                <ToggleSwitch
                                    label="Risks"
                                    checked={aiSettings.risks}
                                    onChange={() => handleToggle("risks")}
                                />
                                <ToggleSwitch
                                    label="Issues"
                                    checked={aiSettings.issues}
                                    onChange={() => handleToggle("issues")}
                                />
                                <ToggleSwitch
                                    label="Actions"
                                    checked={aiSettings.actions}
                                    onChange={() => handleToggle("actions")}
                                />
                                <ToggleSwitch
                                    label="Decisions"
                                    checked={aiSettings.decisions}
                                    onChange={() => handleToggle("decisions")}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Connect your tools Section */}
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
                    Connect your tools
                </h2>
                <div className="space-y-4">
                    {tools.map((tool, index) => (
                        <Card
                            key={tool.id}
                            className="bg-white hover:shadow-md transition-shadow"
                        >
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex-shrink-0">{tool.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">
                                                {tool.name}
                                            </h3>
                                            {connectedTools[index] ? (
                                                <div className="space-y-1">
                                                    {tool.name === "Azure AD" || tool.name === "OKTA" ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                            <span className="text-sm text-green-500">
                                                                Connected
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                                <span className="text-sm text-green-600">
                                                                    Connected
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-green-700">
                                                                {tool.status}
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-600">
                                                    Not Connected
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {connectedTools[index] ? (
                                            tool.name === "Azure AD" || tool.name === "OKTA" ? (
                                                <Button
                                                    onClick={() => handleDisconnect(index)}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 cursor-pointer w-full sm:w-auto"
                                                >
                                                    Disconnect
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleDisconnect(index)}
                                                    variant="outline"
                                                    className="bg-red-500 text-white  px-6 py-2 cursor-pointer w-full sm:w-auto"
                                                >
                                                    Disconnect
                                                </Button>
                                            )
                                        ) : (
                                            <Button
                                                onClick={() => handleConnect(index)}
                                                className="bg-[#6051E2] hover:bg-[#4a3db8] text-white px-6 py-2 cursor-pointer flex-shrink-0 w-full sm:w-auto"
                                            >
                                                Connect
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Azure AD Connection Modal */}
            <Dialog open={isAzureModalOpen} onOpenChange={setIsAzureModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">
                            Connect Azure AD
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Tenant ID
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter Tenant ID"
                                value={azureFormData.tenantId}
                                onChange={(e) =>
                                    setAzureFormData({
                                        ...azureFormData,
                                        tenantId: e.target.value,
                                    })
                                }
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Client ID
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter Client ID"
                                value={azureFormData.clientId}
                                onChange={(e) =>
                                    setAzureFormData({
                                        ...azureFormData,
                                        clientId: e.target.value,
                                    })
                                }
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Secret
                            </label>
                            <Input
                                type="password"
                                placeholder="Enter Secret"
                                value={azureFormData.secret}
                                onChange={(e) =>
                                    setAzureFormData({
                                        ...azureFormData,
                                        secret: e.target.value,
                                    })
                                }
                                className="w-full"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsAzureModalOpen(false);
                                    setAzureFormData({ tenantId: "", clientId: "", secret: "" });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAzureConnect}
                                className="bg-[#6051E2] hover:bg-[#4a3db8] text-white cursor-pointer"
                            >
                                Connect
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* OKTA Connection Modal */}
            <Dialog open={isOktaModalOpen} onOpenChange={setIsOktaModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">
                            Connect OKTA
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Domain
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter Domain"
                                value={oktaFormData.domain}
                                onChange={(e) =>
                                    setOktaFormData({
                                        ...oktaFormData,
                                        domain: e.target.value,
                                    })
                                }
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                API Token
                            </label>
                            <Input
                                type="password"
                                placeholder="Enter API Token"
                                value={oktaFormData.apiToken}
                                onChange={(e) =>
                                    setOktaFormData({
                                        ...oktaFormData,
                                        apiToken: e.target.value,
                                    })
                                }
                                className="w-full"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsOktaModalOpen(false);
                                    setOktaFormData({ domain: "", apiToken: "" });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleOktaConnect}
                                className="bg-[#6051E2] hover:bg-[#4a3db8] text-white cursor-pointer"
                            >
                                Connect
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
