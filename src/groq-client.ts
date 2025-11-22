import Groq from "groq-sdk";
import { config } from "./config.js";

export type GroqRole = "system" | "user" | "assistant";

export interface GroqMessage {
	role: GroqRole;
	content: string;
}

export interface GroqChatOptions {
	system?: string;
	prompt?: string;
	messages?: GroqMessage[];
	temperature?: number;
	maxTokens?: number;
	responseFormat?: "json_object";
	stop?: string | string[];
}

const groq = new Groq({
	apiKey: config.groqApiKey,
});

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function groqChat({
	system,
	prompt,
	messages = [],
	temperature = 0,
	maxTokens = 512,
	responseFormat,
	stop,
}: GroqChatOptions): Promise<string> {
	const payloadMessages: GroqMessage[] = [...messages];

	if (system) {
		payloadMessages.unshift({
			role: "system",
			content: system,
		});
	}

	if (prompt) {
		payloadMessages.push({
			role: "user",
			content: prompt,
		});
	}

	// Retry logic for rate limits
	const maxRetries = 3;
	let lastError: Error | null = null;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			const completion = await groq.chat.completions.create({
				model: config.groqModel,
				messages: payloadMessages,
				temperature,
				max_tokens: maxTokens,
				stop,
				response_format: responseFormat ? { type: responseFormat } : undefined,
			});

			return completion.choices?.[0]?.message?.content?.trim() ?? "";
		} catch (error: any) {
			lastError = error;

			// Check if it's a rate limit error
			if (error?.status === 429 || error?.error?.code === "rate_limit_exceeded") {
				const retryAfter = error?.headers?.["retry-after"];
				const waitTime = retryAfter
					? parseInt(retryAfter) * 1000
					: Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s

				console.warn(
					`⚠️  Rate limit hit, retrying in ${waitTime / 1000}s (attempt ${attempt + 1}/${maxRetries})`,
				);
				await sleep(waitTime);
				continue;
			}

			// If it's not a rate limit error, throw immediately
			throw error;
		}
	}

	// If we've exhausted all retries, throw the last error
	throw lastError || new Error("Failed to get response from Groq");
}

export async function groqChatJson(
	options: Omit<GroqChatOptions, "responseFormat">,
) {
	const response = await groqChat({
		...options,
		responseFormat: "json_object",
	});

	return response;
}

