import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";

export default function DashboardLayout({ children }) {
    return (
        <div className="h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900 overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <TopNavbar />
                <main className="flex-1 overflow-y-auto px-4 pt-20 pb-6 md:px-10 md:pt-10 md:pb-8">
                    <div className="w-full max-w-5xl">{children}</div>
                </main>
            </div>
        </div>
    );
}
