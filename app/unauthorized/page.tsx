import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold">403</h1>

        <h2 className="mt-2 text-xl font-semibold">
          Unauthorized
        </h2>

        <p className="mt-2 text-muted-foreground">
          You do not have permission to access this page.
        </p>

        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-foreground px-4 py-2 text-background"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}