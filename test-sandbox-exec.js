// Test E2B sandbox execution directly
import { Sandbox } from "e2b";
import dotenv from "dotenv";

dotenv.config();

async function testSandboxExecution() {
	console.log("🔍 Testing E2B sandbox execution...\n");

	const sandbox = await Sandbox.create("base", {
		apiKey: process.env.E2B_API_KEY,
	});

	try {
		// Test 1: Simple command
		console.log("Test 1: Simple echo command");
		const result1 = await sandbox.commands.run("echo 'Hello World'");
		console.log("  Exit code:", result1.exitCode);
		console.log("  Stdout:", result1.stdout);
		console.log("  Stderr:", result1.stderr);

		// Test 2: Node.js version
		console.log("\nTest 2: Node.js version");
		const result2 = await sandbox.commands.run("node --version");
		console.log("  Exit code:", result2.exitCode);
		console.log("  Stdout:", result2.stdout);
		console.log("  Stderr:", result2.stderr);

		// Test 3: Create workspace and run simple JS
		console.log("\nTest 3: Create workspace and run simple JS");
		await sandbox.commands.run("mkdir -p /home/user/workspace");

		const testCode = `
const test = { hello: "world" };
console.log(JSON.stringify(test));
`.trim();

		const encoded = Buffer.from(testCode, "utf-8").toString("base64");
		await sandbox.commands.run(
			`node -e "require('fs').writeFileSync('/home/user/workspace/test.js', Buffer.from('${encoded}', 'base64'))"`,
			{ cwd: "/" },
		);

		const result3 = await sandbox.commands.run("node /home/user/workspace/test.js");
		console.log("  Exit code:", result3.exitCode);
		console.log("  Stdout:", result3.stdout);
		console.log("  Stderr:", result3.stderr);

		// Test 4: Run with env vars
		console.log("\nTest 4: Run with environment variables");
		const testCodeWithEnv = `
console.log(JSON.stringify({
  hasGroq: !!process.env.GROQ_API_KEY,
  hasGroqModel: !!process.env.GROQ_MODEL
}));
`.trim();

		const encoded2 = Buffer.from(testCodeWithEnv, "utf-8").toString("base64");
		await sandbox.commands.run(
			`node -e "require('fs').writeFileSync('/home/user/workspace/test-env.js', Buffer.from('${encoded2}', 'base64'))"`,
			{ cwd: "/" },
		);

		const result4 = await sandbox.commands.run("node /home/user/workspace/test-env.js", {
			cwd: "/home/user/workspace",
			envs: {
				GROQ_API_KEY: process.env.GROQ_API_KEY || "",
				GROQ_MODEL: process.env.GROQ_MODEL || "llama-3.1-70b-versatile",
			},
		});
		console.log("  Exit code:", result4.exitCode);
		console.log("  Stdout:", result4.stdout);
		console.log("  Stderr:", result4.stderr);

		// Test 5: Run Groq API call
		console.log("\nTest 5: Test Groq API call");
		const groqTestCode = `
const https = require('https');

function callGroq() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages: [{ role: 'user', content: 'Say hello in 3 words' }],
      temperature: 0,
      max_tokens: 50,
    });

    const req = https.request(
      {
        hostname: 'api.groq.com',
        port: 443,
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.GROQ_API_KEY,
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.error) {
              reject(new Error(parsed.error.message || JSON.stringify(parsed.error)));
            } else {
              resolve(parsed.choices[0].message.content);
            }
          } catch (err) {
            reject(err);
          }
        });
      },
    );

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

(async () => {
  try {
    const response = await callGroq();
    console.log(JSON.stringify({ success: true, response }));
  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  }
})();
`.trim();

		const encoded3 = Buffer.from(groqTestCode, "utf-8").toString("base64");
		await sandbox.commands.run(
			`node -e "require('fs').writeFileSync('/home/user/workspace/test-groq.js', Buffer.from('${encoded3}', 'base64'))"`,
			{ cwd: "/" },
		);

		const result5 = await sandbox.commands.run("node /home/user/workspace/test-groq.js", {
			cwd: "/home/user/workspace",
			envs: {
				GROQ_API_KEY: process.env.GROQ_API_KEY || "",
			},
			timeoutMs: 10000,
		});
		console.log("  Exit code:", result5.exitCode);
		console.log("  Stdout:", result5.stdout);
		console.log("  Stderr:", result5.stderr);

		console.log("\n✅ All tests completed");
	} catch (error) {
		console.error("❌ Error:", error);
	} finally {
		await sandbox.kill();
		console.log("🗑️  Sandbox cleaned up");
	}
}

testSandboxExecution().catch(console.error);
