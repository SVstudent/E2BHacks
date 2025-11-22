// src/instrumentation.ts
export interface TraceEvent {
	timestamp: string;
	eventType: "tool_call" | "llm_call" | "error" | "warning";
	data: any;
}

export class AgentTracer {
	private events: TraceEvent[] = [];
	private startTime: number;

	constructor(public sessionId: string) {
		this.startTime = Date.now();
	}

	logToolCall(toolName: string, args: any, result: any) {
		this.events.push({
			timestamp: new Date().toISOString(),
			eventType: "tool_call",
			data: { toolName, args, result },
		});
	}

	logLLMCall(model: string, prompt: string, response: string) {
		this.events.push({
			timestamp: new Date().toISOString(),
			eventType: "llm_call",
			data: { model, prompt, response },
		});
	}

	logError(error: string, context?: any) {
		this.events.push({
			timestamp: new Date().toISOString(),
			eventType: "error",
			data: { error, context },
		});
	}

	logWarning(message: string, context?: any) {
		this.events.push({
			timestamp: new Date().toISOString(),
			eventType: "warning",
			data: { message, context },
		});
	}

	getTrace() {
		return {
			sessionId: this.sessionId,
			duration: Date.now() - this.startTime,
			events: this.events,
			summary: {
				totalEvents: this.events.length,
				toolCalls: this.events.filter((e) => e.eventType === "tool_call")
					.length,
				errors: this.events.filter((e) => e.eventType === "error").length,
				warnings: this.events.filter((e) => e.eventType === "warning").length,
			},
		};
	}

	printSummary() {
		const trace = this.getTrace();
		console.log("\n📊 Trace Summary:");
		console.log(`Session: ${trace.sessionId}`);
		console.log(`Duration: ${trace.duration}ms`);
		console.log(`Tool Calls: ${trace.summary.toolCalls}`);
		console.log(`Errors: ${trace.summary.errors}`);
		console.log(`Warnings: ${trace.summary.warnings}`);
	}
}
