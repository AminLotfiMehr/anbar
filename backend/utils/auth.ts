export function hashPassword(password: string): string {
  return Buffer.from(password).toString('base64');
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
