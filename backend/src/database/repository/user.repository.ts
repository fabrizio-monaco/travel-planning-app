import type { Database } from '..';
import { CreateUser } from '../../validation/validation';
import { user } from '../schema/user.schema';

export class UserRepository {
  constructor(private readonly database: Database) {}

  async getUserById(id: string) {
    return this.database.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, id),
    });
  }

  async getUserByEmail(email: string) {
    return this.database.query.user.findFirst({
      where: (user, { eq }) => eq(user.email, email),
    });
  }

  async createUser(data: CreateUser) {
    return this.database.insert(user).values(data).returning({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }); // Returning specific fields to avoid returning the password hash
  }
}
