'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { postJson } from '@/lib/api'
import { Button } from '@/app/_components/Button'
import { LoaderOverlay } from '@/app/_components/Loader'
import { TextField } from '@/app/_components/FormField'
import { useSubmit } from '@/hooks/useSubmit'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')

  const { handleSubmit, loading, error } = useSubmit(async () => {
    await postJson<{ ok: true }>('/api/auth/password/reset', { token, password })
    router.push('/')
  }, 'Failed to reset password')

  return (
    <div className="page-center">
      <div className="auth-card">
        <h1 className="page-title">Set new password</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <TextField
            label="New password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error ? (
            <p className="form-error">{error}</p>
          ) : (
            <p className="form-help">Password must be at least 8 characters.</p>
          )}

          <Button type="submit" variant="filled" loading={loading} disabled={!token}>
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
