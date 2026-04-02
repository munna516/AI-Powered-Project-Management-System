import Link from "next/link";
import React from "react";

const supportHighlights = [
  {
    label: "Support Email",
    value: "pmify98@gmail.com",
  },
  {
    label: "Response Time",
    value: "Within 24 hours",
  },
  {
    label: "Coverage",
    value: "Zoom, transcripts, account help",
  },
];

const supportTopics = [
  "Connecting your Zoom account",
  "Troubleshooting missing transcripts",
  "Managing your integration settings",
  "Account and data-related questions",
];

const faqItems = [
  {
    question: "1. Why is my meeting transcript not available?",
    points: [
      "Cloud recording is enabled in your Zoom account",
      "Audio transcription is turned on",
      "The meeting has finished processing",
    ],
  },
  {
    question: "2. How long does it take to receive transcripts?",
    answer:
      "Transcripts are usually available within a few minutes after Zoom finishes processing the recording.",
  },
  {
    question: "3. How can I disconnect my Zoom account?",
    answer:
      "You can disconnect your Zoom account anytime from your PMify dashboard under Integrations.",
  },
];

function SupportPage() {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.15),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(96,81,226,0.14),_transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_50%,#ffffff_100%)] px-0 py-0 text-slate-700">
      <div className="w-full">
        <div className="overflow-hidden border border-white/70 bg-white/80 shadow-[0_20px_70px_rgba(31,41,55,0.12)] backdrop-blur sm:mx-4 sm:my-4 sm:rounded-[32px] lg:mx-6 lg:my-6 xl:mx-8">
          <div className="border-b border-slate-100 bg-gradient-to-r from-[#0f172a] via-[#1d4ed8] to-[#06b6d4] px-5 py-10 text-white sm:px-8 lg:px-12 lg:py-14 xl:px-16">
            <div className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium">
              Customer Support
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.45fr_0.85fr] lg:items-end">
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-5xl xl:text-6xl">
                  Support
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/85 sm:text-base lg:text-lg">
                  Welcome to PMify Support. We&apos;re here to help with Zoom
                  integration, transcript services, account questions, and any
                  issues that affect your workflow.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                    Primary Contact
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    support@pmify.cloud
                  </p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                    Typical Response
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    Usually within 24 hours
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16">
            <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-start">
              <aside className="space-y-6 xl:sticky xl:top-8">
                <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                  {supportHighlights.map((item) => (
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

                <div className="rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-indigo-50 p-6 xl:bg-gradient-to-b">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Need quick help?
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    If you&apos;re having trouble with transcripts or Zoom sync,
                    the fastest path is to email support with your meeting
                    details and a short description of the issue.
                  </p>
                </div>
              </aside>

              <div className="grid gap-5 md:gap-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Contact Us
                  </h2>
                  <p className="mt-4 leading-7 text-slate-600 sm:leading-8">
                    If you need assistance, please reach out to us and our team
                    will respond as quickly as possible.
                  </p>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-sm font-medium text-slate-500">
                        Email
                      </p>
                      <a
                        href="mailto:support@pmify.cloud"
                        className="mt-2 inline-block text-lg font-semibold text-[#2563eb] hover:underline"
                      >
                        support@pmify.cloud
                      </a>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-sm font-medium text-slate-500">
                        Response Time
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        Within 24 hours, usually faster
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    What We Can Help With
                  </h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {supportTopics.map((topic) => (
                      <div
                        key={topic}
                        className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 transition-all duration-300 hover:border-[#2563eb]/30 hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#2563eb] to-[#06b6d4]" />
                          <p className="leading-7 text-slate-600">{topic}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Frequently Asked Questions
                  </h2>

                  <div className="mt-5 space-y-4">
                    {faqItems.map((item) => (
                      <div
                        key={item.question}
                        className="rounded-2xl bg-slate-50 p-5"
                      >
                        <h3 className="text-lg font-semibold text-slate-900">
                          {item.question}
                        </h3>

                        {item.points ? (
                          <>
                            <p className="mt-3 text-slate-600">Make sure:</p>
                            <ul className="mt-3 space-y-3">
                              {item.points.map((point) => (
                                <li
                                  key={point}
                                  className="flex items-start gap-3 text-slate-600"
                                >
                                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#2563eb] to-[#06b6d4]" />
                                  <span className="leading-7">{point}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : null}

                        {item.answer ? (
                          <p className="mt-3 leading-7 text-slate-600">
                            {item.answer}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Data & Privacy
                  </h2>
                  <p className="mt-4 leading-7 text-slate-600 sm:leading-8">
                    We take your data seriously. To learn more about how PMify
                    handles your information, please review our privacy policy.
                  </p>
                  <div className="mt-5">
                    <Link
                      href="/privacy-policy"
                      className="inline-flex items-center rounded-full bg-gradient-to-r from-[#2563eb] to-[#06b6d4] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      View Privacy Policy
                    </Link>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-[#1e3a8a] to-[#0f766e] p-6 text-white shadow-sm sm:p-7">
                  <h2 className="text-2xl font-semibold">
                    Still need help?
                  </h2>
                  <p className="mt-3 max-w-2xl leading-7 text-white/85">
                    Don&apos;t hesitate to contact us. We&apos;re always happy to
                    assist you with setup, troubleshooting, and integration
                    questions.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href="mailto:support@pmify.cloud"
                      className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      Email Support
                    </a>
                    <Link
                      href="/zoom-integration"
                      className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      Zoom Integration Guide
                    </Link>
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

export default SupportPage;
