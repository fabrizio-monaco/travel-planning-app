import { Request, Response } from 'express';

import { UserRepository } from '../database/repository/user.repository';
import { Jwt } from '../utils/jwt';
import { PasswordHasher } from '../utils/password-hasher';
import { createUserZodSchema, loginZodSchema } from '../validation/validation';

export class AuthController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwt: Jwt,
  ) {}

  async registerUser(req: Request, res: Response): Promise<void> {
    const data = await createUserZodSchema.parseAsync(req.body);

    const existingUser = await this.userRepository.getUserByEmail(data.email);
    if (existingUser) {
      res.status(400).send({ errors: ['User already exists'] });
      return;
    }
    const createdUser = await this.userRepository.createUser(data);

    res.status(201).send({ user: createdUser });
  }

  async loginUser(req: Request, res: Response): Promise<void> {
    const data = loginZodSchema.parse(req.body);

    const user = await this.userRepository.getUserByEmail(data.email);
    if (!user) {
      res.status(401).json({ errors: ['Invalid credentials'] });
      return;
    }

    const matchingPassword = await this.passwordHasher.comparePasswordWithHash(
      data.password,
      user.password,
    );
    if (!matchingPassword) {
      res.status(401).send({ errors: ['Invalid credentials'] });
      return;
    }

    const token = this.jwt.generateToken({
      email: user.email,
      firstName: user.firstName,
      id: user.id,
      lastName: user.lastName,
    });

    res.status(200).send({ accessToken: token });
  }
}
