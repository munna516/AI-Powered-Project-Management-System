"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MdDashboard, MdEmail, MdBlock, MdOutlineLogout } from "react-icons/md";
import { FaRegFolderOpen, FaRegCheckSquare, FaRegChartBar, FaDatabase } from "react-icons/fa";
import { FiBook } from "react-icons/fi";
import { HiOutlineShoppingBag, HiOutlineMenu } from "react-icons/hi";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { IoIosSettings } from "react-icons/io";
import { FiBell } from "react-icons/fi";
import Image from "next/image";
const sidebarItems = [
  {
    name: "Dashboard",
    icon: <MdDashboard />,
    href: "/dashboard",
  },
  {
    name: "Projects",
    icon: <FaRegFolderOpen />,
    href: "/projects",
  },
  {
    name: "Risks & Issues",
    icon: <MdBlock />,
    href: "/risks-issues",
  }, {
    name: "Approval",
    icon: <FaRegCheckSquare />,
    href: "/approval",
  }, {
    name: "Sentiment Analysis",
    icon: <FaRegChartBar />,
    href: "/sentiment-analysis",
  },
  {
    name: "Lesson Learned",
    icon: <FiBook />,
    href: "/lessons",
  },
  {
    name: "Vendors",
    icon: <HiOutlineShoppingBag />,
    href: "/vendors",
  },
  {
    name: "SLA Scorecard",
    icon: <HiOutlineShoppingBag />,
    href: "/sla-scorecard",
  },
  {
    name: "Email Management",
    icon: <MdEmail />,
    href: "/email-management",
  },
  {
    name: "Data Source",
    icon: <FaDatabase />,
    href: "/data-source",
  },
  {
    name: "Project Chatbot",
    icon: <IoChatboxEllipsesOutline />,
    href: "/project-chatbot",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const renderNav = (isMobile = false) => (
    <nav className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1 ">
      {sidebarItems.map((item) => {
        const isActive = pathname === item.href;

        const iconSizeClasses = isMobile
          ? "text-md"
          : "text-md md:text-lg lg:text-xl";

        const labelSizeClasses = isMobile
          ? "text-md"
          : "text-md md:text-lg lg:text-xl";

        const textSizeClasses = isMobile
          ? "text-md"
          : "text-md md:text-lg lg:text-xl";

        const button = (
          <button
            className={`w-full flex items-center gap-4 rounded-md px-3 py-2 font-medium cursor-pointer transition-all duration-300 ${textSizeClasses} ${isActive
              ? "bg-primary text-white"
              : "bg-white/10 hover:bg-primary/10 text-slate-800"
              }`}
          >
            <span className={`w-5 h-5 font-bold ${iconSizeClasses}`}>{item.icon}</span>
            <span className={`font-bold ${labelSizeClasses}`}>{item.name}</span>
          </button>
        );

        return (
          <Link href={item.href} key={item.name}>
            {isMobile ? <SheetClose asChild>{button}</SheetClose> : button}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 p-4 space-y-2 text-sm">
      <button className="w-full text-left rounded-md px-3 py-2 hover:bg-white/5 flex items-center gap-2 text-md md:text-lg lg:text-xl cursor-pointer font-bold">
        <IoIosSettings className="w-5 h-5" />
        Settings
      </button>
      <button className="w-full text-left rounded-md px-3 py-2 hover:bg-white/5 flex items-center gap-2 text-md md:text-lg lg:text-xl  cursor-pointer font-bold text-red-500">
        <MdOutlineLogout className="w-5 h-5 " />
        Log Out
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile: shadcn sheet */}
      <div className="w-full md:hidden">
        <Sheet>
          <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
            <div className="flex items-center gap-2">
              <SheetTrigger className="p-2 rounded-md border bg-white text-slate-700">
                <HiOutlineMenu className="h-5 w-5" />
              </SheetTrigger>
              <p className="text-md md:text-lg lg:text-xl font-bold text-primary">Name And Logo</p>
            </div>
            <div className="h-16 bg-white flex items-center justify-end px-3 md:px-10 gap-6 ">
              {/* Notification icon */}
              <button className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-primary hover:bg-slate-200 transition">
                <FiBell className="h-5 w-5" />
              </button>

              {/* Avatar + name */}
              <div className="flex items-center gap-3 ">
                <div className="relative h-9 w-9 rounded-full overflow-hidden">
                  <Image
                    src="https://cdn.pixabay.com/photo/2024/09/23/10/39/man-9068618_640.jpg"
                    alt="Robert Smith"
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
                <p className="text-sm font-medium text-slate-800">Robert Smith</p>
              </div>
            </div>
          </div>
          <SheetContent side="left" className="p-0 w-72">
            <SheetHeader className="px-4 pt-4 pb-2 border-b border-white/10">
              <SheetTitle className="text-base font-semibold text-primary">
                Name And Logo
              </SheetTitle>
            </SheetHeader>
            <aside className="h-[calc(100%-56px)]  bg-white text-black flex flex-col">
              {renderNav(true)}
              {footer}
            </aside>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-80 bg-white text-black flex-col h-full flex-shrink-0 border-r border-white/10">
        <div className="py-5 flex items-center px-6 border-b border-white/10">
          <p className="text-md md:text-lg lg:text-xl font-bold text-primary flex items-center justify-center text-center">
            Name And Logo
          </p>
        </div>
        {renderNav(false)}
        {footer}
      </aside>
    </>
  );
}
