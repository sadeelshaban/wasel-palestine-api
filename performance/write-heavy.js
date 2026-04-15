import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 15,
  duration: '20s',
};

export default function () {
  http.post(
    'http://localhost:3000/api/v1/incidents',
    JSON.stringify({
      type: 'traffic',
      description: 'test',
      latitude: 32.22,
      longitude: 35.25,
      severity: 'LOW',
      status: 'OPEN',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );

  sleep(1);
}