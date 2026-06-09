import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { hashResetToken } from '@/lib/password-reset'
import { ok, err } from '@/lib/server-utils'

export const POST = async (request: Request) => {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return err('Invalid payload', 422)

  const token = typeof body.token === 'string' ? body.token : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!token || !password) return err('Invalid payload', 422)
  if (password.length < 8) return err('Password must be at least 8 characters', 422)

  const tokenHash = hashResetToken(token)
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  })

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return err('Reset link is invalid or expired', 400)
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash: hashPassword(password) } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ])

  return ok({ message: 'Password reset' })
}
