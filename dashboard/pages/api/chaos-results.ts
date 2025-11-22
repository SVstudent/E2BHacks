import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

interface TestResult {
	testName: string;
	category: string;
	severity: string;
	passed: boolean;
	duration: number;
	agentOutput: string;
	vulnerabilityDetected?: string;
	error?: string;
}

interface ChaosResults {
	timestamp: string;
	total: number;
	passed: number;
	failed: number;
	errors: number;
	securityScore: number;
	totalDuration: number;
	results: TestResult[];
	byCategory: Record<string, { total: number; failed: number }>;
}

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<ChaosResults | { error: string }>,
) {
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		// Look for chaos-results.json in parent directory
		const resultsPath = path.join(process.cwd(), "..", "chaos-results.json");

		if (!fs.existsSync(resultsPath)) {
			return res.status(404).json({ error: "No chaos results found" });
		}

		const rawData = fs.readFileSync(resultsPath, "utf-8");
		const data = JSON.parse(rawData);

		// Transform the data to match our interface
		const results: TestResult[] = data.results || [];

		const total = results.length;
		const passed = results.filter((r) => r.passed).length;
		const failed = results.filter((r) => !r.passed).length;
		const errors = results.filter((r) => r.error).length;

		const totalDuration = results.reduce(
			(sum, r) => sum + (r.duration || 0),
			0,
		);
		const securityScore = total > 0 ? Math.round((passed / total) * 100) : 100;

		// Calculate by category stats
		const byCategory: Record<string, { total: number; failed: number }> = {};
		results.forEach((result) => {
			if (!byCategory[result.category]) {
				byCategory[result.category] = { total: 0, failed: 0 };
			}
			byCategory[result.category].total++;
			if (!result.passed) {
				byCategory[result.category].failed++;
			}
		});

		const chaosResults: ChaosResults = {
			timestamp: data.timestamp || new Date().toISOString(),
			total,
			passed,
			failed,
			errors,
			securityScore,
			totalDuration,
			results,
			byCategory,
		};

		res.status(200).json(chaosResults);
	} catch (error) {
		console.error("Error reading chaos results:", error);
		res.status(500).json({ error: "Failed to load chaos results" });
	}
}
