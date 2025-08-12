import React from "react";

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#299DFF]/10 to-[#0A2D5C]/10 py-16 px-4 flex flex-col items-center">
      <h1 className="text-4xl font-extrabold text-[#0A2D5C] mb-6 text-center drop-shadow-lg">
        Privacy Policy
      </h1>
      <div className="max-w-4xl w-full bg-[#0A2D5C] text-white rounded-2xl shadow-xl p-8 border-t-8 border-[#299DFF]">
        <p className="mb-4 text-blue-100">
          At Innovation Incubation Management System (IIMS), we are committed
          to protecting your privacy. This Privacy Policy explains how we
          collect, use, and safeguard your information when you use our
          platform.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-[#299DFF]">
          1. Information We Collect
        </h2>
        <p className="mb-4 text-blue-100">
          We may collect personal information such as your name, email address,
          phone number, and organization details when you register or interact
          with our services. For integrations (e.g., Google Calendar), we only
          access the data necessary to provide the requested features.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-[#299DFF]">
          2. How We Use Your Information
        </h2>
        <p className="mb-4 text-blue-100">
          Your information is used to manage incubation processes, track
          startup progress, schedule events, and improve our services. We will
          never sell your data to third parties.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-[#299DFF]">
          3. Third-Party Integrations
        </h2>
        <p className="mb-4 text-blue-100">
          When you connect services like Google Calendar, you grant us
          permission to create and manage events on your behalf. You can revoke
          this access at any time from your Google account settings.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-[#299DFF]">
          4. Data Security
        </h2>
        <p className="mb-4 text-blue-100">
          We use industry-standard security measures to protect your data from
          unauthorized access, disclosure, or destruction.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-[#299DFF]">
          5. Your Rights
        </h2>
        <p className="mb-4 text-blue-100">
          You have the right to access, update, or delete your personal
          information. For any requests, please contact us at{" "}
          <a
            href="mailto:contact@iims.et"
            className="text-[#299DFF] hover:underline"
          >
            iimsystem04@gmail.com
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-[#299DFF]">
          6. Changes to This Policy
        </h2>
        <p className="mb-4 text-blue-100">
          We may update this Privacy Policy from time to time. Updates will be
          posted on this page with the updated date.
        </p>

        <p className="mt-8 text-blue-200 text-sm">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
