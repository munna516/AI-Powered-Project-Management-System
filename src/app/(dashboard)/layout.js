import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen md:h-screen flex flex-col  md:flex-row bg-slate-100/50 text-slate-900 md:overflow-hidden">
            <Sidebar bgColor="bg-[#201B51]" />

            <div className="flex-1 flex flex-col min-h-0">
                <TopNavbar />
                <main className="flex-1 overflow-y-auto px-4 pt-5 pb-8 md:px-10 md:pt-10 md:pb-8">
                    <div className="w-full">{children}</div>
                </main>
            </div>
        </div>
    );
}
