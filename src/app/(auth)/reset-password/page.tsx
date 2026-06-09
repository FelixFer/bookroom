'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { getApiErrorMessage, postJson } from '@/lib/api'
import { Button } from '@/app/_components/Button'
import { LoaderOverlay } from '@/app/_components/Loader'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="page-center">
      <div className="auth-card">
        <h1 className="page-title">Set new password</h1>

        <form
          className="auth-form"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            setLoading(true)
            try {
              await postJson<{ ok: true }>('/api/auth/password/reset', {
                token,
                password,
              })
              router.push('/')
            } catch (err) {
              setError(getApiErrorMessage(err, 'Failed to reset password'))
            } finally {
              setLoading(false)
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

          <Button type="submit" variant="primary" loading={loading} disabled={!token}>
            Save new password
          </Button>
        </form>
        {loading && <LoaderOverlay />}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
