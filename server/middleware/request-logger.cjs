function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const endedAt = process.hrtime.bigint();
    const durationMs = Number(endedAt - startedAt) / 1_000_000;
    const method = req.method.padEnd(6, ' ');
    const path = req.originalUrl || req.url;
    const status = String(res.statusCode).padEnd(3, ' ');
    const ip = req.ip || req.socket?.remoteAddress || '-';
    console.log(
      `[api] ${new Date().toISOString()} ${method} ${status} ${path} (${durationMs.toFixed(1)}ms) ip=${ip}`,
    );
  });

  next();
}

module.exports = {
  requestLogger,
};
