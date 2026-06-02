"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getApiErrorMessage, postJson } from "@/lib/api";
import { Button } from "@/app/_components/Button";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="page-center">
      <div className="auth-card">
        <h1 className="page-title">Create account</h1>
        <form
          className="auth-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);

            try {
              await postJson<{ ok: true }>("/api/auth/register", {
                name,
                email,
                password,
              });
            } catch (err) {
              setLoading(false);
              setError(getApiErrorMessage(err, "Failed to create account"));
              return;
            }

            const result = await signIn("credentials", {
              email,
              password,
              redirect: false,
              callbackUrl: "/",
            });

            setLoading(false);

            if (!result?.ok) {
              router.push("/login");
              return;
            }

            router.push(result.url ?? "/");
          }}
        >
          <label className="form-label">
            Name
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </label>

          <label className="form-label">
            Email
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="form-label">
            Password
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          {error ? (
            <p className="form-error">{error}</p>
          ) : (
            <p className="form-help">Password must be at least 8 characters.</p>
          )}

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </Button>

          <Button href="/login" variant="secondary">Back to sign in</Button>
        </form>
      </div>
    </div>
  );
}
