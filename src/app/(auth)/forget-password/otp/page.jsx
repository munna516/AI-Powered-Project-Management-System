"use client";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function OTP() {
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const inputRefs = useRef([]);
  const router = useRouter();

  useEffect(() => {
    
    // Auto-focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) return;

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 5);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      for (let i = 0; i < 5; i++) {
        newOtp[i] = pastedData[i] || "";
      }
      setOtp(newOtp);
      // Focus the last filled input or the last input
      const lastIndex = Math.min(pastedData.length - 1, 4);
      inputRefs.current[lastIndex]?.focus();
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
            Check your Email
          </p>
          <p className="text-sm text-secondary mb-7 px-2 sm:px-0">
            We sent a code to your email address {email || "@"}. Please check your email for
            the 5 digit code.
          </p>
        </div>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            const otpValue = otp.join("");
            if (otpValue.length === 5) {
              // Navigate to reset password page
              router.push("/forget-password/reset");
            }
          }}
        >
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-center text-lg sm:text-xl md:text-2xl font-semibold rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              />
            ))}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full cursor-pointer mt-3"
            onClick={() => toast.success("OTP verified successfully")}
          >
            Verify
          </Button>

          <div className="text-center text-sm text-secondary">
            You have not received the email?{" "}
            <a href="#" className="text-primary hover:underline font-medium">
              Resend
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
