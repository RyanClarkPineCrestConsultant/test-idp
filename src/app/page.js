"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [samlResponse, setSamlResponse] = useState(null); 

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.target);
      const response = await fetch("/api/sso/saml", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(`API error: ${response.statusText}`);
      const responseData = await response.json(); // Parse as JSON instead of text
      console.log("SAML Response:", responseData);
      setSamlResponse(responseData);
    } catch (error) {
      console.error("Error during form submission:", error);
      alert("An error occurred. Please try again.");
    }
  };
  // console.log("BLOO:", samlResponse?.base64);

  return (
    <div>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <h1 className="text-4xl font-bold text-center">
            Welcome to the SSO Demo
          </h1>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 w-full max-w-sm"
          >
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="border border-gray-300 rounded px-4 py-2"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="border border-gray-300 rounded px-4 py-2"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
            >
              Submit
            </button>
          </form>
          {samlResponse && (
            <div className="mt-4 p-4 border border-gray-300 rounded">
              <form method="POST" action="https://itest1.ease.com/v2/sso/saml2">
                <input type="hidden" name="SAMLResponse" value={samlResponse.base64} />
                <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600">Submit SAML Assertion</button>
              </form>
              <h2>X.509 Certificate</h2>
              <pre>{samlResponse.x509.replace(/(.{64})/g, "$1\n")}</pre>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
