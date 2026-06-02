"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/app/_components/Button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="page-center">
      <div className="auth-card">
        <h1 className="page-title">Sign in</h1>
        <form
          className="auth-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);
            const result = await signIn("credentials", {
              email,
              password,
              redirect: false,
              callbackUrl,
            });
            setLoading(false);

            if (!result?.ok) {
              setError("Invalid email or password");
              return;
            }

            router.push(result.url ?? callbackUrl);
          }}
        >
          <label className="form-label">
            Email
            <input
              className="form-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="form-label">
            Password
            <input
              className="form-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          <Link
            className="text-sm text-zinc-600 underline underline-offset-4 dark:text-zinc-400"
            href="/forgot-password"
          >
            Forgot password?
          </Link>

          <Button href="/signup" variant="secondary">Create account</Button>
        </form>
      </div>
    </div>
  );
}
