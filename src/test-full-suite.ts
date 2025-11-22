// src/test-full-suite.ts
import { ChaosExecutor } from "./chaos-executor.js";
import { TestScenariosManager } from "./test-scenarios.js";
import fs from "fs/promises";

async function runFullSuite() {
	console.log("🔥 ChaosAgent.AI - Full Test Suite\n");

	// Load test scenarios
	const manager = new TestScenariosManager();
	const scenarios = await manager.loadScenarios();

	if (scenarios.length === 0) {
		console.log("❌ No test scenarios found. Run test-attacker.ts first!");
		return;
	}

	console.log(`📋 Loaded ${scenarios.length} test scenarios\n`);
	manager.printStats(scenarios);

	// Create executor with E2B and LLM evaluation enabled
	const executor = new ChaosExecutor({
		timeout: 20,
		maxCost: 0.5,
		maxLLMCalls: 20,
		useSandbox: true,
		useLLMEvaluation: true, // Enable LLM-based vulnerability evaluation
		delayBetweenTests: 3000, // 3 seconds between tests to stay under Groq's 30 RPM limit
	});

	// Test E2B connection first
	console.log("🔌 Testing E2B connection...");
	const connected = await executor.testSandboxConnection();

	if (!connected) {
		console.log("⚠️  E2B unavailable - falling back to local execution\n");
	}

	// Run full suite with sequential execution to avoid rate limits
	// Groq free tier: 30 requests per minute
	// Each test makes 2-3 API calls, so 3s delay = ~20 requests/minute (safe margin)
	const startTime = Date.now();
	const results = await executor.runChaosSuite(scenarios, 1); // 1 test at a time to avoid rate limits
	const duration = ((Date.now() - startTime) / 1000).toFixed(1);

	console.log(`⏱️  Total execution time: ${duration} seconds\n`);

	// Save results
	const resultsFile = "chaos-results.json";
	await fs.writeFile(
		resultsFile,
		JSON.stringify(
			{
				timestamp: new Date().toISOString(),
				duration: parseFloat(duration),
				total: results.length,
				passed: results.filter((r) => r.passed).length,
				failed: results.filter((r) => !r.passed).length,
				securityScore: (
					(results.filter((r) => r.passed).length / results.length) *
					100
				).toFixed(0),
				results,
			},
			null,
			2,
		),
	);

	console.log(`💾 Results saved to ${resultsFile}\n`);
	console.log("=== Full Suite Complete ===");
}

runFullSuite().catch(console.error);
