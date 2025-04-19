"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [samlResponse, setSamlResponse] = useState("");
  
  console.log("Rendering Home component"); // Debug log to confirm rendering
  
  // Modified useEffect to open in a new window
  useEffect(() => {
    if (samlResponse) {
      console.log("Auto-submitting SAML form");
      const form = document.getElementById("samlForm");
      form.addEventListener("submit", () => {
        console.log("Form submitted to SP");
      });
      form.submit();
    }
  }, [samlResponse]);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.target);
      const response = await fetch("/api/sso/saml", {
        method: "POST",
        body: formData,
      });

      // Log the response status and headers
      console.log("Response Status:", response.status);
      console.log("Response Headers:", [...response.headers.entries()]);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const responseText = await response.text();

      // Log the returned SAML assertion
      console.log("SAML Assertion Response:", responseText);
      
      // Set the SAML response in the state
      setSamlResponse(responseText);
    } catch (error) {
      console.error("Error during form submission:", error);
      alert("An error occurred. Please try again.");
    }
  };

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
            <div className="mt-8 w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-4">Processing SSO login...</h2>
              <form 
                id="samlForm" 
                action="https://itest1.ease.com/v2/sso/saml2" 
                method="POST" 
                target="_blank" 
                style={{display: 'none'}}
              >
                <input
                  type="hidden"
                  name="SAMLResponse"
                  value={samlResponse}
                />
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
