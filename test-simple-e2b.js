// Test if the issue is with HTTPS module in E2B base template
import { Sandbox } from 'e2b';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
  console.log('🔧 Testing HTTPS in E2B...');

  const sandbox = await Sandbox.create('base', {
    apiKey: process.env.E2B_API_KEY,
  });

  // Test if https module works
  const httpsTest = await sandbox.commands.run(`node -e "const https = require('https'); console.log('HTTPS OK');"`, {
    envs: { GROQ_API_KEY: process.env.GROQ_API_KEY }
  });

  console.log('HTTPS test exit code:', httpsTest.exitCode);
  console.log('HTTPS test stdout:', httpsTest.stdout);
  console.log('HTTPS test stderr:', httpsTest.stderr);

  // Test if environment variable is passed
  const envTest = await sandbox.commands.run(`node -e "console.log(JSON.stringify({ key: process.env.GROQ_API_KEY ? 'present' : 'missing' }));"`, {
    envs: { GROQ_API_KEY: process.env.GROQ_API_KEY }
  });

  console.log('\nEnv test exit code:', envTest.exitCode);
  console.log('Env test stdout:', envTest.stdout);
  console.log('Env test stderr:', envTest.stderr);

  await sandbox.kill();
  console.log('\n✅ Tests completed');
})();
