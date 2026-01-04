"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminResetPassword() {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newPassword && confirmPassword) {
            if (newPassword === confirmPassword) {
            // Navigate to success page
                toast.success("Password updated successfully");
                router.push("/admin/forget-password/success");
            }
            else {
                toast.error("New password and confirm password do not match");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
                <div className="space-y-1 text-center">
                    <h1 className="text-[40px] font-semibold text-primary mb-4">
                        Project Pilot
                    </h1>
                    <p className="text-sm text-primary font-medium text-[30px] mb-5">
                        Admin Set a new password
                    </p>
                    <p className="text-sm text-secondary mb-7 px-2 sm:px-0">
                        Create a new password. Ensure it differs from previous ones for
                        security.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="relative space-y-2">
                        <label className="block text-sm font-medium text-secondary">
                            New Password
                        </label>
                        <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter your new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-11 -translate-y-1/2 bg-none cursor-pointer text-primary font-semibold"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                            {showNewPassword ? (
                                <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                                <EyeOffIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                        </button>
                    </div>

                    <div className="relative space-y-2">
                        <label className="block text-sm font-medium text-secondary">
                            Confirm Password
                        </label>
                        <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-11 -translate-y-1/2 bg-none cursor-pointer text-primary font-semibold"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? (
                                <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                                <EyeOffIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                        </button>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full cursor-pointer mt-3"
                    >
                        Reset Password
                    </Button>
                </form>
            </div>
        </div>
    );
}
