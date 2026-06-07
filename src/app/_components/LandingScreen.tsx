"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getApiErrorMessage, postJson } from "@/lib/api";
import { Button } from "@/app/_components/Button";
import { LoaderOverlay } from "@/app/_components/Loader";

function LandingScreenInner() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [activeForm, setActiveForm] = useState<"login" | "signup">("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);

  async function handleLogin(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    const result = await signIn("credentials", {
      email: loginEmail.toLowerCase(),
      password: loginPassword,
      redirect: false,
      callbackUrl,
    });
    setLoginLoading(false);
    if (!result?.ok) {
      setLoginError("Invalid email or password");
      return;
    }
    window.location.href = result.url ?? callbackUrl;
  }

  async function handleSignup(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSignupError(null);

    if (signupPassword !== signupConfirm) {
      setSignupError("Passwords do not match");
      return;
    }

    setSignupLoading(true);
    try {
      await postJson<{ ok: true }>("/api/auth/register", {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      });
    } catch (err) {
      setSignupLoading(false);
      setSignupError(getApiErrorMessage(err, "Failed to create account"));
      return;
    }

    const result = await signIn("credentials", {
      email: signupEmail,
      password: signupPassword,
      redirect: false,
      callbackUrl: "/",
    });

    setSignupLoading(false);
    if (!result?.ok) {
      window.location.href = "/";
      return;
    }
    window.location.href = result.url ?? "/";
  }

  return (
    <>
      <div className="page-center">
        {/* Background — light mode */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat dark:hidden"
          style={{ backgroundImage: "url('/auth-day.png')" }}
        />
        {/* Background — dark mode */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 hidden bg-cover bg-center bg-no-repeat dark:block"
          style={{ backgroundImage: "url('/auth-night.png')" }}
        />
        {/* Tint overlay */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-white/20 dark:bg-black/30" />

        <div className="landing-layout">
          {/* Brand card */}
          <div className="landing-brand-card">
            <h1 className="page-title">Bookroom</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Your cozy personal library. Track what you read, what you love, and
              what&apos;s next.
            </p>
          </div>

          {/* Animated forms */}
          <div className="forms">
            {/* Login form */}
            <div className={`form-wrapper ${activeForm === "login" ? "is-active" : ""}`}>
              <form className="form form-login" onSubmit={handleLogin}>
                <div className="form-header">
                  <p className="form-inner-title">Login</p>
                  <button
                    type="button"
                    className="switcher switcher-to-signup"
                    onClick={() => setActiveForm("signup")}
                  >
                    Sign Up →
                    <span className="switcher-line"></span>
                  </button>
                </div>

                <fieldset>
                  <legend>Enter your email and password to sign in.</legend>

                  <label className="form-label">
                    Email
                    <input
                      className="form-input"
                      type="email"
                      autoComplete="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </label>

                  <label className="form-label">
                    Password
                    <input
                      className="form-input"
                      type="password"
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </label>

                  {loginError ? (
                    <p className="form-error">{loginError}</p>
                  ) : null}

                  <Link
                    className="text-xs text-zinc-600 underline underline-offset-4 dark:text-zinc-400 w-fit hover:text-zinc-800 dark:hover:text-zinc-300"
                    href="/forgot-password"
                  >
                    Forgot password?
                  </Link>
                </fieldset>

                <Button
                  type="submit"
                  variant="primary"
                  className="btn-login"
                  loading={loginLoading}
                >
                  Login
                </Button>
              </form>
            </div>

            {/* Signup form */}
            <div className={`form-wrapper ${activeForm === "signup" ? "is-active" : ""}`}>
              <form className="form form-signup" onSubmit={handleSignup}>
                <div className="form-header">
                  <p className="form-inner-title">Sign Up</p>
                  <button
                    type="button"
                    className="switcher switcher-to-login"
                    onClick={() => setActiveForm("login")}
                  >
                    ← Login
                    <span className="switcher-line"></span>
                  </button>
                </div>

                <fieldset>
                  <legend>Enter your details to create an account.</legend>

                  <label className="form-label">
                    Name
                    <input
                      className="form-input"
                      type="text"
                      autoComplete="name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                    />
                  </label>

                  <label className="form-label">
                    Email
                    <input
                      className="form-input"
                      type="email"
                      autoComplete="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </label>

                  <label className="form-label">
                    Password
                    <input
                      className="form-input"
                      type="password"
                      autoComplete="new-password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </label>

                  <label className="form-label">
                    Confirm password
                    <input
                      className="form-input"
                      type="password"
                      autoComplete="new-password"
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                      required
                    />
                  </label>

                  {signupError ? (
                    <p className="form-error text-xs!">{signupError}</p>
                  ) : null}
                </fieldset>

                <Button
                  type="submit"
                  variant="secondary"
                  className="btn-signup"
                  loading={signupLoading}
                >
                  Create account
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {(loginLoading || signupLoading) && <LoaderOverlay />}
    </>
  );
}

export const LandingScreen = () => (
  <Suspense>
    <LandingScreenInner />
  </Suspense>
);
