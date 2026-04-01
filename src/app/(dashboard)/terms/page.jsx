import React from "react";

function Terms() {
  return (
    <div className="px-5  text-[#333]">
      <h1 className="mb-4 text-3xl font-bold text-[#2c3e50]">
        Terms of Service
      </h1>

      <p className="mb-2">
        <strong>Effective Date:</strong> [Insert Date]
      </p>
      <p className="mb-6">
        <strong>App Name:</strong> [Your App Name]
      </p>

      <h2 className="mb-2 text-2xl font-semibold text-[#2c3e50]">
        1. Acceptance of Terms
      </h2>
      <p className="mb-6 leading-7">
        By installing or using this application, you agree to these Terms of
        Service. If you do not agree, please do not use the app.
      </p>

      <h2 className="mb-2 text-2xl font-semibold text-[#2c3e50]">
        2. Description of Service
      </h2>
      <p className="mb-6 leading-7">
        This application integrates with Zoom to access meeting transcripts and
        related data in order to provide summaries, insights, or storage.
      </p>

      <h2 className="mb-2 text-2xl font-semibold text-[#2c3e50]">
        3. User Consent & Responsibilities
      </h2>
      <ul className="mb-6 list-disc space-y-2 pl-6 leading-7">
        <li>
          You must obtain consent from all meeting participants before
          recording or processing transcripts.
        </li>
        <li>
          You must comply with applicable laws regarding privacy and recording.
        </li>
        <li>You agree not to misuse the service.</li>
      </ul>

      <h2 className="mb-2 text-2xl font-semibold text-[#2c3e50]">
        4. Data Access & Permissions
      </h2>
      <p className="mb-6 leading-7">
        The app may access transcripts, recordings, and basic account
        information only as required to provide services.
      </p>

      <h2 className="mb-2 text-2xl font-semibold text-[#2c3e50]">
        5. Prohibited Use
      </h2>
      <ul className="mb-6 list-disc space-y-2 pl-6 leading-7">
        <li>Unauthorized surveillance</li>
        <li>Violating others&apos; privacy</li>
        <li>Reverse engineering the app</li>
      </ul>

      <h2 className="mb-2 text-2xl font-semibold text-[#2c3e50]">
        6. Service Availability
      </h2>
      <p className="mb-6 leading-7">
        We do not guarantee uninterrupted service and may modify features at
        any time.
      </p>

      <h2 className="mb-2 text-2xl font-semibold text-[#2c3e50]">
        7. Limitation of Liability
      </h2>
      <p className="mb-6 leading-7">
        We are not responsible for data loss or indirect damages resulting from
        use of the app.
      </p>

      <h2 className="mb-2 text-2xl font-semibold text-[#2c3e50]">
        8. Termination
      </h2>
      <p className="mb-6 leading-7">
        We may suspend or terminate access if these terms are violated.
      </p>

      <h2 className="mb-2 text-2xl font-semibold text-[#2c3e50]">
        9. Changes
      </h2>
      <p className="mb-6 leading-7">
        We may update these terms. Continued use means acceptance.
      </p>

      <h2 className="mb-2 text-2xl font-semibold text-[#2c3e50]">
        10. Contact
      </h2>
      <p className="leading-7">
        Email: [Your Email]
      </p>
    </div>
  );
}

export default Terms;