"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminSuccess() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
                <div className="space-y-1 text-center">
                    <h1 className="text-[40px] font-semibold text-primary mb-4">
                        Project Pilot
                    </h1>
                    <p className="text-sm text-primary font-medium text-[30px] mb-5">
                        Password Updated Successfully!
                    </p>
                    <p className="text-sm text-secondary mb-7 px-2 sm:px-0">
                        Your new password has been saved. You can now continue securely.
                    </p>
                </div>

                <div className="space-y-6">
                    <Link href="/admin/login" className="block">
                        <Button
                            type="button"
                            variant="primary"
                            size="lg"
                            className="w-full cursor-pointer"
                        >
                            Sign In
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
