import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          SweetCMS
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Agent-driven headless CMS for T3 Stack
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Next.js + tRPC + Drizzle + Better Auth
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Admin Dashboard
          </Link>
          <Link
            href="/blog"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Blog
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Sign In
          </Link>
        </div>
      </div>
      <footer className="absolute bottom-8 text-xs text-gray-400">
        Powered by SweetCMS &middot; MIT License
      </footer>
    </div>
  );
}
