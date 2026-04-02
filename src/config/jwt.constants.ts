/** Access token lifetime in seconds (default 900 = 15 minutes). */
export function getJwtAccessExpiresSeconds(): number {
  const n = parseInt(process.env.JWT_ACCESS_EXPIRES_SECS ?? '900', 10);
  if (!Number.isFinite(n) || n < 60) {
    return 900;
  }
  return n;
}
