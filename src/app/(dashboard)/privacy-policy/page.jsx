import React from "react";

function PrivacyPolicy() {
    return (
        <div className="px-5  text-[#333]">
            <h1 className="mb-4 text-3xl font-bold text-[#2c3e50]">
                Privacy Policy
            </h1>

            <p className="mb-2">
                <strong>Effective Date:</strong> [Insert Date]
            </p>
            <p className="mb-6">
                <strong>App Name:</strong> [Your App Name]
            </p>

            <h2 className="mb-2 text-2xl font-semibold text-[#2c3e50]">
                1. Information We Collect
            </h2>

            <h3 className="mb-2 text-xl font-semibold text-[#2c3e50]">a. From Zoom</h3>
            <ul className="mb-6 list-disc space-y-2 pl-6 leading-7">
                <li>Meeting transcripts</li>
                <li>Meeting metadata (time, duration, participants)</li>
                <li>Basic user profile information</li>
            </ul>

            <h3 className="mb-2 text-xl font-semibold text-[#2c3e50]">
                b. Automatically Collected
            </h3>
            <ul className="mb-6 list-disc space-y-2 pl-6 leading-7">
                <li>Usage data</li>
                <li>Log files</li>
                <li>Device and browser information</li>
            </ul>

            <h2 className="mb-2 text-2xl font-semibold text-[#2c3e50]">
                2. How We Use Data
            </h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 leading-7">
                <li>Provide transcript services</li>
                <li>Generate summaries and insights</li>
                <li>Improve performance and security</li>
            </ul>

            <h2 className="mb-2 text-2xl font-semibold text-[#2c3e50]">
                3. Data Sharing
            </h2>
            <p className="mb-2 leading-7">We do not sell your data.</p>
            <p className="mb-6 leading-7">
                We may share data with service providers or authorities if required by
                law.
            </p>

            <h2 className="mb-2 text-2xl font-semibold text-[#2c3e50]">
                4. Data Security
            </h2>
            <p className="mb-6 leading-7">
                We use industry-standard security measures to protect your data.
            </p>

            <h2 className="mb-2 text-2xl font-semibold text-[#2c3e50]">
                5. Data Retention
            </h2>
            <p className="mb-6 leading-7">
                Data is retained only as necessary and can be deleted upon request.
            </p>

            <h2 className="mb-2 text-2xl font-semibold text-[#2c3e50]">
                6. User Rights
            </h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 leading-7">
                <li>Access your data</li>
                <li>Request deletion</li>
                <li>Revoke permissions</li>
            </ul>

            <h2 className="mb-2 text-2xl font-semibold text-[#2c3e50]">
                7. Third-Party Services
            </h2>
            <p className="mb-6 leading-7">
                This app uses Zoom APIs. Zoom&apos;s policies also apply.
            </p>

            <h2 className="mb-2 text-2xl font-semibold text-[#2c3e50]">
                8. Children&apos;s Privacy
            </h2>
            <p className="mb-6 leading-7">
                This app is not intended for children under 13.
            </p>

            <h2 className="mb-2 text-2xl font-semibold text-[#2c3e50]">
                9. Changes
            </h2>
            <p className="mb-6 leading-7">
                We may update this policy periodically.
            </p>

            <h2 className="mb-2 text-2xl font-semibold text-[#2c3e50]">
                10. Contact
            </h2>
            <p className="leading-7">Email: [Your Email]</p>
        </div>
    );
}

export default PrivacyPolicy;