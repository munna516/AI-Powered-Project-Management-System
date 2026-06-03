"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import Loading from "@/components/Loading/Loading";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";


const chartData = [
    { month: "Jan", value: 95000 },
    { month: "Feb", value: 80000 },
    { month: "Mar", value: 20000 },
    { month: "Apr", value: 160000 },
    { month: "May", value: 190000 },
    { month: "Jun", value: 85000 },
    { month: "Jul", value: 50000 },
    { month: "Aug", value: 90000 },
    { month: "Sep", value: 85000 },
    { month: "Oct", value: 90000 },
    { month: "Nov", value: 150000 },
    { month: "Dec", value: 120000 },
];

const managers = [
    {
        name: "Floyd Miles",
        email: "el.vance@example.com",
        projects: "5 Projects",
    },
    {
        name: "Brooklyn Simmons",
        email: "el.vance@example.com",
        projects: "5 Projects",
    },
    {
        name: "Emily Johnson",
        email: "em.johnson@example.com",
        projects: "4 Projects",
    },
    {
        name: "Brooklyn Simmons",
        email: "el.vance@example.com",
        projects: "6 Projects",
    },
    {
        name: "Robert Fox",
        email: "el.vance@example.com",
        projects: "5 Projects",
    },
    {
        name: "Jacob Jones",
        email: "el.vance@example.com",
        projects: "5 Projects",
    },
    {
        name: "Samantha Green",
        email: "samantha.green@example.com",
        projects: "3 Projects",
    },
    {
        name: "Ethan Hunt",
        email: "ethan.hunt@example.com",
        projects: "7 Projects",
    },
    {
        name: "William Johnson",
        email: "will.j@example.com",
        projects: "2 Projects",
    },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#6051E2] text-white text-xs px-2 py-1 rounded shadow-md">
                {`${payload[0].value}`}
            </div>
        );
    }
    return null;
};

export default function AdminDashboard() {
    const [selectedManager, setSelectedManager] = useState(null);
    const { data: dashboardResponse, isLoading, isError } = useQuery({
        queryKey: ["admin-dashboard"],
        queryFn: () => apiGet("/api/admin/dashboard"),
    });

    const dashboardData = dashboardResponse?.data?.data || dashboardResponse?.data || {};
    const stats = dashboardData.stats || {};
    const kpiChart = (dashboardData.kpiChart || []).map(item => ({
        ...item,
        month: item.month.charAt(0).toUpperCase() + item.month.slice(1),
        value: item.ongoing // Use ongoing for the growth line
    }));

    const totalCompleted = (dashboardData.kpiChart || []).reduce((acc, curr) => acc + (curr.completed || 0), 0);
    const totalCancelled = (dashboardData.kpiChart || []).reduce((acc, curr) => acc + (curr.cancelled || 0), 0);
    const managers = dashboardData.projectManagers || [];

    if (isLoading) return <Loading />;

    if (isError) {
        return (
            <div className="flex h-[400px] items-center justify-center text-slate-500">
                Failed to load dashboard data.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Admin Overview</h1>
                <p className="text-slate-500 text-sm">
                    Overview of your projects and team performance
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-emerald-100 border-none shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Ongoing Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{stats.activeProjects || 0}</div>
                    </CardContent>
                </Card>
                <Card className="bg-rose-100 border-none shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Completed Project
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{totalCompleted}</div>
                    </CardContent>
                </Card>
                <Card className="bg-purple-100 border-none shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Cancel
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{totalCancelled}</div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-100 border-none shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Overall Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{stats.overallHealth || 0}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Chart Section */}
            <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                    <CardTitle className="text-base font-semibold text-color-[#201B51]">
                        Project Growth
                    </CardTitle>
                    <button className="text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded px-3 py-1.5 shadow-sm">
                        {new Date().getFullYear()} Overview
                    </button>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={kpiChart}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#E2E8F0"
                                />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748B", fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748B", fontSize: 12 }}
                                    tickFormatter={(value) => value}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={false} />
                                <Line
                                    type="linear"
                                    dataKey="value"
                                    stroke="#6051E2"
                                    strokeWidth={1.5}
                                    dot={{
                                        r: 4,
                                        fill: "#fff",
                                        stroke: "#6051E2",
                                        strokeWidth: 1.5,
                                    }}
                                    activeDot={{
                                        r: 6,
                                        fill: "#6051E2",
                                        stroke: "#fff",
                                        strokeWidth: 2,
                                    }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Manager List Section */}
            <div className="space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-[#6051E2] hover:bg-[#6051E2]">
                            <TableRow className="hover:bg-[#6051E2] border-none">
                                <TableHead className="text-white font-semibold h-12 w-[25%] pl-6">
                                    Name
                                </TableHead>
                                <TableHead className="text-white font-semibold h-12 w-[35%]">
                                    Email
                                </TableHead>
                                <TableHead className="text-white font-semibold h-12 w-[25%]">
                                    Assigned Projects
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {managers.length > 0 ? (
                                managers.map((manager, index) => (
                                    <TableRow 
                                        key={manager.id || index} 
                                        className="hover:bg-slate-50 border-slate-100 cursor-pointer transition-colors"
                                        onClick={() => setSelectedManager(manager)}
                                    >
                                        <TableCell className="font-medium text-slate-700 pl-6 py-4">
                                            {manager.name}
                                        </TableCell>
                                        <TableCell className="text-slate-500 py-4">
                                            {manager.email}
                                        </TableCell>
                                        <TableCell className="text-slate-500 py-4">
                                            {manager.assignedProjects} {manager.assignedProjects === 1 ? 'Project' : 'Projects'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                                        No project managers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <Dialog open={!!selectedManager} onOpenChange={(open) => !open && setSelectedManager(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">Project Manager Details</DialogTitle>
                    </DialogHeader>
                    {selectedManager && (
                        <div className="space-y-4 py-4">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Name</h4>
                                <p className="text-base font-medium text-slate-900">{selectedManager.name}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Email</h4>
                                <p className="text-base font-medium text-slate-900">{selectedManager.email}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Assigned Projects</h4>
                                <p className="text-base font-medium text-slate-900">
                                    {selectedManager.assignedProjects} {selectedManager.assignedProjects === 1 ? 'Project' : 'Projects'}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}