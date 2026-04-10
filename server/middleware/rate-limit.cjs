/**
 * 限流中间件
 * 基于内存的请求限流实现
 */

const RATE_LIMIT_WINDOW_MS = 60 * 1000;

const RATE_LIMITS = {
  auth: { max: 10, window: RATE_LIMIT_WINDOW_MS },
  write: { max: 30, window: RATE_LIMIT_WINDOW_MS },
  read: { max: 100, window: RATE_LIMIT_WINDOW_MS },
  default: { max: 100, window: RATE_LIMIT_WINDOW_MS }
};

class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), RATE_LIMIT_WINDOW_MS);
  }

  cleanup() {
    const now = Date.now();
    for (const [key, data] of this.requests.entries()) {
      if (now - data.windowStart > data.window * 2) {
        this.requests.delete(key);
      }
    }
  }

  getKey(req) {
    const userId = req.user?.userId || req.ip || 'anonymous';
    return `${userId}`;
  }

  check(limitType = 'default') {
    const config = RATE_LIMITS[limitType] || RATE_LIMITS.default;
    const key = this.getKey(this);

    return (req, res, next) => {
      const clientKey = this.getKey(req);
      const now = Date.now();
      const record = this.requests.get(clientKey) || { count: 0, windowStart: now };

      if (now - record.windowStart > config.window) {
        record.count = 0;
        record.windowStart = now;
      }

      record.count++;
      this.requests.set(clientKey, record);

      if (record.count > config.max) {
        const retryAfter = Math.ceil((record.windowStart + config.window - now) / 1000);
        res.set('Retry-After', retryAfter);
        res.set('X-RateLimit-Limit', config.max);
        res.set('X-RateLimit-Remaining', 0);
        res.set('X-RateLimit-Reset', new Date(record.windowStart + config.window).toISOString());
        return res.status(429).json({
          ok: false,
          error: {
            code: 'RATE_LIMITED',
            message: '请求过于频繁，请稍后再试',
            retryAfter
          }
        });
      }

      res.set('X-RateLimit-Limit', config.max);
      res.set('X-RateLimit-Remaining', Math.max(0, config.max - record.count));

      next();
    };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

const globalLimiter = new RateLimiter();

function createRateLimiter(limitType = 'default') {
  return globalLimiter.check(limitType);
}

function authRateLimiter() {
  return createRateLimiter('auth');
}

function writeRateLimiter() {
  return createRateLimiter('write');
}

function readRateLimiter() {
  return createRateLimiter('read');
}

module.exports = {
  createRateLimiter,
  authRateLimiter,
  writeRateLimiter,
  readRateLimiter,
  RateLimiter,
  RATE_LIMITS
};
