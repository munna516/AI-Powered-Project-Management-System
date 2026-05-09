import React from "react";

const privacySections = [
  {
    title: "1. Information We Collect",
    groups: [
      {
        subtitle: "a. From Zoom",
        items: [
          "Meeting transcripts",
          "Meeting metadata (time, duration, participants)",
          "Basic user profile information",
        ],
      },
      {
        subtitle: "b. Automatically Collected",
        items: [
          "Usage data",
          "Log files",
          "Device and browser information",
        ],
      },
    ],
  },
  {
    title: "2. How We Use Data",
    items: [
      "Provide transcript services",
      "Generate summaries and insights",
      "Improve performance and security",
    ],
  },
  {
    title: "3. Data Sharing",
    paragraphs: [
      "We do not sell your data.",
      "We may share data with service providers or authorities if required by law.",
    ],
  },
  {
    title: "4. Data Security",
    paragraphs: [
      "We use industry-standard security measures to protect your data.",
    ],
  },
  {
    title: "5. Data Retention",
    paragraphs: [
      "Data is retained only as necessary and can be deleted upon request.",
    ],
  },
  {
    title: "6. User Rights",
    items: [
      "Access your data",
      "Request deletion",
      "Revoke permissions",
    ],
  },
  {
    title: "7. Third-Party Services",
    paragraphs: [
      "This app uses Zoom APIs. Zoom's policies also apply.",
    ],
  },
  {
    title: "8. Children's Privacy",
    paragraphs: [
      "This app is not intended for children under 13.",
    ],
  },
  {
    title: "9. Changes",
    paragraphs: [
      "We may update this policy periodically.",
    ],
  },
  {
    title: "10. Contact",
    paragraphs: ["Email: pmify98@gmail.com"],
  },
];

const privacyHighlights = [
  {
    label: "Collected Data",
    value: "Only what is needed to provide the service",
  },
  {
    label: "No Selling",
    value: "Your data is not sold to third parties",
  },
  {
    label: "Your Rights",
    value: "Access, delete, and revoke permissions",
  },
];

function PrivacyPolicy() {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_30%),linear-gradient(180deg,#f5fbff_0%,#eef2ff_52%,#ffffff_100%)] px-0 py-0 text-slate-700">
      <div className="w-full">
        <div className="overflow-hidden border border-white/70 bg-white/80 shadow-[0_20px_70px_rgba(31,41,55,0.12)] backdrop-blur sm:mx-4 sm:my-4 sm:rounded-[32px] lg:mx-6 lg:my-6 xl:mx-8">
          <div className="border-b border-slate-100 bg-gradient-to-r from-[#0f172a] via-[#0f4c81] to-[#06b6d4] px-5 py-10 text-white sm:px-8 lg:px-12 lg:py-14 xl:px-16">
            <div className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium">
              Privacy and Data Protection
            </div>
            <div className="grid gap-8 lg:grid-cols-[1.5fr_0.8fr] lg:items-end">
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-5xl xl:text-6xl">
                  Privacy Policy
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/85 sm:text-base lg:text-lg">
                  This policy explains what information Pmify collects, how it
                  is used, and the safeguards in place to protect your privacy
                  while delivering transcript and insight features.
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
                  {privacyHighlights.map((item) => (
                    <div
                      key={item.label}
                      className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg"
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

                <div className="rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-indigo-50 p-6 xl:bg-gradient-to-b">
                  <p className="text-sm leading-7 text-slate-600">
                    We aim to keep data practices transparent, limited to
                    necessary use cases, and aligned with secure handling
                    standards so users understand how information moves through
                    the platform.
                  </p>
                </div>
              </aside>

              <div className="grid gap-5 md:gap-6">
                {privacySections.map((section) => (
                  <section
                    key={section.title}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-sky-300/60 hover:shadow-md sm:p-6 lg:p-7"
                  >
                    <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                      {section.title}
                    </h2>

                    {section.groups ? (
                      <div className="mt-5 grid gap-4 lg:grid-cols-2">
                        {section.groups.map((group) => (
                          <div
                            key={group.subtitle}
                            className="rounded-2xl bg-slate-50 p-5"
                          >
                            <h3 className="text-lg font-semibold text-slate-900">
                              {group.subtitle}
                            </h3>
                            <ul className="mt-4 space-y-3">
                              {group.items.map((item) => (
                                <li
                                  key={item}
                                  className="flex items-start gap-3 text-slate-600"
                                >
                                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" />
                                  <span className="leading-7">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {section.items ? (
                      <ul className="mt-4 space-y-3">
                        {section.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-slate-600"
                          >
                            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" />
                            <span className="leading-7">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {section.paragraphs ? (
                      <div className="mt-4 space-y-3">
                        {section.paragraphs.map((paragraph) => (
                          <p key={paragraph} className="leading-7 text-slate-600 sm:leading-8">
                            {paragraph}
                          </p>
                        ))}
                      </div>
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

export default PrivacyPolicy;