import React from "react";

const termsSections = [
  {
    title: "1. Acceptance of Terms",
    description:
      "By installing or using this application, you agree to these Terms of Service. If you do not agree, please do not use the app.",
  },
  {
    title: "2. Description of Service",
    description:
      "This application integrates with Zoom to access meeting transcripts and related data in order to provide summaries, insights, or storage.",
  },
  {
    title: "3. User Consent & Responsibilities",
    items: [
      "You must obtain consent from all meeting participants before recording or processing transcripts.",
      "You must comply with applicable laws regarding privacy and recording.",
      "You agree not to misuse the service.",
    ],
  },
  {
    title: "4. Data Access & Permissions",
    description:
      "The app may access transcripts, recordings, and basic account information only as required to provide services.",
  },
  {
    title: "5. Prohibited Use",
    items: [
      "Unauthorized surveillance",
      "Violating others' privacy",
      "Reverse engineering the app",
    ],
  },
  {
    title: "6. Service Availability",
    description:
      "We do not guarantee uninterrupted service and may modify features at any time.",
  },
  {
    title: "7. Limitation of Liability",
    description:
      "We are not responsible for data loss or indirect damages resulting from use of the app.",
  },
  {
    title: "8. Termination",
    description:
      "We may suspend or terminate access if these terms are violated.",
  },
  {
    title: "9. Changes",
    description:
      "We may update these terms. Continued use means acceptance.",
  },
  {
    title: "10. Contact",
    description: "Email: pmify98@gmail.com",
  },
];

const highlights = [
  {
    label: "Transparency",
    value: "Clear usage expectations",
  },
  {
    label: "Consent",
    value: "Participant approval matters",
  },
  {
    label: "Security",
    value: "Responsible data access only",
  },
];

function Terms() {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(96,81,226,0.18),_transparent_35%),linear-gradient(180deg,#f7f8ff_0%,#eef5ff_48%,#ffffff_100%)] px-0 py-0 text-slate-700">
      <div className="w-full">
        <div className="overflow-hidden border border-white/70 bg-white/80 shadow-[0_20px_70px_rgba(31,41,55,0.12)] backdrop-blur sm:mx-4 sm:my-4 sm:rounded-[32px] lg:mx-6 lg:my-6 xl:mx-8">
          <div className="border-b border-slate-100 bg-gradient-to-r from-[#1f2a72] via-[#4f46e5] to-[#0ea5e9] px-5 py-10 text-white sm:px-8 lg:px-12 lg:py-14 xl:px-16">
            <div className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium">
              Legal and Compliance
            </div>
            <div className="grid gap-8 lg:grid-cols-[1.5fr_0.8fr] lg:items-end">
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-5xl xl:text-6xl">
                  Terms of Service
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/85 sm:text-base lg:text-lg">
                  These terms explain how Pmify works, what users can expect,
                  and the responsibilities that come with using the platform and
                  its Zoom-powered transcript features.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                    Effective Date
                  </p>
                  <p className="mt-2 text-lg font-semibold">01-04-2026</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                    Application
                  </p>
                  <p className="mt-2 text-lg font-semibold">Pmify</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16">
            <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-start">
              <aside className="space-y-6 xl:sticky xl:top-8">
                <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                  {highlights.map((item) => (
                    <div
                      key={item.label}
                      className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#6051E2]/30 hover:shadow-lg"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6051E2]">
                        {item.label}
                      </p>
                      <p className="mt-3 text-base font-semibold text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-sky-50 p-6 xl:bg-gradient-to-b">
                  <p className="text-sm leading-7 text-slate-600">
                    By continuing to use Pmify, you acknowledge these terms and
                    agree to use the platform lawfully, ethically, and with
                    proper consent from meeting participants whenever
                    transcripts or recordings are involved.
                  </p>
                </div>
              </aside>

              <div className="grid gap-5 md:gap-6">
                {termsSections.map((section) => (
                  <section
                    key={section.title}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-[#6051E2]/25 hover:shadow-md sm:p-6 lg:p-7"
                  >
                    <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                      {section.title}
                    </h2>

                    {section.description ? (
                      <p className="mt-4 leading-7 text-slate-600 sm:leading-8">
                        {section.description}
                      </p>
                    ) : null}

                    {section.items ? (
                      <ul className="mt-4 space-y-3">
                        {section.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-slate-600"
                          >
                            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#6051E2] to-[#0ea5e9]" />
                            <span className="leading-7">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Terms;