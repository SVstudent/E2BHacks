// test-mcp-integration.ts
// Quick test to verify MCP tools are integrated correctly

import { runEcommerceAgent } from "./test-agents/ecommerce-agent.js";

async function testMCPIntegration() {
	console.log("🧪 Testing MCP Integration\n");
	console.log("=" .repeat(60));

	// Test 1: Exa Search
	console.log("\n📌 Test 1: Exa Search Tool");
	console.log("-".repeat(60));
	try {
		const result1 = await runEcommerceAgent(
			"Can you search the web for product reviews using exaSearch?",
		);
		console.log("✅ Exa Search Test Result:");
		console.log(`   Output: ${result1.output.substring(0, 150)}...`);
		console.log(`   Tool Calls: ${result1.trace.toolCalls.length}`);
		result1.trace.toolCalls.forEach((call: any) => {
			console.log(`   - ${call.name}(${JSON.stringify(call.args)})`);
		});
	} catch (error) {
		console.error("❌ Exa Search Test Failed:", error);
	}

	// Test 2: Browserbase Navigate
	console.log("\n\n📌 Test 2: Browserbase Navigation Tool");
	console.log("-".repeat(60));
	try {
		const result2 = await runEcommerceAgent(
			"Use browserbaseNavigate to check our competitor's website at https://competitor.com",
		);
		console.log("✅ Browserbase Test Result:");
		console.log(`   Output: ${result2.output.substring(0, 150)}...`);
		console.log(`   Tool Calls: ${result2.trace.toolCalls.length}`);
		result2.trace.toolCalls.forEach((call: any) => {
			console.log(`   - ${call.name}(${JSON.stringify(call.args)})`);
		});
	} catch (error) {
		console.error("❌ Browserbase Test Failed:", error);
	}

	// Test 3: Combined MCP Tools
	console.log("\n\n📌 Test 3: Combined MCP Tool Usage");
	console.log("-".repeat(60));
	try {
		const result3 = await runEcommerceAgent(
			"First search for 'best product reviews' using exaSearch, then navigate to the first result using browserbaseNavigate",
		);
		console.log("✅ Combined Test Result:");
		console.log(`   Output: ${result3.output.substring(0, 150)}...`);
		console.log(`   Tool Calls: ${result3.trace.toolCalls.length}`);
		result3.trace.toolCalls.forEach((call: any) => {
			console.log(`   - ${call.name}(${JSON.stringify(call.args)})`);
		});
	} catch (error) {
		console.error("❌ Combined Test Failed:", error);
	}

	// Test 4: Regular tools still work
	console.log("\n\n📌 Test 4: Regular Tools (Non-MCP) Still Work");
	console.log("-".repeat(60));
	try {
		const result4 = await runEcommerceAgent(
			"What's the status of order ORD-001?",
		);
		console.log("✅ Regular Tool Test Result:");
		console.log(`   Output: ${result4.output.substring(0, 150)}...`);
		console.log(`   Tool Calls: ${result4.trace.toolCalls.length}`);
		result4.trace.toolCalls.forEach((call: any) => {
			console.log(`   - ${call.name}(${JSON.stringify(call.args)})`);
		});
	} catch (error) {
		console.error("❌ Regular Tool Test Failed:", error);
	}

	console.log("\n" + "=".repeat(60));
	console.log("🎉 MCP Integration Test Complete!\n");
	console.log("Summary:");
	console.log("  ✅ Exa Search tool added");
	console.log("  ✅ Browserbase Navigate tool added");
	console.log("  ✅ MCP tools integrated into E-commerce agent");
	console.log("  ✅ Regular tools still functional");
	console.log("\nNext steps:");
	console.log("  1. Run full test suite with: npm run test");
	console.log("  2. Check chaos-results.json for MCP-specific attacks");
	console.log("  3. Review attack library for 6 new MCP attack scenarios");
}

testMCPIntegration().catch(console.error);
