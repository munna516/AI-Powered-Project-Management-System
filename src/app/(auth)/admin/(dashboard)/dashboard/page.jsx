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
                {`${(payload[0].value / 1000).toFixed(0)}k`}
            </div>
        );
    }
    return null;
};

export default function AdminDashboard() {
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-emerald-100 border-none shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Ongoing Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">1,240</div>
                    </CardContent>
                </Card>
                <Card className="bg-rose-100 border-none shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Completed Project
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">500</div>
                    </CardContent>
                </Card>
                <Card className="bg-purple-100 border-none shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Cancel
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">5</div>
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
                        Jan 01-Dec 31
                    </button>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartData}
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
                                    tickFormatter={(value) =>
                                        value === 0 ? "0" : `${value / 1000}k`
                                    }
                                    domain={[0, 200000]}
                                    ticks={[0, 50000, 100000, 150000, 200000]}
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
                            {managers.map((manager, index) => (
                                <TableRow key={index} className="hover:bg-slate-50 border-slate-100">
                                    <TableCell className="font-medium text-slate-700 pl-6 py-4">
                                        {manager.name}
                                    </TableCell>
                                    <TableCell className="text-slate-500 py-4">
                                        {manager.email}
                                    </TableCell>
                                    <TableCell className="text-slate-500 py-4">
                                        {manager.projects}
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}