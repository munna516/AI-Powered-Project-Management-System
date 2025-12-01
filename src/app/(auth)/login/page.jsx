import { FaGoogle } from "react-icons/fa";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500">
            Sign in to access your AI-powered project dashboard.
          </p>
        </div>

        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 transition cursor-pointer"
        >
          <FaGoogle className="w-4 h-4 text-blue-500" />

          <span>Continue with Google</span>
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400">or</span>
          </div>
        </div>

        <form className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary text-white py-2.5 text-sm font-medium hover:bg-primary/90 transition cursor-pointer"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}