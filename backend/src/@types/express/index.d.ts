import { DbUser } from '../../validation/validation';
import { JwtToken } from '../../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      token?: JwtToken;
      user?: DbUser;
    }
  }
}
