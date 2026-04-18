import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 10 },
    { duration: '30s', target: 120 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.5'],
  },
};

export default function () {
  const base = __ENV.BASE_URL || 'http://localhost:3000';
  http.get(`${base}/api/v1/incidents?page=1&limit=20`);
  sleep(0.05);
}
