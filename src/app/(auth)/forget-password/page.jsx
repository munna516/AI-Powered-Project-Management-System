"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiPost } from "@/lib/api";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await apiPost(
        "/api/auth/forgot-password",
        { email },
        { skipAuth: true }
      );

      const message = response?.message || "OTP sent successfully. Please check your email.";
      toast.success(message);
      router.push(`/forget-password/otp?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error(error?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
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
            Forget Password?
          </p>
          <p className="text-sm text-secondary mb-7">
            Please enter your email to receive a 6-digit verification code
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">
              Email address
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full cursor-pointer mt-3"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
