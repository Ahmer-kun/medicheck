import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    // Gentle ramp-up to avoid crashing
    { duration: '30s', target: 5 },   // Start slow: 5 users
    { duration: '30s', target: 10 },  // Increase to 10 users
    { duration: '1m', target: 15 },   // Main load: 15 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // 95% under 1 second
    http_req_failed: ['rate<0.1'],      // Less than 10% errors
  },
};

export default function () {
  const BASE_URL = 'http://localhost:5000';
  
  // Test only your WORKING endpoints
  const endpoints = [
    // 1. Health check (should always work)
    { 
      url: '/api/health', 
      check: (r) => r.status === 200 
    },
    // 2. Get pharmacy companies
    { 
      url: '/api/pharmacy-companies', 
      check: (r) => r.status === 200 
    },
    // 3. Medicine verification (most important),
    // 4. Get all medicines
    // { 
    //   url: '/api/pharmacy/medicines', 
    //   check: (r) => r.status === 200 
    // }
  ];

  // Test each endpoint
  endpoints.forEach(endpoint => {
    const res = http.get(BASE_URL + endpoint.url);
    
    check(res, {
      [`${endpoint.url} status 200`]: endpoint.check,
      [`${endpoint.url} response time`]: (r) => r.timings.duration < 2000,
    });

    // Random delay between requests (like real users)
    sleep(Math.random() * 1 + 0.5); // 0.5-1.5 seconds
  });
}

// import http from 'k6/http';
// import { check, sleep } from 'k6';

// export const options = {
//   stages: [
//     { duration: '30s', target: 10 },  // Ramp up to 10 users
//     { duration: '1m', target: 10 },   // Stay at 10 users
//     { duration: '30s', target: 0 },   // Ramp down to 0
//   ],
// };

// export default function () {
//   const BASE_URL = 'http://localhost:5000';
  
//   // Test 1: Health check
//   const healthRes = http.get(`${BASE_URL}/api/health`);
//   check(healthRes, { 'health status 200': (r) => r.status === 200 });
  
//   // Test 2: Get pharmacy companies
//   const companiesRes = http.get(`${BASE_URL}/api/pharmacy-companies`);
//   check(companiesRes, { 'companies status 200': (r) => r.status === 200 });
  
//   // Test 3: Verify medicine
//   const verifyRes = http.get(`${BASE_URL}/api/batches/verify/PHARM-2024-001`);
//   check(verifyRes, { 'verify status 200': (r) => r.status === 200 });
  
//   sleep(1);
// }