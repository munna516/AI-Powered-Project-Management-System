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
import { FaRegFolderOpen, FaDatabase, FaUsers, FaCalendarAlt } from "react-icons/fa";
import { FiBook, FiBell } from "react-icons/fi";
import { HiOutlineShoppingBag, HiOutlineMenu } from "react-icons/hi";
import { IoChatboxEllipsesOutline, IoCheckboxOutline } from "react-icons/io5";
import { IoIosSettings } from "react-icons/io";
import { BsDatabaseFillGear } from "react-icons/bs";
import { HiMiniBellAlert } from "react-icons/hi2";
import Image from "next/image";

// Constants
const SIDEBAR_BG = "bg-[#201B51]";
const ACTIVE_BG = "bg-[#6051E2]";
const USER_AVATAR = "https://cdn.pixabay.com/photo/2024/09/23/10/39/man-9068618_640.jpg";
const USER_NAME = "Robert Smith";

const sidebarItems = [
  { name: "Dashboard", icon: <MdDashboard />, href: "/dashboard" },
  { name: "Projects", icon: <FaRegFolderOpen />, href: "/projects" },
  { name: "Employee Management", icon: <FaUsers />, href: "/employee-management" },
  { name: "RAIDD", icon: <MdBlock />, href: "/raidd" },
  { name: "AI Detection", icon: <IoCheckboxOutline />, href: "/ai-detection" },
  { name: "Lesson Learned", icon: <FiBook />, href: "/lessons" },
  { name: "Vendors", icon: <HiOutlineShoppingBag />, href: "/vendors" },
  { name: "Email Management", icon: <MdEmail />, href: "/email-management" },
  { name: "Data Source", icon: <FaDatabase />, href: "/data-source" },
  { name: "Data Management", icon: <BsDatabaseFillGear />, href: "/data-management" },
  { name: "Calendar & Meetings", icon: <FaCalendarAlt />, href: "/calendar-meetings" },
  { name: "AI Reminder", icon: <HiMiniBellAlert />, href: "/ai-reminder" },
  { name: "Project Chatbot", icon: <IoChatboxEllipsesOutline />, href: "/project-chatbot" },
];

// Reusable NavButton component
const NavButton = ({
  isActive,
  icon,
  label,
  isMobile = false,
  className = "",
  iconClassName = "",
  labelClassName = ""
}) => {
  const baseClasses = "relative w-full flex items-center gap-4 rounded-md px-3 py-2 font-medium cursor-pointer transition-all duration-300 text-white";
  const activeClasses = isActive ? ACTIVE_BG : "hover:bg-white/10";
  const iconSize = isMobile ? "text-md" : "text-md md:text-lg lg:text-xl";
  const labelSize = isMobile ? "text-md" : "text-sm md:text-base lg:text-lg";

  return (
    <button className={`${baseClasses} ${activeClasses} ${className}`}>
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md" />
      )}
      <span className={`w-5 h-5 text-white ${iconSize} ${iconClassName}`}>
        {icon}
      </span>
      <span className={`text-white ${labelSize} ${labelClassName}`}>
        {label}
      </span>
    </button>
  );
};

// Footer button component
const FooterButton = ({ isActive, icon, label, href, isLogout = false }) => {
  const baseClasses = "relative w-full text-left rounded-md px-3 py-2 flex items-center gap-2 text-md md:text-lg lg:text-xl cursor-pointer font-bold transition-all duration-300";

  if (isLogout) {
    return (
      <Link href={href}>
        <button className={`${baseClasses} text-red-500 hover:bg-red-500/10`}>
          <span className="w-5 h-5 text-red-500">{icon}</span>
          {label}
        </button>
      </Link>
    );
  }

  return (
    <Link href={href}>
      <button className={`${baseClasses} text-white ${isActive ? ACTIVE_BG : "hover:bg-white/10"}`}>
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md" />
        )}
        <span className="w-5 h-5 text-white">{icon}</span>
        {label}
      </button>
    </Link>
  );
};

export default function Sidebar() {
  const pathname = usePathname();

  const renderNav = (isMobile = false) => (
    <nav className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1">
      {sidebarItems.map((item) => {
        const isActive = pathname.includes(item.href);
        return (
          <Link href={item.href} key={item.name}>
            {isMobile ? (
              <SheetClose asChild>
                <NavButton
                  isActive={isActive}
                  icon={item.icon}
                  label={item.name}
                  isMobile={isMobile}
                />
              </SheetClose>
            ) : (
              <NavButton
                isActive={isActive}
                icon={item.icon}
                label={item.name}
                isMobile={isMobile}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className={`p-4 space-y-2 text-sm ${SIDEBAR_BG}`}>
      <FooterButton
        isActive={pathname === "/settings"}
        icon={<IoIosSettings />}
        label="Settings"
        href="/settings"
      />
      <FooterButton
        icon={<MdOutlineLogout />}
        label="Log Out"
        href="/"
        isLogout
      />
    </div>
  );

  const MobileHeader = () => (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
      <div className="flex items-center gap-2">
        <SheetTrigger className="p-1.5 rounded-md bg-[#6051E2] text-white">
          <HiOutlineMenu className="h-3 w-3" />
        </SheetTrigger>
        <p className="text-2xl md:text-3xl font-bold text-primary">
          Project Pilot
        </p>
      </div>
      <div className="h-16 bg-white flex items-center justify-end px-3 md:px-10 gap-6">
        <button className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-primary hover:bg-slate-200 transition">
          <FiBell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 rounded-full overflow-hidden">
            <Image
              src={USER_AVATAR}
              alt={USER_NAME}
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>
          <p className="text-sm font-medium text-slate-800">{USER_NAME}</p>
        </div>
      </div>
    </div>
  );

  const SidebarTitle = ({ className = "" }) => (
    <p className={`font-bold text-white ${className}`}>
      Project Pilot
    </p>
  );

  return (
    <>
      {/* Mobile: shadcn sheet */}
      <div className="w-full md:hidden">
        <Sheet>
          <MobileHeader />
          <SheetContent side="left" className={`p-0 w-72 ${SIDEBAR_BG}`}>
            <SheetHeader className="px-4 pt-4 pb-2">
              <SheetTitle className="text-xl font-semibold text-white text-center">
                Project Pilot
              </SheetTitle>
            </SheetHeader>
            <aside className={`h-[calc(100%-56px)] ${SIDEBAR_BG} text-white flex flex-col`}>
              {renderNav(true)}
              {footer}
            </aside>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex w-80 ${SIDEBAR_BG} text-white flex-col h-full flex-shrink-0`}>
        <div className="py-5 flex items-center px-6">
          <SidebarTitle className="text-lg md:text-xl lg:text-2xl flex items-center justify-center text-center" />
        </div>
        {renderNav(false)}
        {footer}
      </aside>
    </>
  );
}
