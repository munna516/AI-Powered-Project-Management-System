"use client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-6">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
            <div className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
                </div>
              </div>
              <h1 className="text-[40px] font-semibold text-primary mb-4">
                Project Pilot
              </h1>
              <p className="text-sm text-primary font-medium text-[30px] mb-5">
                Critical Error
              </p>
              <p className="text-sm text-secondary mb-7 px-2 sm:px-0">
                A critical error occurred. Please refresh the page or contact
                support if the problem persists.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={reset}
                variant="primary"
                size="lg"
                className="w-full cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

