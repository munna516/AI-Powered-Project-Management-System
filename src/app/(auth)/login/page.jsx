"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { EyeIcon, EyeOffIcon, Lock } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-[40px] font-semibold text-primary mb-4">
            Project Pilot
          </h1>
          <p className="text-sm text-primary font-medium text-[30px] mb-5">
            Login to your Account
          </p>
          <p className="text-sm text-secondary   mb-7">
            Please enter your email and password to continue
          </p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">
              Email
            </label>
            <Input type="email" placeholder="you@example.com" className="" />
          </div>
          <div className="relative space-y-2">
            <label className="block text-sm font-medium text-secondary">
              Password
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="*******"
            />
            <p
              className="absolute right-3 top-11 -translate-y-1/2 bg-none cursor-pointer text-primary font-semibold"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeIcon className="w-4 h-4" />
              ) : (
                <EyeOffIcon className="w-4 h-4" />
              )}
            </p>
          </div>
          <div className="flex items-center justify-between ">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberPassword}
                onChange={(e) => setRememberPassword(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-sm text-secondary">Remember Password</span>
            </label>
            <a
              href="#"
              className="text-sm text-slate-500 hover:underline hover:text-primary font-medium"
            >
              Forget Password?
            </a>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full cursor-pointer mt-3"
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
