"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getApiErrorMessage, postJson } from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="page-center">
      <div className="auth-card">
        <h1 className="page-title">Set new password</h1>

        <form
          className="auth-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);
            try {
              await postJson<{ ok: true }>("/api/auth/password/reset", {
                token,
                password,
              });
              router.push("/login");
            } catch (err) {
              setError(getApiErrorMessage(err, "Failed to reset password"));
            } finally {
              setLoading(false);
            }
          }}
        >
          <label className="form-label">
            New password
            <input
              className="form-input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error ? (
            <p className="form-error">{error}</p>
          ) : (
            <p className="form-help">Password must be at least 8 characters.</p>
          )}

          <button
            className="btn-primary"
            type="submit"
            disabled={loading || !token}
          >
            {loading ? "Saving..." : "Save new password"}
          </button>
        </form>
      </div>
    </div>
  );
}
