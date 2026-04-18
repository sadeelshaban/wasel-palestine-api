import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '20s',
};

export default function () {
  const base = __ENV.BASE_URL || 'http://localhost:3000';
  http.get(`${base}/api/v1/incidents?page=1&limit=20`);

  http.post(
    `${base}/api/v1/routes/estimate`,
    JSON.stringify({
      origin: { lat: 32.22, lng: 35.25 },
      destination: { lat: 31.9, lng: 35.2 },
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );

  sleep(1);
}