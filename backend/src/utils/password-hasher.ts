import bcrypt from 'bcryptjs';

export class PasswordHasher {
  constructor(private readonly salt: number) {}

  async hashPassword(password: string) {
    return bcrypt.hash(password, this.salt);
  }

  async comparePasswordWithHash(password: string, hash: string) {
    try {
      return await bcrypt.compare(password, hash);
    } catch {
      return false;
    }
  }
}
