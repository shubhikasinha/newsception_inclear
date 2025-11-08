import { expressjwt, GetVerificationKey } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { Request, Response, NextFunction } from 'express';

const auth0Domain = process.env.AUTH0_DOMAIN;
const auth0Audience = process.env.AUTH0_AUDIENCE;

if (!auth0Domain || !auth0Audience) {
  console.warn('⚠️  Auth0 credentials not configured. Authentication will be disabled.');
}

export const checkJwt = auth0Domain && auth0Audience ? expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
  }) as GetVerificationKey,
  audience: auth0Audience,
  issuer: `https://${auth0Domain}/`,
  algorithms: ['RS256'],
}) : (req: Request, _res: Response, next: NextFunction) => {
  // If Auth0 not configured, skip authentication for development
  req.auth = { sub: 'dev-user' };
  next();
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    return next();
  }
  return checkJwt(req, res, next);
};

// Extract user ID from JWT
export const getUserId = (req: Request): string => {
  return req.auth?.sub || 'anonymous';
};
