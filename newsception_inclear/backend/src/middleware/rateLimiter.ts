import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const searchRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 20, // 20 searches per minute
  message: {
    error: 'Too many search requests, please slow down.',
  },
});

export const debateRateLimiter = rateLimit({
  windowMs: 300000, // 5 minutes
  max: 10, // 10 debate requests per 5 minutes
  message: {
    error: 'Too many debate requests, please wait.',
  },
});
