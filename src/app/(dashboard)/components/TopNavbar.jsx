import { FiBell } from "react-icons/fi";
import Image from "next/image";

export default function TopNavbar() {
    return (
        <header className="h-16 bg-white hidden md:flex items-center justify-end px-3 md:px-10 gap-6 ">
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
        </header>
    );
}
