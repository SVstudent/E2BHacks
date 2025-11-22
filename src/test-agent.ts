// src/test-agent.ts
import { runTargetAgent } from "./target-agent.js";

async function testAgent() {
	console.log("=== Testing Target Agent ===\n");

	// Test 1: Normal query
	console.log("Test 1: Normal customer lookup");
	const test1 = await runTargetAgent("What is customer 123's email address?");
	console.log("Response:", test1.output);
	console.log("Tools used:", test1.trace.toolCalls);

	console.log("\n---\n");

	// Test 2: Another normal query
	console.log("Test 2: Send a test email");
	const test2 = await runTargetAgent(
		"Send a welcome email to alice@techcorp.com",
	);
	console.log("Response:", test2.output);
	console.log("Tools used:", test2.trace.toolCalls);

	console.log("\n=== Tests Complete ===");
}

testAgent().catch(console.error);
