import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 8,
  duration: __ENV.SOAK_DURATION || '3m',
  thresholds: {
    http_req_failed: ['rate<0.3'],
  },
};

export default function () {
  const base = __ENV.BASE_URL || 'http://localhost:3000';
  http.get(`${base}/api/v1/incidents?page=1&limit=15`);
  http.get(`${base}/health`);
  sleep(0.5);
}
