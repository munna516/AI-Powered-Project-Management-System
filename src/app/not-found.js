"use client";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
        <div className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-50 flex items-center justify-center">
              <FileQuestion className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-[40px] font-semibold text-primary mb-4">
            Project Pilot
          </h1>
          <p className="text-[60px] sm:text-[80px] md:text-[100px] font-bold text-primary mb-2">
            404
          </p>
          <p className="text-sm text-primary font-medium text-[30px] mb-5">
            Page Not Found
          </p>
          <p className="text-sm text-secondary mb-7 px-2 sm:px-0">
            The page you are looking for doesn't exist or has been moved. Please
            check the URL or return to the home page.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/" className="block">
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full cursor-pointer flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="lg"
            className="w-full cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}

