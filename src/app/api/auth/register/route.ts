import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { ok, err } from '@/lib/server-utils'

export const POST = async (request: Request) => {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return err('Invalid payload', 400)

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email) return err('Email is required', 422)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('Invalid email format', 422)
  if (password.length < 8) return err('Password must be at least 8 characters', 422)

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) return err('Email already exists', 409)

  await prisma.user.create({
    data: { email, name: typeof body.name === 'string' ? body.name : null, passwordHash: hashPassword(password) },
  })

  return ok({ message: 'Account created' }, 201)
}
