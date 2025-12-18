"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FiSearch } from "react-icons/fi";

export default function PageHeader({
    title,
    description,
    searchPlaceholder = "Search...",
    searchValue,
    onSearchChange,
    buttonLabel,
    onButtonClick,
    buttonIcon,
}) {
    return (
        <div className="space-y-4">
            {/* Title and Button Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">{title}</h1>
                    {description && (
                        <p className="text-sm text-slate-500 mt-3">{description}</p>
                    )}
                </div>
                {buttonLabel && (
                    <Button
                        onClick={onButtonClick}
                        variant="primary"
                        size="lg"
                        className="flex items-center gap-2"
                    >
                        {buttonIcon && <span>{buttonIcon}</span>}
                        {buttonLabel}
                    </Button>
                )}
            </div>

            {/* Search Bar */}
            <div className="relative mt-6">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                <Input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={onSearchChange}
                    className="pl-10 py-7 bg-white border-blue-400 !text-md md:!text-lg placeholder:!text-md md:placeholder:!text-lg"
                />
            </div>
        </div>
    );
}

