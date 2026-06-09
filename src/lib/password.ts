import crypto from 'node:crypto'

export const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16)
  const derivedKey = crypto.scryptSync(password, salt, 64)
  return `scrypt:${salt.toString('hex')}:${derivedKey.toString('hex')}`
}

export const verifyPassword = (password: string, stored: string) => {
  const [scheme, saltHex, keyHex] = stored.split(':')
  if (scheme !== 'scrypt' || !saltHex || !keyHex) return false
  const salt = Buffer.from(saltHex, 'hex')
  const key = Buffer.from(keyHex, 'hex')
  const derivedKey = crypto.scryptSync(password, salt, key.length)
  return crypto.timingSafeEqual(key, derivedKey)
}

