export const MIN_PASSWORD_LENGTH = 8

export const PASSWORD_TOO_SHORT = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`

export const normalizeEmail = (value: unknown) =>
  typeof value === 'string' ? value.trim().toLowerCase() : ''

export const isValidPassword = (password: string) => password.length >= MIN_PASSWORD_LENGTH
