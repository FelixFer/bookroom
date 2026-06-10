import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { hashResetToken } from '@/lib/password-reset'
import { ok, err, parseBody } from '@/lib/server-utils'
import { isValidPassword, PASSWORD_TOO_SHORT } from '@/lib/validation'

export const POST = async (request: Request) => {
  const { body, response } = await parseBody(request)
  if (!body) return response

  const token = typeof body.token === 'string' ? body.token : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!token || !password) return err('Invalid payload', 422)
  if (!isValidPassword(password)) return err(PASSWORD_TOO_SHORT, 422)

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
