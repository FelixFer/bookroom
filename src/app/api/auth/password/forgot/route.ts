import { prisma } from '@/lib/prisma'
import { generateResetToken, hashResetToken } from '@/lib/password-reset'
import { sendPasswordResetEmail } from '@/lib/email'
import { ok, err, parseBody } from '@/lib/server-utils'
import { normalizeEmail } from '@/lib/validation'
import { NextRequest } from 'next/server'

export const POST = async (request: NextRequest) => {
  const { body, response } = await parseBody(request)
  if (!body) return response

  const email = normalizeEmail(body.email)
  if (!email) return err('Email is required', 422)

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (!user) return err('Email not found', 404)

  const expiresAt = new Date(Date.now() + 3600000)

  for (let i = 0; i < 3; i++) {
    const token = generateResetToken()
    const tokenHash = hashResetToken(token)
    try {
      await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } })
      const resetUrl = `${request.nextUrl.origin}/reset-password?token=${encodeURIComponent(token)}`

      const sent = await sendPasswordResetEmail(email, resetUrl)
      const response: { ok: true; resetUrl?: string } = { ok: true }
      if (!sent && process.env.NODE_ENV !== 'production') {
        response.resetUrl = resetUrl
      }
      return ok(response)
    } catch {
      continue
    }
  }

  return err('Something went wrong', 400)
}
