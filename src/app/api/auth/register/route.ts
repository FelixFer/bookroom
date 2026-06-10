import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { ok, err, parseBody } from '@/lib/server-utils'
import { normalizeEmail, isValidPassword, PASSWORD_TOO_SHORT } from '@/lib/validation'

export const POST = async (request: Request) => {
  const { body, response } = await parseBody(request)
  if (!body) return response

  const email = normalizeEmail(body.email)
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email) return err('Email is required', 422)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('Invalid email format', 422)
  if (!isValidPassword(password)) return err(PASSWORD_TOO_SHORT, 422)

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) return err('Email already exists', 409)

  await prisma.user.create({
    data: { email, name: typeof body.name === 'string' ? body.name : null, passwordHash: hashPassword(password) },
  })

  return ok({ message: 'Account created' }, 201)
}
