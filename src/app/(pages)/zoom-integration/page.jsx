import Link from "next/link";
import React from "react";

const integrationHighlights = [
  {
    label: "Setup",
    value: "Connect Zoom in a few guided steps",
  },
  {
    label: "Automation",
    value: "Completed meetings sync automatically",
  },
  {
    label: "Security",
    value: "Only required permissions are used",
  },
];

const connectSteps = [
  "Go to your PMify dashboard",
  "Navigate to Integrations",
  "Click Connect Zoom",
  "Authorize access via Zoom",
];

const transcriptFlow = [
  "PMify listens for completed Zoom meetings",
  "When a meeting ends, Zoom processes the recording",
  "If transcription is enabled, PMify automatically retrieves the transcript",
  "The transcript is then stored in your dashboard",
];

const requiredSettings = [
  "Enable Cloud Recording",
  "Enable Audio Transcription",
];

const transcriptLocations = [
  "Inside your PMify dashboard",
  "Linked to each meeting",
  "Ready for viewing or further processing",
];

const permissionUses = [
  "Detect completed meetings",
  "Retrieve transcripts",
  "Display them in your dashboard",
];

function ZoomIntegrationPage() {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_28%),radial-gradient(circle_at_right,_rgba(14,165,233,0.14),_transparent_30%),linear-gradient(180deg,#f7fbff_0%,#eef5ff_55%,#ffffff_100%)] px-0 py-0 text-slate-700">
      <div className="w-full">
        <div className="overflow-hidden border border-white/70 bg-white/80 shadow-[0_20px_70px_rgba(31,41,55,0.12)] backdrop-blur sm:mx-4 sm:my-4 sm:rounded-[32px] lg:mx-6 lg:my-6 xl:mx-8">
          <div className="border-b border-slate-100 bg-gradient-to-r from-[#0f172a] via-[#1d4ed8] to-[#0891b2] px-5 py-10 text-white sm:px-8 lg:px-12 lg:py-14 xl:px-16">
            <div className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium">
              Zoom Setup Guide
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.45fr_0.85fr] lg:items-end">
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-5xl xl:text-6xl">
                  Zoom Integration Guide
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/85 sm:text-base lg:text-lg">
                  This guide will help you connect your Zoom account with PMify
                  and automatically collect meeting transcripts in a secure and
                  reliable way.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                    Integration
                  </p>
                  <p className="mt-2 text-lg font-semibold">Zoom + PMify</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                    Result
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    Automatic transcript collection
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16">
            <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-start">
              <aside className="space-y-6 xl:sticky xl:top-8">
                <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                  {integrationHighlights.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
                        {item.label}
                      </p>
                      <p className="mt-3 text-base font-semibold text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl border border-cyan-100 bg-gradient-to-r from-sky-50 via-white to-cyan-50 p-6 xl:bg-gradient-to-b">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Quick tip
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    If transcripts are missing, first confirm that Zoom Cloud
                    Recording and Audio Transcription are enabled before checking
                    PMify.
                  </p>
                </div>
              </aside>

              <div className="grid gap-5 md:gap-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Connecting Your Zoom Account
                  </h2>
                  <div className="mt-5 grid gap-4">
                    {connectSteps.map((step, index) => (
                      <div
                        key={step}
                        className="flex items-start gap-4 rounded-2xl bg-slate-50 p-5"
                      >
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#2563eb] to-[#06b6d4] text-sm font-bold text-white">
                          {index + 1}
                        </div>
                        <p className="pt-1 leading-7 text-slate-600">{step}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 leading-7 text-slate-600 sm:leading-8">
                    Once connected, PMify will start accessing your meeting data
                    securely.
                  </p>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    How Transcript Collection Works
                  </h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {transcriptFlow.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 transition-all duration-300 hover:border-[#2563eb]/30 hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#2563eb] to-[#06b6d4]" />
                          <p className="leading-7 text-slate-600">{item}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Required Zoom Settings
                  </h2>
                  <p className="mt-4 leading-7 text-slate-600 sm:leading-8">
                    To ensure transcripts work properly:
                  </p>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {requiredSettings.map((setting) => (
                      <div
                        key={setting}
                        className="rounded-2xl bg-slate-50 p-5"
                      >
                        <p className="text-lg font-semibold text-slate-900">
                          {setting}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-5">
                    <p className="text-sm leading-7 text-slate-700">
                      You can find these settings in your Zoom account under:
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-900">
                      Settings → Recording → Cloud Recording
                    </p>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Where to Find Transcripts
                  </h2>
                  <ul className="mt-5 space-y-3">
                    {transcriptLocations.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-slate-600"
                      >
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#2563eb] to-[#06b6d4]" />
                        <span className="leading-7">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Disconnecting Zoom
                  </h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-lg font-semibold text-slate-900">
                        1. Go to Integrations
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-lg font-semibold text-slate-900">
                        2. Click Disconnect Zoom
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 leading-7 text-slate-600 sm:leading-8">
                    This will stop any further data syncing.
                  </p>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Data Usage & Permissions
                  </h2>
                  <p className="mt-4 leading-7 text-slate-600 sm:leading-8">
                    PMify only accesses the data required to:
                  </p>
                  <ul className="mt-5 space-y-3">
                    {permissionUses.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-slate-600"
                      >
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#2563eb] to-[#06b6d4]" />
                        <span className="leading-7">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 leading-7 text-slate-600 sm:leading-8">
                    We do not access or store unnecessary personal data.
                  </p>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-[#1d4ed8] to-[#0891b2] p-6 text-white shadow-sm sm:p-7">
                  <h2 className="text-2xl font-semibold">Need Help?</h2>
                  <p className="mt-3 max-w-2xl leading-7 text-white/85">
                    If you need assistance with setup or troubleshooting, visit
                    the support page or contact our team directly.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href="/support"
                      className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      Visit Support
                    </Link>
                    <a
                      href="mailto:pmify98@gmail.com"
                      className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      pmify98@gmail.com
                    </a>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ZoomIntegrationPage;
