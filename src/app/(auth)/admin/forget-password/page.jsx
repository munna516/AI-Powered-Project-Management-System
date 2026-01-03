"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminForgetPassword() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
                <div className="space-y-1 text-center">
                    <h1 className="text-[40px] font-semibold text-primary mb-4">
                        Project Pilot
                    </h1>
                    <p className="text-sm text-primary font-medium text-[30px] mb-5">
                        Admin Forget Password?
                    </p>
                    <p className="text-sm text-secondary mb-7">
                        Please enter your email to get verification code
                    </p>
                </div>

                <form className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-secondary">
                            Email address
                        </label>
                        <Input type="email" placeholder="you@example.com" className="" />
                    </div>
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full cursor-pointer mt-3"
                    >
                        Continue
                    </Button>
                </form>
            </div>
        </div>
    );
}
