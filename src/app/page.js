"use client";

export default function Home() {
  console.log("Rendering Home component"); // Debug log to confirm rendering

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.target);
      const response = await fetch("/api/sso/saml", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const html = await response.text();
      const newWindow = window.open();
      newWindow.document.write(html);
      newWindow.document.close();
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
        </main>
      </div>
    </div>
  );
}
