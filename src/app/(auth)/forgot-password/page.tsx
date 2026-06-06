"use client";

import { useState } from "react";
import { getApiErrorMessage, postJson } from "@/lib/api";
import { Button } from "@/app/_components/Button";
import { LoaderOverlay } from "@/app/_components/Loader";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="page-center">
      <div className="auth-card">
        <h1 className="page-title">Reset password</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Enter your email and we'll generate a reset link.
        </p>

        <form
          className="auth-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            setResetUrl(null);

            try {
              const data = await postJson<{ ok: true; resetUrl?: string }>(
                "/api/auth/password/forgot",
                { email },
              );
              setDone(true);
              if (data?.resetUrl) setResetUrl(data.resetUrl);
            } catch (err) {
              setError(getApiErrorMessage(err, "Failed to request reset link"));
            } finally {
              setLoading(false);
            }
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

          {error ? <p className="form-error">{error}</p> : null}

          <Button type="submit" variant="primary" loading={loading}>
            Send reset link
          </Button>
        </form>
        {loading && <LoaderOverlay />}

        {done ? (
          <div className="info-box">
            If an account exists for that email, a reset link has been created.
            {resetUrl ? (
              <div className="mt-2 break-all">
                <a className="underline underline-offset-4" href={resetUrl}>
                  {resetUrl}
                </a>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
