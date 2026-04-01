"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { PiMicrosoftOutlookLogo } from "react-icons/pi";
import { BiLogoMicrosoftTeams } from "react-icons/bi";
import { GoMail } from "react-icons/go";
import { SiGooglecalendar } from "react-icons/si";
import { apiDelete, apiGet } from "@/lib/api";
// Tool Connection Data
const tools = [
    {
        id: 1,
        name: "Microsoft Outlook",
        icon: (
            <PiMicrosoftOutlookLogo className="w-10 h-10 text-blue-500" />
        ),
        connected: false
    },
    {
        id: 3,
        name: "Google Calendar",
        icon: (
            <SiGooglecalendar className="w-10 h-10 text-blue-500" />
        ),
        connected: false,
    },
    {
        id: 4,
        name: "Gmail",
        icon: (
            <GoMail className="w-10 h-10 text-blue-500" />
        ),
        connected: false,
    },

];

const OUTLOOK_TOOL_ID = 1;
const GOOGLE_CALENDAR_TOOL_ID = 3;
const GMAIL_TOOL_ID = 4;
const CONNECTABLE_TOOLS = {
    [OUTLOOK_TOOL_ID]: {
        connectEndpoint: "/api/project-manager/outlook/connect",
        disconnectEndpoint: "/api/project-manager/outlook/disconnect",
        statusEndpoint: "/api/email-account-connection/status",
        statusParams: {
            category: "social",
        },
        popupName: "outlook-connect",
        successMessage: "Outlook connected successfully",
        disconnectMessage: "Outlook disconnected successfully",
        getConnectionInfo: (response) => {
            const accounts = Array.isArray(response?.data) ? response.data : [];
            const outlookAccount = accounts.find(
                (account) => String(account?.source || "").toUpperCase() === "OUTLOOK"
            );

            return {
                isConnected: Boolean(outlookAccount?.isConnected),
                email: outlookAccount?.email || "",
            };
        },
    },
    [GMAIL_TOOL_ID]: {
        connectEndpoint: "/api/email-account-connection/connect",
        disconnectEndpoint: "/api/email-account-connection/disconnect",
        statusEndpoint: "/api/email-account-connection/status",
        statusParams: {
            category: "social",
        },
        popupName: "gmail-connect",
        successMessage: "Gmail connected successfully",
        disconnectMessage: "Gmail disconnected successfully",
        getConnectionInfo: (response) => {
            const accounts = Array.isArray(response?.data) ? response.data : [];
            const gmailAccount = accounts.find(
                (account) => String(account?.source || "").toUpperCase() === "GMAIL"
            );

            return {
                isConnected: Boolean(gmailAccount?.isConnected),
                email: gmailAccount?.email || "",
            };
        },
    },
};

function getAuthUrl(response) {
    return response?.url || response?.data?.url || null;
}

