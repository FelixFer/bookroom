import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { SignOutButton } from "@/app/_components/sign-out-button";

export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log("Session:", session);
  const userEmail = session?.user?.email;

  return (
    <div className="page-center">
      <main className="home-card">
        <h1 className="page-title">Bookroom</h1>

        {userEmail ? (
          <div className="auth-form">
            <p className="text-zinc-600 dark:text-zinc-400">
              Signed in as <span className="font-medium">{userEmail}</span>
            </p>
            <SignOutButton />
          </div>
        ) : (
          <div className="auth-form">
            <p className="text-zinc-600 dark:text-zinc-400">
              Sign in to start building your personal library.
            </p>
            <div className="flex gap-3">
              <Link
                className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
                href="/login"
              >
                Sign in
              </Link>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-900 dark:border-zinc-800 dark:text-zinc-50"
                href="/signup"
              >
                Create account
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
