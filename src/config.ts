// src/config.ts
import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
	"ANTHROPIC_API_KEY",
	"GROQ_API_KEY",
	"E2B_API_KEY",
	"BROWSERBASE_API_KEY",
	"EXA_API_KEY",
];

const missing = requiredEnvVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
	console.error(
		"❌ Missing required environment variables:",
		missing.join(", "),
	);
	console.error(
		"Please copy .env.example to .env and provide the required API keys.",
	);
	process.exit(1);
}

export const config = {
	anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
	groqApiKey: process.env.GROQ_API_KEY!,
	groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
	e2bApiKey: process.env.E2B_API_KEY!,
	e2bTemplate: process.env.E2B_TEMPLATE || "base",
	sandboxWorkspace: process.env.E2B_WORKSPACE || "/home/user/workspace",
	mcp: {
		browserbase: {
			apiKey: process.env.BROWSERBASE_API_KEY!,
			serverUrl: process.env.MCP_BROWSERBASE_URL || "",
			token: process.env.MCP_BROWSERBASE_TOKEN || "",
		},
		exa: {
			apiKey: process.env.EXA_API_KEY!,
			serverUrl: process.env.MCP_EXA_URL || "",
			token: process.env.MCP_EXA_TOKEN || "",
		},
		github: {
			token: process.env.GITHUB_TOKEN || "",
			serverUrl: process.env.MCP_GITHUB_URL || "",
		},
	},
};

console.log("✅ Environment variables loaded");
