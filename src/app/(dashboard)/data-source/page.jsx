"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { PiMicrosoftOutlookLogo } from "react-icons/pi";
import { BiLogoMicrosoftTeams } from "react-icons/bi";
import { GoMail } from "react-icons/go";
import { SiGooglecalendar } from "react-icons/si";
import { apiGet } from "@/lib/api";
// Tool Connection Data
const tools = [
    {
        id: 1,
        name: "Microsoft Outlook",
        icon: (
           <PiMicrosoftOutlookLogo className="w-10 h-10 text-blue-500" />
        ),
        connected: true,
        email: "user@example.com",
        status: "Connection successful, last tested: 2 minutes ago",
    },
    {
        id: 2,
        name: "Microsoft Teams",
        icon: (
            <BiLogoMicrosoftTeams className="w-10 h-10 text-blue-500" />
        ),
        connected: false,
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

const GMAIL_TOOL_ID = 4;
const GMAIL_CONNECTION_KEY = "gmail_connected";

export default function DataSource() {

    const [connectedTools, setConnectedTools] = useState(
        tools.map((tool) => tool.connected)
    );
    const [isConnectingGmail, setIsConnectingGmail] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const isGmailConnected = localStorage.getItem(GMAIL_CONNECTION_KEY) === "true";
        if (!isGmailConnected) return;

        setConnectedTools((prev) =>
            prev.map((connected, index) =>
                tools[index]?.id === GMAIL_TOOL_ID ? true : connected
            )
        );
    }, []);

    const handleConnect = async (index) => {
        const tool = tools[index];

        if (tool.id === GMAIL_TOOL_ID) {
            setIsConnectingGmail(true);
            try {
                const response = await apiGet("/api/email-account-connection/connect");
                console.log("response", response);
                const authUrl = response?.url || response?.data?.url;

                if (!authUrl) {
                    setIsConnectingGmail(false);
                    toast.error("Failed to get Gmail connection URL");
                    return;
                }

                const popup = window.open(
                    authUrl,
                    "gmail-connect",
                    "width=600,height=700,noopener,noreferrer"
                );

                if (!popup) {
                    window.location.href = authUrl;
                    return;
                }

                const popupTimer = window.setInterval(() => {
                    if (!popup.closed) return;

                    window.clearInterval(popupTimer);
                    localStorage.setItem(GMAIL_CONNECTION_KEY, "true");
                    setConnectedTools((prev) => {
                        const newState = [...prev];
                        newState[index] = true;
                        return newState;
                    });
                    toast.success("Gmail connected successfully");
                    setIsConnectingGmail(false);
                }, 1000);

                return;
            } catch (error) {
                setIsConnectingGmail(false);
                toast.error(error?.message || "Failed to connect Gmail");
            }
            return;
        }

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

    const handleDisconnect = (index) => {
        const tool = tools[index];
        if (tool.id === GMAIL_TOOL_ID && typeof window !== "undefined") {
            localStorage.removeItem(GMAIL_CONNECTION_KEY);
        }
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
                                                disabled={tool.id === GMAIL_TOOL_ID && isConnectingGmail}
                                                className="bg-[#6051E2] hover:bg-[#4a3db8] text-white px-6 py-2 cursor-pointer flex-shrink-0 w-full sm:w-auto"
                                            >
                                                {tool.id === GMAIL_TOOL_ID && isConnectingGmail ? "Connecting..." : "Connect"}
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
