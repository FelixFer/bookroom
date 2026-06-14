export const MIN_PASSWORD_LENGTH = 8

export const PASSWORD_TOO_SHORT = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`

export const MAX_NAME_LENGTH = 12

export const NAME_INVALID = `Username must be alphanumeric and ${MAX_NAME_LENGTH} characters or fewer`

export const normalizeEmail = (value: unknown) =>
  typeof value === 'string' ? value.trim().toLowerCase() : ''

export const isValidPassword = (password: string) => password.length >= MIN_PASSWORD_LENGTH

export const normalizeName = (value: unknown) =>
  typeof value === 'string' ? value.trim() : ''

export const isValidName = (name: string) =>
  /^[A-Za-z0-9]+$/.test(name) && name.length <= MAX_NAME_LENGTH
