import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 15,
  duration: '20s',
};

export function setup() {
  const base = __ENV.BASE_URL || 'http://localhost:3000';
  const email = __ENV.ADMIN_EMAIL || 'admin@wasel.local';
  const password = __ENV.ADMIN_PASSWORD || 'ChangeMeAdmin123!';
  const res = http.post(
    `${base}/api/v1/auth/login`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  const ok = check(res, { 'admin login 200': (r) => r.status === 200 });
  if (!ok || res.status !== 200) {
    throw new Error(
      `write-heavy setup: login failed HTTP ${res.status} — seed admin (${email}) or set ADMIN_EMAIL/ADMIN_PASSWORD`,
    );
  }
  const body = res.json();
  if (!body || !body.accessToken) {
    throw new Error('write-heavy setup: no accessToken in login response');
  }
  return { token: String(body.accessToken) };
}

export default function (data) {
  const base = __ENV.BASE_URL || 'http://localhost:3000';
  http.post(
    `${base}/api/v1/incidents`,
    JSON.stringify({
      type: 'traffic',
      description: 'k6 load',
      latitude: 32.22,
      longitude: 35.25,
      severity: 'LOW',
      status: 'OPEN',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`,
      },
    },
  );

  sleep(1);
}
