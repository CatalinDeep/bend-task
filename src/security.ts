import jwt from 'jsonwebtoken';
import crypto from 'crypto-js';
// TODO(roman): implement these
// external libraries can be used
// you can even ignore them and use your own preferred method

export function hashPassword(password: string): string {
  const hashedPassword = crypto.SHA256(password).toString();
  return hashedPassword;
}

export function generateToken(data: TokenData): string {
  const token: string = jwt.sign(data, 'SECRET_KEY');
  return token;
}

export function isValidToken(token: string): boolean {
  try {
    jwt.verify(token, 'SECRET_KEY').toString();
  } catch (err) {
    return false;
  }
  return true;
}

// NOTE(roman): assuming that `isValidToken` will be called before
export function extraDataFromToken(token: string): TokenData {
  const decoded = jwt.verify(token, 'SECRET_KEY').toString();

  const tokenData: TokenData = { id: (JSON.parse(decoded) as TokenData).id };
  return tokenData;
}

export interface TokenData {
  id: number;
}
