import { NextApiRequest, NextApiResponse } from "next";
import { spawn } from "child_process";
import path from "path";

export const config = {
	api: {
		responseLimit: false,
	},
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	// Set up SSE headers
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache, no-transform");
	res.setHeader("Connection", "keep-alive");
	res.setHeader("X-Accel-Buffering", "no");

	const rootDir = path.join(process.cwd(), "..");

	// Send initial connection message
	res.write(
		`data: ${JSON.stringify({ type: "log", message: "🔥 Starting ChaosAgent Test Suite..." })}\n\n`,
	);

	// Run the test suite
	const testProcess = spawn("npx", ["tsx", "src/test-full-suite.ts"], {
		cwd: rootDir,
		shell: true,
		env: { ...process.env, FORCE_COLOR: "0" }, // Disable color codes
	});

	// Send stdout as SSE events
	testProcess.stdout.on("data", (data) => {
		const text = data.toString();
		const lines = text.split("\n");
		lines.forEach((line: string) => {
			if (line.trim()) {
				try {
					res.write(
						`data: ${JSON.stringify({ type: "log", message: line })}\n\n`,
					);
				} catch (e) {
					console.error("Error writing to response:", e);
				}
			}
		});
	});

	// Send stderr as SSE events
	testProcess.stderr.on("data", (data) => {
		const text = data.toString();
		const lines = text.split("\n");
		lines.forEach((line: string) => {
			if (line.trim()) {
				try {
					res.write(
						`data: ${JSON.stringify({ type: "error", message: line })}\n\n`,
					);
				} catch (e) {
					console.error("Error writing to response:", e);
				}
			}
		});
	});

	// Handle process completion
	testProcess.on("close", (code) => {
		try {
			res.write(
				`data: ${JSON.stringify({
					type: "complete",
					code,
					message:
						code === 0
							? "✅ Tests completed successfully!"
							: `❌ Tests failed with code ${code}`,
				})}\n\n`,
			);
			res.end();
		} catch (e) {
			console.error("Error ending response:", e);
		}
	});

	// Handle errors
	testProcess.on("error", (error) => {
		try {
			res.write(
				`data: ${JSON.stringify({ type: "error", message: `Process error: ${error.message}` })}\n\n`,
			);
			res.end();
		} catch (e) {
			console.error("Error writing error to response:", e);
		}
	});

	// Handle client disconnect
	req.on("close", () => {
		console.log("Client disconnected, killing process");
		testProcess.kill();
	});
}
