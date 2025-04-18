import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold text-center">
          Welcome to the SSO Demo
        </h1>
        <form
          method="POST"
          action="/api/sso/saml"
          className="flex flex-col gap-4 w-full max-w-sm"
        >
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="border border-gray-300 rounded px-4 py-2"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
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
  );
}
