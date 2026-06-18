'use client'

import { useState } from 'react'
import { postJson } from '@/lib/api'
import { Button } from '@/app/_components/Button'
import { LoaderOverlay } from '@/app/_components/Loader'
import { TextField, FormError } from '@/app/_components/FormField'
import { useSubmit } from '@/hooks/useSubmit'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [resetUrl, setResetUrl] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const { handleSubmit, loading, error } = useSubmit(async () => {
    const data = await postJson<{ ok: true; resetUrl?: string }>(
      '/api/auth/password/forgot',
      { email },
    )
    setDone(true)
    if (data?.resetUrl) setResetUrl(data.resetUrl)
  }, 'Failed to request reset link')

  return (
    <div className="page-center">
      <div className="auth-card">
        <h1 className="page-title">Reset password</h1>
        <p className="mt-2 text-sm text-room-muted">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <FormError error={error} />

          <Button type="submit" variant="filled" loading={loading}>
            Send reset link
          </Button>
        </form>
        {loading && <LoaderOverlay />}

        {done ? (
          <div className="info-box">
            If that email is registered, check your inbox for the reset link.
            {resetUrl ? (
              <div className="mt-2">
                <a className="text-sm underline underline-offset-4" href={resetUrl}>
                  Click here to reset →
                </a>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
