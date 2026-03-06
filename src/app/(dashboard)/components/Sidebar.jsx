"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdDashboard, MdEmail, MdBlock, MdOutlineLogout, MdDragIndicator } from "react-icons/md";
import { FaRegFolderOpen, FaDatabase, FaUsers, FaCalendarAlt } from "react-icons/fa";
import { FiBook, FiBell } from "react-icons/fi";
import { HiOutlineShoppingBag, HiOutlineMenu } from "react-icons/hi";
import { IoChatboxEllipsesOutline, IoCheckboxOutline } from "react-icons/io5";
import { IoIosSettings } from "react-icons/io";
import { BsDatabaseFillGear } from "react-icons/bs";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { logoutAndRedirect, apiGet } from "@/lib/api";
import toast from "react-hot-toast";

// Constants
const SIDEBAR_BG = "bg-[#201B51]";
const ACTIVE_BG = "bg-[#6051E2]";
const SIDEBAR_ORDER_KEY = "sidebar-nav-order";
const PROFILE_QUERY_KEY = ["userProfile"];
const PROFILE_GET_ENDPOINT = "/api/user/profile/me";

const defaultSidebarItems = [
  { name: "Dashboard", icon: <MdDashboard />, href: "/dashboard" },
  { name: "Projects", icon: <FaRegFolderOpen />, href: "/projects" },
  { name: "Employee Management", icon: <FaUsers />, href: "/employee-management" },
  { name: "RAIDD", icon: <MdBlock />, href: "/raidd" },
  { name: "AI Detection", icon: <IoCheckboxOutline />, href: "/ai-detection" },
  { name: "Lesson Learned", icon: <FiBook />, href: "/lessons" },
  { name: "Vendors", icon: <HiOutlineShoppingBag />, href: "/vendors" },
  { name: "Email Management", icon: <MdEmail />, href: "/email-management" },
  { name: "Data Source", icon: <FaDatabase />, href: "/data-source" },
  { name: "Meeting Management", icon: <BsDatabaseFillGear />, href: "/meeting-management" },
  { name: "Calendar & Meetings", icon: <FaCalendarAlt />, href: "/calendar-meetings" },
  { name: "Project Chatbot", icon: <IoChatboxEllipsesOutline />, href: "/project-chatbot" },
];

function getStoredOrder() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(SIDEBAR_ORDER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveOrder(hrefs) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SIDEBAR_ORDER_KEY, JSON.stringify(hrefs));
  } catch {}
}

// Sortable nav item with drag handle - uses div + router.push to avoid Link click-after-drag reload
const SortableNavItem = ({ item, isActive, isMobile, preventClickRef }) => {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.href });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const baseClasses = "relative w-full flex items-center gap-2 rounded-md px-3 py-2 font-medium transition-all duration-300 text-white cursor-pointer";
  const activeClasses = isActive ? ACTIVE_BG : "hover:bg-white/10";
  const iconSize = isMobile ? "text-md" : "text-md md:text-lg lg:text-xl";
  const labelSize = isMobile ? "text-md" : "text-sm md:text-base lg:text-lg";

  const content = (
    <>
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center w-6 h-6 shrink-0 rounded cursor-grab active:cursor-grabbing text-white/70 hover:text-white hover:bg-white/10 touch-none"
        aria-label="Drag to reorder"
      >
        <MdDragIndicator className="w-5 h-5" />
      </div>
      <span className={`w-5 h-5 text-white ${iconSize}`}>{item.icon}</span>
      <span className={`text-white ${labelSize} flex-1 text-left`}>{item.name}</span>
    </>
  );

  const buttonClasses = `${baseClasses} ${activeClasses} ${isDragging ? "opacity-50" : ""}`;

  const handleClick = (e) => {
    if (preventClickRef?.current) return;
    e.preventDefault();
    router.push(item.href);
  };

  const InnerButton = () => (
    <button type="button" className={buttonClasses} onClick={handleClick}>
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md bg-white" />
      )}
      {content}
    </button>
  );

  return (
    <div ref={setNodeRef} style={style} className="w-full">
      {isMobile ? (
        <SheetClose asChild>
          <InnerButton />
        </SheetClose>
      ) : (
        <InnerButton />
      )}
    </div>
  );
};

// Footer button component
const FooterButton = ({ isActive, icon, label, href, isLogout = false, onLogout }) => {
  const baseClasses = "relative w-full text-left rounded-md px-3 py-2 flex items-center gap-2 text-md md:text-lg lg:text-xl cursor-pointer font-bold transition-all duration-300";

  if (isLogout) {
    return (
      <button
        onClick={onLogout}
        className={`${baseClasses} text-red-500 hover:bg-red-500/10`}
      >
        <span className="w-5 h-5 text-red-500">{icon}</span>
        {label}
      </button>
    );
  }

  return (
    <Link href={href}>
      <button className={`${baseClasses} text-white ${isActive ? ACTIVE_BG : "hover:bg-white/10"}`}>
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md bg-white" />
        )}
        <span className="w-5 h-5 text-white">{icon}</span>
        {label}
      </button>
    </Link>
  );
};

export default function Sidebar() {
  const pathname = usePathname();
  const [orderedItems, setOrderedItems] = useState(defaultSidebarItems);
  const justDidDragRef = useRef(false);

  const { data: profileData } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => apiGet(PROFILE_GET_ENDPOINT),
  });
  const profile = profileData?.data;
  const userName = profile ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() : "Admin";
  const avatarUrl = profile?.avatarUrl;
  const avatarInitial = (profile?.firstName || "?").charAt(0).toUpperCase();

  const handleLogout = () => {
    toast.success("Logging out...");
    logoutAndRedirect("/login", 2000);
  };

  useEffect(() => {
    const stored = getStoredOrder();
    if (stored && Array.isArray(stored)) {
      const hrefToItem = Object.fromEntries(defaultSidebarItems.map((i) => [i.href, i]));
      const ordered = stored
        .map((href) => hrefToItem[href])
        .filter(Boolean);
      const newHrefs = defaultSidebarItems.map((i) => i.href);
      const added = newHrefs.filter((h) => !stored.includes(h));
      if (ordered.length > 0) {
        setOrderedItems([...ordered, ...added.map((h) => hrefToItem[h]).filter(Boolean)]);
      }
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    justDidDragRef.current = true;
    const preventClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener("click", preventClick, { capture: true });
    setTimeout(() => {
      justDidDragRef.current = false;
      document.removeEventListener("click", preventClick, { capture: true });
    }, 350);

    if (!over || active.id === over.id) return;

    setOrderedItems((items) => {
      const ids = items.map((i) => i.href);
      const oldIndex = ids.indexOf(active.id);
      const newIndex = ids.indexOf(over.id);
      if (oldIndex === -1 || newIndex === -1) return items;
      const next = arrayMove(items, oldIndex, newIndex);
      saveOrder(next.map((i) => i.href));
      return next;
    });
  };

  const renderNav = (isMobile = false) => (
    <nav className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedItems.map((i) => i.href)}
          strategy={verticalListSortingStrategy}
        >
          {orderedItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <SortableNavItem
                key={item.href}
                item={item}
                isActive={isActive}
                isMobile={isMobile}
                preventClickRef={justDidDragRef}
              />
            );
          })}
        </SortableContext>
      </DndContext>
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
        isLogout
        onLogout={handleLogout}
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
          <div className="relative h-9 w-9 rounded-full overflow-hidden flex-shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={userName}
                fill
                sizes="36px"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary text-white text-sm font-semibold">
                {avatarInitial}
              </div>
            )}
          </div>
          
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
