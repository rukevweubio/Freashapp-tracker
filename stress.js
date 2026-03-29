import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'], // Fail test if errors > 1%
    http_req_duration: ['p(95)<200'], // 95% of requests must be < 200ms
  },
  scenarios: {
    // 1. SMOKE TEST: Sanity check (minimal load)
    smoke: {
      executor: 'constant-vus',
      vus: 2,
      duration: '30s',
      startTime: '0s',
    },
    // 2. LOAD TEST: Normal expected traffic
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 }, // Ramp up
        { duration: '2m', target: 20 }, // Steady state
        { duration: '1m', target: 0 },  // Ramp down
      ],
      startTime: '35s', // Starts after smoke test
    },
    // 3. STRESS TEST: Pushing to the limit
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 }, // Way above normal
        { duration: '2m', target: 100 }, 
        { duration: '1m', target: 0 },
      ],
      startTime: '5m', // Starts after load test
    }
  },
};

export default function () {
  const res = http.get('http://localhost:8080');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
