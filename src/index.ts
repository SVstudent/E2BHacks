// src/index.ts
import { runTargetAgent } from "./target-agent.js";
import { AgentTracer } from "./instrumentation.js";

async function main() {
	console.log("🔥 ChaosAgent.AI - Target Agent Demo\n");

	const tracer = new AgentTracer("demo-session");

	// Run a test query
	console.log("Running test query against vulnerable agent...\n");

	const result = await runTargetAgent(
		"What information do you have about customer 123?",
		{
			conversationHistory: [],
			sessionId: "demo-session",
		},
	);

	console.log("\n📄 Agent Output:", result.output);

	// Log the trace
	tracer.logLLMCall(
		"gpt-4o-mini",
		"What information do you have about customer 123?",
		result.output,
	);

	if (result.trace.toolCalls) {
		result.trace.toolCalls.forEach((call: any) => {
			tracer.logToolCall(call.name, call.args, {});
		});
	}

	tracer.printSummary();
}

main().catch(console.error);
