import { NextFunction, Request, RequestHandler, Response } from 'express';
import { DI } from '../dependency-injection';

export const prepareAuthentication = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.get('Authorization');
  if (authHeader) {
    const token = DI.utils.jwt.verifyToken(authHeader);
    const user = await DI.repositories.user.getUserById(token.id);
    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    req.token = token;
  }
  next();
};

export const verifyAccess: RequestHandler = (req: Request, res, next) => {
  if (!req.user) {
    res.status(401).json({ errors: [`No or invalid authorization provided`] });
    return;
  }
  next();
};
