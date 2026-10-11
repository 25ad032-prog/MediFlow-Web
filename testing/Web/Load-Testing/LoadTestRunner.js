const autocannon = require('autocannon');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const CONNECTIONS = parseInt(process.env.LOAD_CONNECTIONS || '100', 10);
const DURATION = parseInt(process.env.LOAD_DURATION || '60', 10);

async function runLoadBenchmark() {
  console.log('========================================================');
  console.log('⚡ EXECUTING MEDIFLOW WEB LOAD BENCHMARK (AUTOCANNON)');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Workload: ${CONNECTIONS} concurrent connections sustained for ${DURATION}s`);
  console.log('Endpoints: /api/health, /api/locations, /api/doctors, /api/healthcare/status');
  console.log('========================================================\n');

  const instance = autocannon({
    url: `${BASE_URL}/api/doctors?location=Chennai`,
    connections: CONNECTIONS,
    duration: DURATION,
    pipelining: 1,
    headers: { 'accept': 'application/json' },
    requests: [
      { method: 'GET', path: '/api/health' },
      { method: 'GET', path: '/api/locations' },
      { method: 'GET', path: '/api/doctors?location=Chennai' },
      { method: 'GET', path: '/api/healthcare/status' }
    ]
  });

  return new Promise((resolve, reject) => {
    instance.on('done', (result) => {
      console.log('Load benchmark completed successfully:');
      console.log(`- Total Requests:      ${result.requests.total}`);
      console.log(`- Requests Per Second: ${result.requests.average} req/s`);
      console.log(`- Average Latency:     ${result.latency.average} ms`);
      console.log(`- Min Latency:         ${result.latency.min} ms`);
      console.log(`- Max Latency:         ${result.latency.max} ms`);
      console.log(`- p50 Latency:         ${result.latency.p50} ms`);
      console.log(`- p90 Latency:         ${result.latency.p90} ms`);
      console.log(`- p95 Latency:         ${result.latency.p95} ms`);
      console.log(`- Error Rate:          ${result.errors ? ((result.errors / result.requests.total) * 100).toFixed(2) : '0.00'}%`);
      console.log(`- Failed Requests:     ${result.errors || 0}`);
      resolve(result);
    });
    instance.on('error', reject);
  });
}

if (require.main === module) {
  runLoadBenchmark().catch(err => {
    console.error('Benchmark failed:', err);
    process.exit(1);
  });
}

module.exports = runLoadBenchmark;
