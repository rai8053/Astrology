const autocannon = require('autocannon');

async function runLoadTest() {
  console.log('Running load test against health endpoint...');
  
  const result = await autocannon({
    url: 'http://localhost:4000/api/health',
    connections: 100,
    duration: 10,
    pipelining: 1,
    requests: [
      { method: 'GET', path: '/api/health' }
    ]
  });

  console.log('=== Load Test Results (100 concurrent users) ===');
  console.log(`Requests/sec: ${result.requests.average}`);
  console.log(`Latency avg: ${result.latency.average}ms`);
  console.log(`Latency p99: ${result.latency.p99}ms`);
  console.log(`Total requests: ${result.requests.total}`);
  console.log(`Errors: ${result.errors}`);
  console.log(`Timeouts: ${result.timeouts}`);
  
  console.log('');
  console.log('Running load test with 500 concurrent connections...');
  
  const result2 = await autocannon({
    url: 'http://localhost:4000/api/health',
    connections: 500,
    duration: 10,
    pipelining: 1,
    requests: [
      { method: 'GET', path: '/api/health' }
    ]
  });

  console.log('=== Load Test Results (500 concurrent users) ===');
  console.log(`Requests/sec: ${result2.requests.average}`);
  console.log(`Latency avg: ${result2.latency.average}ms`);
  console.log(`Latency p99: ${result2.latency.p99}ms`);
  console.log(`Total requests: ${result2.requests.total}`);
  console.log(`Errors: ${result2.errors}`);
  console.log(`Timeouts: ${result2.timeouts}`);

  process.exit(0);
}

runLoadTest().catch(err => {
  console.error('Load test failed:', err);
  process.exit(1);
});
