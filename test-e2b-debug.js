// Quick E2B debug script to see what's actually failing
import { Sandbox } from 'e2b';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
  console.log('🔧 Creating E2B sandbox for debugging...');

  const sandbox = await Sandbox.create('base', {
    apiKey: process.env.E2B_API_KEY,
  });

  console.log('✅ Sandbox created');

  // Test 1: Simple echo
  console.log('\n📝 Test 1: Simple echo');
  const test1 = await sandbox.commands.run('echo "Hello from E2B"');
  console.log('Exit code:', test1.exitCode);
  console.log('Stdout:', test1.stdout);
  console.log('Stderr:', test1.stderr);

  // Test 2: Node.js availability
  console.log('\n📝 Test 2: Node.js version');
  const test2 = await sandbox.commands.run('node --version');
  console.log('Exit code:', test2.exitCode);
  console.log('Stdout:', test2.stdout);
  console.log('Stderr:', test2.stderr);

  // Test 3: Run simple Node script with env var
  console.log('\n📝 Test 3: Node script with env var');
  const testScript = `console.log(JSON.stringify({ test: 'working', env: process.env.TEST_VAR }));`;
  await sandbox.filesystem.write('/tmp/test.js', testScript);

  const test3 = await sandbox.commands.run('node /tmp/test.js', {
    envs: { TEST_VAR: 'hello' }
  });
  console.log('Exit code:', test3.exitCode);
  console.log('Stdout:', test3.stdout);
  console.log('Stderr:', test3.stderr);

  // Test 4: Run with HTTPS (like our Groq call)
  console.log('\n📝 Test 4: HTTPS request test');
  const httpsScript = `
const https = require('https');
https.get('https://api.github.com/zen', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(JSON.stringify({ success: true, data })));
}).on('error', (err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
`;
  await sandbox.filesystem.write('/tmp/https-test.js', httpsScript);

  const test4 = await sandbox.commands.run('node /tmp/https-test.js', {
    timeoutMs: 10000
  });
  console.log('Exit code:', test4.exitCode);
  console.log('Stdout:', test4.stdout);
  console.log('Stderr:', test4.stderr);

  await sandbox.kill();
  console.log('\n✅ Debug tests completed');
})();
