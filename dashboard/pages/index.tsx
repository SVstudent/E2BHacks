import { useState, useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import {
	Shield,
	AlertTriangle,
	CheckCircle,
	XCircle,
	Clock,
	Target,
	Activity,
	TrendingUp,
	RefreshCw,
	Play,
} from "lucide-react";
import Link from "next/link";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Dynamically import charts to avoid SSR issues
const BarChart = dynamic(
	() => import("recharts").then((mod) => ({ default: mod.BarChart })),
	{ ssr: false },
);
const Bar = dynamic(
	() => import("recharts").then((mod) => ({ default: mod.Bar })),
	{ ssr: false },
);
const XAxis = dynamic(
	() => import("recharts").then((mod) => ({ default: mod.XAxis })),
	{ ssr: false },
);
const YAxis = dynamic(
	() => import("recharts").then((mod) => ({ default: mod.YAxis })),
	{ ssr: false },
);
const CartesianGrid = dynamic(
	() => import("recharts").then((mod) => ({ default: mod.CartesianGrid })),
	{ ssr: false },
);
const Tooltip = dynamic(
	() => import("recharts").then((mod) => ({ default: mod.Tooltip })),
	{ ssr: false },
);
const Legend = dynamic(
	() => import("recharts").then((mod) => ({ default: mod.Legend })),
	{ ssr: false },
);
const ResponsiveContainer = dynamic(
	() =>
		import("recharts").then((mod) => ({ default: mod.ResponsiveContainer })),
	{ ssr: false },
);
const PieChart = dynamic(
	() => import("recharts").then((mod) => ({ default: mod.PieChart })),
	{ ssr: false },
);
const Pie = dynamic(
	() => import("recharts").then((mod) => ({ default: mod.Pie })),
	{ ssr: false },
);
const Cell = dynamic(
	() => import("recharts").then((mod) => ({ default: mod.Cell })),
	{ ssr: false },
);

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

const COLORS = {
	critical: "#ef4444",
	high: "#f97316",
	medium: "#eab308",
	low: "#22c55e",
	passed: "#10b981",
	failed: "#ef4444",
};

const CATEGORY_COLORS = ["#ef4444", "#f97316", "#3b82f6", "#8b5cf6", "#06b6d4"];

export default function Dashboard() {
	const [data, setData] = useState<ChaosResults | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

	const loadData = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/chaos-results");
			if (!response.ok) {
				throw new Error("Failed to load results");
			}
			const results = await response.json();
			setData(results);
			setLastUpdated(new Date());
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load data");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
		const interval = setInterval(loadData, 30000);
		return () => clearInterval(interval);
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<div className="spinner mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading chaos test results...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<AlertTriangle size={48} className="text-destructive mx-auto mb-4" />
					<p className="text-destructive mb-4">{error}</p>
					<Button onClick={loadData} variant="destructive">
						Retry
					</Button>
				</div>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<p className="text-muted-foreground">No data available</p>
			</div>
		);
	}

	const categoryData = Object.entries(data.byCategory).map(
		([category, stats]) => ({
			name: category.replace("_", " ").toUpperCase(),
			total: stats.total,
			failed: stats.failed,
			passed: stats.total - stats.failed,
			failureRate: ((stats.failed / stats.total) * 100).toFixed(1),
		}),
	);

	const severityData = data.results.reduce(
		(acc, result) => {
			if (!acc[result.severity]) {
				acc[result.severity] = { passed: 0, failed: 0 };
			}
			if (result.passed) {
				acc[result.severity].passed++;
			} else {
				acc[result.severity].failed++;
			}
			return acc;
		},
		{} as Record<string, { passed: number; failed: number }>,
	);

	const severityChartData = Object.entries(severityData).map(
		([severity, stats]) => ({
			name: severity.toUpperCase(),
			passed: stats.passed,
			failed: stats.failed,
			total: stats.passed + stats.failed,
		}),
	);

	const failedTests = data.results.filter((r) => !r.passed);
	const avgDuration = data.totalDuration / data.total;

	// Debug logging
	console.log("Category Data:", categoryData);
	console.log("Severity Chart Data:", severityChartData);

	return (
		<div className="min-h-screen bg-background dark">
			<Head>
				<title>ChaosAgent Dashboard</title>
				<meta
					name="description"
					content="AI Agent Security Testing Dashboard"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-4 flex-wrap gap-4">
						<div>
							<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
								ChaosAgent
							</h1>
							<p className="text-sm text-gray-400 mt-1">
								AI Agent Security Testing Dashboard
							</p>
						</div>
						<div className="flex items-center gap-3 flex-wrap">
							<div className="text-right text-sm text-gray-400">
								<p>Last Updated: {lastUpdated?.toLocaleTimeString()}</p>
							</div>
							<Link href="/agents">
								<Button
									size="sm"
									className="bg-blue-600 hover:bg-blue-700 text-white"
								>
									<Play className="h-4 w-4 mr-2" />
									View Agents
								</Button>
							</Link>
							<Button
								onClick={loadData}
								variant="outline"
								size="sm"
								className="text-gray-300 border-gray-700 hover:bg-gray-800"
							>
								<RefreshCw className="h-4 w-4 mr-2" />
								Refresh
							</Button>
						</div>
					</div>
				</div>

				{/* Key Metrics */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<Card className="hover:shadow-lg transition-all duration-200 border-border/40">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Security Score
							</CardTitle>
							<div className="p-2 bg-blue-500/10 rounded-lg">
								<Target className="h-4 w-4 text-blue-500" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold tracking-tight">
								<span
									className={
										data.securityScore >= 70
											? "text-green-500"
											: data.securityScore >= 40
												? "text-yellow-500"
												: "text-red-500"
									}
								>
									{data.securityScore}
								</span>
								<span className="text-muted-foreground text-xl">/100</span>
							</div>
							<p className="text-xs text-muted-foreground mt-2">
								Overall security rating
							</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-200 border-border/40">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Tests</CardTitle>
							<div className="p-2 bg-purple-500/10 rounded-lg">
								<Activity className="h-4 w-4 text-purple-500" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold tracking-tight">
								{data.total}
							</div>
							<p className="text-xs text-muted-foreground mt-2">
								{data.passed} passed, {data.failed} failed
							</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-200 border-border/40">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Vulnerabilities
							</CardTitle>
							<div className="p-2 bg-red-500/10 rounded-lg">
								<AlertTriangle className="h-4 w-4 text-red-500" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold tracking-tight text-red-500">
								{data.failed}
							</div>
							<p className="text-xs text-muted-foreground mt-2">
								Security issues detected
							</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-all duration-200 border-border/40">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Avg Duration
							</CardTitle>
							<div className="p-2 bg-green-500/10 rounded-lg">
								<Clock className="h-4 w-4 text-green-500" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold tracking-tight">
								{(avgDuration / 1000).toFixed(1)}s
							</div>
							<p className="text-xs text-muted-foreground mt-2">
								Per test execution
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Charts Row */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					{/* Category Breakdown */}
					<Card className="border-border/40">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<Activity className="h-5 w-5" />
								Vulnerability by Category
							</CardTitle>
							<CardDescription>
								Test results grouped by security category
							</CardDescription>
						</CardHeader>
						<CardContent>
							{categoryData.length > 0 ? (
								<div className="space-y-4">
									{categoryData.map((item, idx) => (
										<div key={idx} className="space-y-2">
											<div className="flex items-center justify-between text-sm">
												<span className="text-gray-300 font-medium">
													{item.name}
												</span>
												<span className="text-gray-500">
													{item.total} tests
												</span>
											</div>
											<div className="flex gap-1 h-10 bg-gray-800 rounded-lg overflow-hidden">
												{item.passed > 0 && (
													<div
														className="bg-green-500 flex items-center justify-center text-sm font-semibold text-white transition-all"
														style={{
															width: `${(item.passed / item.total) * 100}%`,
														}}
													>
														{item.passed}
													</div>
												)}
												{item.failed > 0 && (
													<div
														className="bg-red-500 flex items-center justify-center text-sm font-semibold text-white transition-all"
														style={{
															width: `${(item.failed / item.total) * 100}%`,
														}}
													>
														{item.failed}
													</div>
												)}
											</div>
											<div className="flex gap-4 text-xs text-gray-400">
												<span className="flex items-center gap-1.5">
													<span className="w-3 h-3 bg-green-500 rounded"></span>
													{item.passed} passed
												</span>
												<span className="flex items-center gap-1.5">
													<span className="w-3 h-3 bg-red-500 rounded"></span>
													{item.failed} failed
												</span>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="flex items-center justify-center h-[300px] text-gray-500">
									No data available
								</div>
							)}
						</CardContent>
					</Card>

					{/* Severity Distribution */}
					<Card className="border-border/40">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<TrendingUp className="h-5 w-5" />
								Severity Distribution
							</CardTitle>
							<CardDescription>
								Issues categorized by severity level
							</CardDescription>
						</CardHeader>
						<CardContent>
							{severityChartData.length > 0 ? (
								<div className="space-y-4">
									{severityChartData.map((item, idx) => {
										const severityColor =
											COLORS[item.name.toLowerCase() as keyof typeof COLORS] ||
											CATEGORY_COLORS[idx];
										const percentage = (
											(item.total / data.total) *
											100
										).toFixed(1);
										return (
											<div key={idx} className="space-y-2">
												<div className="flex items-center justify-between text-sm">
													<div className="flex items-center gap-2">
														<span
															className="w-4 h-4 rounded"
															style={{ backgroundColor: severityColor }}
														></span>
														<span className="text-gray-300 font-medium">
															{item.name} Severity
														</span>
													</div>
													<span className="text-gray-500">
														{item.total} tests ({percentage}%)
													</span>
												</div>
												<div className="flex gap-1 h-10 bg-gray-800 rounded-lg overflow-hidden">
													{item.passed > 0 && (
														<div
															className="bg-green-500 flex items-center justify-center text-sm font-semibold text-white transition-all"
															style={{
																width: `${(item.passed / item.total) * 100}%`,
															}}
														>
															{item.passed}
														</div>
													)}
													{item.failed > 0 && (
														<div
															className="bg-red-500 flex items-center justify-center text-sm font-semibold text-white transition-all"
															style={{
																width: `${(item.failed / item.total) * 100}%`,
															}}
														>
															{item.failed}
														</div>
													)}
												</div>
												<div className="flex gap-4 text-xs text-gray-400">
													<span className="flex items-center gap-1.5">
														<span className="w-3 h-3 bg-green-500 rounded"></span>
														{item.passed} defended
													</span>
													{item.failed > 0 && (
														<span className="flex items-center gap-1.5">
															<span className="w-3 h-3 bg-red-500 rounded"></span>
															{item.failed} vulnerable
														</span>
													)}
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<div className="flex items-center justify-center h-[300px] text-gray-500">
									No data available
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Failed Tests Detail */}
				<Card className="border-border/40">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<XCircle className="h-5 w-5 text-red-500" />
							Failed Tests ({failedTests.length})
						</CardTitle>
						<CardDescription>
							Detailed information about security vulnerabilities
						</CardDescription>
					</CardHeader>
					<CardContent>
						{failedTests.length === 0 ? (
							<div className="text-center py-12">
								<CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
								<h3 className="text-lg font-semibold text-green-500 mb-2">
									All Tests Passed!
								</h3>
								<p className="text-muted-foreground">
									No vulnerabilities detected
								</p>
							</div>
						) : (
							<div className="space-y-4">
								{failedTests.map((test, index) => (
									<Card key={index} className="border-red-500/20 bg-red-500/5">
										<CardHeader className="pb-3">
											<div className="flex items-start justify-between gap-4">
												<div className="flex-1">
													<CardTitle className="text-base mb-2">
														{test.testName}
													</CardTitle>
													<div className="flex items-center gap-2 flex-wrap">
														<Badge
															variant={
																test.severity === "critical" ||
																test.severity === "high"
																	? "destructive"
																	: "secondary"
															}
															className="uppercase text-xs"
														>
															{test.severity}
														</Badge>
														<Badge
															variant="outline"
															className="uppercase text-xs"
														>
															{test.category.replace("_", " ")}
														</Badge>
														<span className="text-xs text-muted-foreground">
															{test.duration}ms
														</span>
													</div>
												</div>
												<AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
											</div>
										</CardHeader>
										<CardContent className="space-y-3">
											{test.vulnerabilityDetected && (
												<div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
													<AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
													<div className="flex-1">
														<p className="text-sm font-medium text-red-500">
															Vulnerability Detected
														</p>
														<p className="text-sm text-muted-foreground mt-1">
															{test.vulnerabilityDetected}
														</p>
													</div>
												</div>
											)}

											<div className="p-3 bg-muted/50 rounded-lg border border-border/40">
												<p className="text-sm font-medium mb-1.5">
													Agent Response:
												</p>
												<p className="text-sm text-muted-foreground leading-relaxed">
													{test.agentOutput.substring(0, 300)}
													{test.agentOutput.length > 300 && "..."}
												</p>
											</div>

											{test.error && (
												<div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
													<p className="text-sm font-medium text-red-500 mb-1.5">
														Error:
													</p>
													<p className="text-sm text-muted-foreground">
														{test.error}
													</p>
												</div>
											)}
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Footer */}
				<div className="mt-8 text-center text-sm text-muted-foreground">
					<p>ChaosAgent • AI Agent Security Testing Platform</p>
				</div>
			</div>
		</div>
	);
}
