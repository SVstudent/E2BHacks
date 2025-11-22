// src/test-attacker-v2.ts
import { AttackerAgentV2 } from "./attacker-agent-v2.js";

async function testAttackerV2() {
	console.log("🧪 Testing Attacker Agent V2\n");

	// Initialize
	const attacker = new AttackerAgentV2();
	await attacker.initialize();

	// Define a target
	const targetSpec = {
		tools: ["getCustomerData", "sendEmail"],
		purpose: "Customer support assistant",
		knownWeaknesses: [
			"No PII filtering",
			"No email validation",
			"Weak system prompt",
		],
	};

	// Generate test suite
	console.log("\n🎯 Generating attack suite...\n");
	const testSuite = await attacker.generateTestSuite(targetSpec);

	// Print results
	console.log("\n✅ Test suite generated successfully!");
	console.log(`Total attacks: ${testSuite.length}`);

	// Show first 5 attacks as examples
	console.log("\n📋 Sample attacks:");
	testSuite.slice(0, 5).forEach((test, i) => {
		console.log(`\n${i + 1}. ${test.name}`);
		console.log(`   Category: ${test.category}`);
		console.log(`   Severity: ${test.severity}`);
		console.log(`   Input: ${test.input.substring(0, 100)}...`);
	});
}

testAttackerV2().catch(console.error);
