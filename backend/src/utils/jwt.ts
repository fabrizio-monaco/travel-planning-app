import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

export class Jwt {
  constructor(
    private readonly secret: string,
    private readonly options: SignOptions,
  ) {}
  generateToken(payload: JwtUserData) {
    return jwt.sign(payload, this.secret, this.options);
  }
  verifyToken(token: string) {
    return jwt.verify(token, this.secret) as JwtToken;
  }
}

type JwtUserData = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type JwtToken = JwtUserData & JwtPayload;
