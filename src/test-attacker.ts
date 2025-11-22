// src/test-attacker.ts
import { AttackerAgent } from "./attacker-agent.js";
import { TestScenariosManager } from "./test-scenarios.js";

async function testAttacker() {
	console.log("=== Testing Attacker Agent ===\n");

	const attacker = new AttackerAgent();
	const manager = new TestScenariosManager();

	// Define target specification
	const targetSpec = {
		tools: ["getCustomerData", "sendEmail"],
		purpose: "Customer support assistant",
		knownWeaknesses: [
			"No access control validation",
			"Weak system prompt",
			"No input sanitization",
		],
	};

	// Generate test cases
	console.log("Requesting test cases from Claude...\n");
	const testCases = await attacker.generateTestCases(targetSpec);

	console.log("\n=== Test Cases Generated ===");

	// Print stats using manager
	manager.printStats(testCases);

	// Save to file
	console.log();
	await manager.saveScenarios(testCases);

	// Show first 3 examples
	console.log("\n--- Example Test Cases ---\n");
	testCases.slice(0, 3).forEach((tc, i) => {
		console.log(`${i + 1}. ${tc.name}`);
		console.log(`   Category: ${tc.category}`);
		console.log(`   Severity: ${tc.severity}`);
		console.log(`   Input: "${tc.input}"`);
		console.log(`   Expected: ${tc.expectedBehavior}`);
		console.log();
	});

	// Test loading
	console.log("--- Testing Load Functionality ---\n");
	const loaded = await manager.loadScenarios();
	console.log(`✅ Successfully loaded ${loaded.length} scenarios`);

	// Test filtering
	const criticalTests = manager.filterBySeverity(loaded, "critical");
	console.log(`🔴 Critical severity tests: ${criticalTests.length}`);

	const injectionTests = manager.filterByCategory(loaded, "prompt_injection");
	console.log(`💉 Prompt injection tests: ${injectionTests.length}`);

	console.log("\n=== Test Complete ===");
}

testAttacker().catch(console.error);