export default function DataSource() {
    const initialConnectionState = useMemo(
        () =>
            Object.fromEntries(
                tools.map((tool) => [tool.id, tool.connected])
            ),
        []
    );
    const [connectedTools, setConnectedTools] = useState(initialConnectionState);
    const [toolConnectionInfo, setToolConnectionInfo] = useState({});
    const [loadingToolId, setLoadingToolId] = useState(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);
    const isGmailConnected = Boolean(connectedTools[GMAIL_TOOL_ID]);

    useEffect(() => {
        loadConnectionStatuses();

        const handleWindowFocus = () => {
            loadConnectionStatuses(false);
        };

        window.addEventListener("focus", handleWindowFocus);
        return () => window.removeEventListener("focus", handleWindowFocus);
    }, []);

    const updateToolConnection = (toolId, isConnected) => {
        setConnectedTools((prev) => ({
            ...prev,
            [toolId]: isConnected,
        }));
    };

    useEffect(() => {
        setConnectedTools((prev) => ({
            ...prev,
            [GOOGLE_CALENDAR_TOOL_ID]: isGmailConnected,
        }));
        setToolConnectionInfo((prev) => ({
            ...prev,
            [GOOGLE_CALENDAR_TOOL_ID]: {
                isConnected: isGmailConnected,
                email: isGmailConnected
                    ? prev[GMAIL_TOOL_ID]?.email || ""
                    : "",
            },
        }));
    }, [isGmailConnected, toolConnectionInfo[GMAIL_TOOL_ID]?.email]);

    const loadConnectionStatuses = async (showLoader = true) => {
        if (showLoader) {
            setIsCheckingStatus(true);
        }

        try {
            const statusEntries = await Promise.all(
                Object.entries(CONNECTABLE_TOOLS).map(async ([toolId, config]) => {
                    try {
                        const response = await apiGet(config.statusEndpoint, {
                            params: config.statusParams,
                        });
                        return [Number(toolId), config.getConnectionInfo(response)];
                    } catch {
                        return [Number(toolId), { isConnected: false, email: "" }];
                    }
                })
            );

            const statusMap = Object.fromEntries(statusEntries);

            setConnectedTools((prev) => ({
                ...prev,
                ...Object.fromEntries(
                    Object.entries(statusMap).map(([toolId, info]) => [
                        Number(toolId),
                        info.isConnected,
                    ])
                ),
            }));
            setToolConnectionInfo((prev) => ({
                ...prev,
                ...statusMap,
            }));

            return statusMap;
        } finally {
            if (showLoader) {
                setIsCheckingStatus(false);
            }
        }
    };

    const handleConnect = async (index) => {
        const tool = tools[index];
        const config = CONNECTABLE_TOOLS[tool.id];

        if (config) {
            setLoadingToolId(tool.id);
            try {
                const response = await apiGet(config.connectEndpoint);
                const isConnected = Boolean(response?.isConnected ?? response?.data?.isConnected);
                const authUrl = getAuthUrl(response);

                if (isConnected) {
                    updateToolConnection(tool.id, true);
                    setToolConnectionInfo((prev) => ({
                        ...prev,
                        [tool.id]: config.getConnectionInfo(response),
                    }));
                    toast.success(config.successMessage);
                    setLoadingToolId(null);
                    return;
                }

                if (!authUrl) {
                    toast.error(`Failed to get ${tool.name} connection URL`);
                    setLoadingToolId(null);
                    return;
                }

                const popup = window.open(
                    authUrl,
                    config.popupName,
                    "width=600,height=700,noopener,noreferrer"
                );

                if (!popup) {
                    window.location.href = authUrl;
                    return;
                }

                const popupTimer = window.setInterval(async () => {
                    if (!popup.closed) return;

                    window.clearInterval(popupTimer);
                    const statusMap = await loadConnectionStatuses(false);
                    if (statusMap?.[tool.id]?.isConnected) {
                        toast.success(config.successMessage);
                    } else {
                        toast.error(`${tool.name} is not connected yet`);
                    }
                    setLoadingToolId(null);
                }, 1000);

                return;
            } catch (error) {
                toast.error(error?.message || `Failed to connect ${tool.name}`);
                setLoadingToolId(null);
            }
            return;
        }

        if (connectedTools[tool.id]) {
            updateToolConnection(tool.id, false);
            toast.success(`${tool.name} disconnected successfully`);
        } else {
            updateToolConnection(tool.id, true);
            toast.success(`${tool.name} connected successfully`);
        }
    };

    const handleDisconnect = async (index) => {
        const tool = tools[index];
        const config = CONNECTABLE_TOOLS[tool.id];

        if (config) {
            setLoadingToolId(tool.id);
            try {
                await apiDelete(config.disconnectEndpoint);
                updateToolConnection(tool.id, false);
                setToolConnectionInfo((prev) => ({
                    ...prev,
                    [tool.id]: { isConnected: false, email: "" },
                }));
                toast.success(config.disconnectMessage);
            } catch (error) {
                toast.error(error?.message || `Failed to disconnect ${tool.name}`);
            } finally {
                setLoadingToolId(null);
            }
            return;
        }

        updateToolConnection(tool.id, false);
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



            {/* Connect your tools Section */}
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
                    Connect your tools
                </h2>
                <div className="space-y-4">
                    {tools.map((tool, index) => {
                        const isSupportedTool = Boolean(CONNECTABLE_TOOLS[tool.id]);
                        const isAutoConnectedTool = tool.id === GOOGLE_CALENDAR_TOOL_ID;
                        const isActionDisabled =
                            !isSupportedTool ||
                            isAutoConnectedTool ||
                            loadingToolId === tool.id ||
                            isCheckingStatus;

                        return (
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
                                            {connectedTools[tool.id] ? (
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
                                                            {toolConnectionInfo[tool.id]?.email ? (
                                                                <p className="text-xs text-green-700">
                                                                    {toolConnectionInfo[tool.id].email}
                                                                </p>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-600">
                                                    Not Connected
                                                </p>
                                            )}
                                            {isAutoConnectedTool ? (
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Synced with Gmail connection
                                                </p>
                                            ) : !isSupportedTool ? (
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Coming soon
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {isAutoConnectedTool ? (
                                            <div className="group relative inline-flex">
                                                <button
                                                    type="button"
                                                    disabled
                                                    className={`relative inline-flex h-10 items-center justify-center rounded-full border px-5 text-sm font-medium shadow-sm transition-all ${
                                                        connectedTools[tool.id]
                                                            ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700"
                                                            : "border-slate-200 bg-slate-50 text-slate-500"
                                                    }`}
                                                >
                                                    <span
                                                        className={`mr-2 h-2.5 w-2.5 rounded-full ${
                                                            connectedTools[tool.id]
                                                                ? "bg-emerald-500"
                                                                : "bg-slate-300"
                                                        }`}
                                                    />
                                                    Auto connected
                                                </button>
                                                <div className="pointer-events-none absolute -top-12 left-1/2 z-10 w-64 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-center text-xs text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                                                    When you connect Gmail, Google Calendar connects automatically.
                                                </div>
                                            </div>
                                        ) : connectedTools[tool.id] ? (
                                            tool.name === "Azure AD" || tool.name === "OKTA" ? (
                                                <Button
                                                    onClick={() => handleDisconnect(index)}
                                                    disabled={isActionDisabled}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 cursor-pointer w-full sm:w-auto"
                                                >
                                                    {loadingToolId === tool.id ? "Disconnecting..." : "Disconnect"}
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleDisconnect(index)}
                                                    variant="outline"
                                                    disabled={isActionDisabled}
                                                    className="bg-red-500 text-white  px-6 py-2 cursor-pointer w-full sm:w-auto"
                                                >
                                                    {loadingToolId === tool.id ? "Disconnecting..." : "Disconnect"}
                                                </Button>
                                            )
                                        ) : (
                                            <Button
                                                onClick={() => handleConnect(index)}
                                                disabled={isActionDisabled}
                                                className={`px-6 py-2 flex-shrink-0 w-full sm:w-auto ${
                                                    isSupportedTool
                                                        ? "bg-[#6051E2] hover:bg-[#4a3db8] text-white cursor-pointer"
                                                        : "bg-slate-200 text-slate-400 cursor-not-allowed hover:bg-slate-200"
                                                }`}
                                            >
                                                {!isSupportedTool
                                                    ? "Connect"
                                                    : loadingToolId === tool.id
                                                    ? "Connecting..."
                                                    : "Connect"}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        );
                    })}
                </div>
            </div>

            {/* Azure AD Connection Modal */}
            {/* <Dialog open={isAzureModalOpen} onOpenChange={setIsAzureModalOpen}>
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
            </Dialog> */}

            {/* OKTA Connection Modal */}
            {/* <Dialog open={isOktaModalOpen} onOpenChange={setIsOktaModalOpen}>
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
            </Dialog> */}
        </div>
    );
}
