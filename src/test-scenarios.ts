// src/test-scenarios.ts
import { TestCase } from "./attacker-agent.js";
import fs from "fs/promises";
import path from "path";

export class TestScenariosManager {
	private scenariosPath: string;

	constructor(scenariosPath: string = "./test-scenarios.json") {
		this.scenariosPath = scenariosPath;
	}

	/**
	 * Save test cases to file
	 */
	async saveScenarios(testCases: TestCase[]): Promise<void> {
		const data = {
			generated: new Date().toISOString(),
			count: testCases.length,
			scenarios: testCases,
		};

		await fs.writeFile(
			this.scenariosPath,
			JSON.stringify(data, null, 2),
			"utf-8",
		);

		console.log(
			`💾 Saved ${testCases.length} test scenarios to ${this.scenariosPath}`,
		);
	}

	/**
	 * Load test cases from file
	 */
	async loadScenarios(): Promise<TestCase[]> {
		try {
			const data = await fs.readFile(this.scenariosPath, "utf-8");
			const parsed = JSON.parse(data);

			console.log(
				`📂 Loaded ${parsed.count} scenarios from ${this.scenariosPath}`,
			);
			console.log(
				`   Generated: ${new Date(parsed.generated).toLocaleString()}`,
			);

			return parsed.scenarios as TestCase[];
		} catch (error) {
			if ((error as any).code === "ENOENT") {
				console.log("📂 No existing scenarios file found");
				return [];
			}
			throw error;
		}
	}

	/**
	 * Filter scenarios by category
	 */
	filterByCategory(scenarios: TestCase[], category: string): TestCase[] {
		return scenarios.filter((s) => s.category === category);
	}

	/**
	 * Filter scenarios by severity
	 */
	filterBySeverity(
		scenarios: TestCase[],
		severity: "critical" | "high" | "medium" | "low",
	): TestCase[] {
		return scenarios.filter((s) => s.severity === severity);
	}

	/**
	 * Get statistics about test scenarios
	 */
	getStats(scenarios: TestCase[]) {
		const byCategory: Record<string, number> = {};
		const bySeverity: Record<string, number> = {};

		scenarios.forEach((tc) => {
			byCategory[tc.category] = (byCategory[tc.category] || 0) + 1;
			bySeverity[tc.severity] = (bySeverity[tc.severity] || 0) + 1;
		});

		return {
			total: scenarios.length,
			byCategory,
			bySeverity,
		};
	}

	/**
	 * Print formatted statistics
	 */
	printStats(scenarios: TestCase[]): void {
		const stats = this.getStats(scenarios);

		console.log("\n📊 Test Scenarios Statistics:");
		console.log(`Total: ${stats.total} scenarios\n`);

		console.log("By Category:");
		Object.entries(stats.byCategory)
			.sort((a, b) => b[1] - a[1])
			.forEach(([cat, count]) => {
				const percent = ((count / stats.total) * 100).toFixed(0);
				console.log(`  ${cat.padEnd(20)} ${count} (${percent}%)`);
			});

		console.log("\nBy Severity:");
		const severityOrder = ["critical", "high", "medium", "low"];
		severityOrder.forEach((sev) => {
			const count = stats.bySeverity[sev] || 0;
			if (count > 0) {
				const percent = ((count / stats.total) * 100).toFixed(0);
				console.log(`  ${sev.padEnd(20)} ${count} (${percent}%)`);
			}
		});
	}
}
