import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Shield,
	Play,
	Square,
	AlertTriangle,
	CheckCircle,
	Cpu,
	Wrench,
	Terminal,
	ArrowLeft,
	Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

interface AgentInfo {
	name: string;
	description: string;
	model: string;
	tools: {
		name: string;
		description: string;
		vulnerabilities: string[];
	}[];
	vulnerabilities: string[];
}

interface LogEntry {
	type: "log" | "error" | "complete";
	message: string;
	timestamp: Date;
}

export default function TestRunner() {
	const router = useRouter();
	const { agent } = router.query;

	const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
	const [isRunning, setIsRunning] = useState(false);
	const [logs, setLogs] = useState<LogEntry[]>([]);
	const [exitCode, setExitCode] = useState<number | null>(null);
	const logsEndRef = useRef<HTMLDivElement>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		// Load agent info
		fetch("/api/agent-info")
			.then((res) => res.json())
			.then((data) => setAgentInfo(data))
			.catch((err) => console.error("Failed to load agent info:", err));
	}, []);

	useEffect(() => {
		// Auto-scroll logs to bottom
		logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [logs]);

	const startTests = async () => {
		setIsRunning(true);
		setLogs([]);
		setExitCode(null);

		// Create abort controller for cancellation
		abortControllerRef.current = new AbortController();

		try {
			const response = await fetch("/api/run-tests", {
				method: "POST",
				signal: abortControllerRef.current.signal,
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (reader) {
				let buffer = "";

				while (true) {
					const { done, value } = await reader.read();

					if (done) {
						console.log("Stream complete");
						break;
					}

					// Decode the chunk and add to buffer
					buffer += decoder.decode(value, { stream: true });

					// Process complete lines
					const lines = buffer.split("\n");
					buffer = lines.pop() || ""; // Keep incomplete line in buffer

					for (const line of lines) {
						if (line.startsWith("data: ")) {
							try {
								const data = JSON.parse(line.slice(6));
								const logEntry: LogEntry = {
									...data,
									timestamp: new Date(),
								};

								console.log("Log entry:", logEntry);
								setLogs((prev) => [...prev, logEntry]);

								if (data.type === "complete") {
									setIsRunning(false);
									setExitCode(data.code);
								}
							} catch (e) {
								console.error("Failed to parse SSE data:", e, line);
							}
						}
					}
				}
			}
		} catch (error: any) {
			if (error.name === "AbortError") {
				console.log("Test execution cancelled");
				setLogs((prev) => [
					...prev,
					{
						type: "error",
						message: "Tests stopped by user",
						timestamp: new Date(),
					},
				]);
			} else {
				console.error("Test execution error:", error);
				setLogs((prev) => [
					...prev,
					{
						type: "error",
						message: `Failed to run tests: ${error.message}`,
						timestamp: new Date(),
					},
				]);
			}
			setIsRunning(false);
		}
	};

	const stopTests = () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}
		setIsRunning(false);
	};

	return (
		<div className="min-h-screen bg-background dark">
			<Head>
				<title>Test Runner - ChaosAgent</title>
			</Head>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<Link href="/agents">
						<Button
							variant="ghost"
							size="sm"
							className="mb-4 text-gray-300 hover:text-white"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Agents
						</Button>
					</Link>
					<div className="mb-2">
						<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
							Test Runner
						</h1>
						<p className="text-sm text-gray-400 mt-1">
							Run security tests against AI agents
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - Agent Info */}
					<div className="lg:col-span-1 space-y-4">
						<Card className="border-border/40">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<Cpu className="h-5 w-5" />
									Target Agent
								</CardTitle>
								<CardDescription>Agent under test</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{agentInfo ? (
									<>
										<div>
											<h3 className="font-semibold mb-1">{agentInfo.name}</h3>
											<p className="text-sm text-muted-foreground">
												{agentInfo.description}
											</p>
										</div>

										<div>
											<div className="flex items-center gap-2 mb-2">
												<Badge variant="outline">{agentInfo.model}</Badge>
											</div>
										</div>

										<div>
											<h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
												<Wrench className="h-4 w-4" />
												Available Tools
											</h4>
											<div className="space-y-2">
												{agentInfo.tools.map((tool, idx) => (
													<div
														key={idx}
														className="p-2 bg-muted/50 rounded-lg text-sm"
													>
														<p className="font-medium">{tool.name}</p>
														<p className="text-xs text-muted-foreground">
															{tool.description}
														</p>
													</div>
												))}
											</div>
										</div>

										<div>
											<h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
												<AlertTriangle className="h-4 w-4 text-red-500" />
												Known Vulnerabilities
											</h4>
											<div className="space-y-1">
												{agentInfo.vulnerabilities.map((vuln, idx) => (
													<div
														key={idx}
														className="text-xs text-muted-foreground flex items-start gap-2"
													>
														<span className="text-red-500 mt-0.5">•</span>
														<span>{vuln}</span>
													</div>
												))}
											</div>
										</div>
									</>
								) : (
									<div className="text-sm text-muted-foreground">
										Loading agent info...
									</div>
								)}
							</CardContent>
						</Card>

						{/* Test Controls */}
						<Card className="border-border/40">
							<CardHeader>
								<CardTitle className="text-lg">Test Controls</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<Button
									onClick={startTests}
									disabled={isRunning}
									className="w-full"
									size="lg"
								>
									{isRunning ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Running Tests...
										</>
									) : (
										<>
											<Play className="h-4 w-4 mr-2" />
											Run Full Test Suite
										</>
									)}
								</Button>

								{isRunning && (
									<Button
										onClick={stopTests}
										variant="destructive"
										className="w-full"
									>
										<Square className="h-4 w-4 mr-2" />
										Stop Tests
									</Button>
								)}

								{exitCode !== null && (
									<div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
										{exitCode === 0 ? (
											<>
												<CheckCircle className="h-4 w-4 text-green-500" />
												<span className="text-sm">
													Tests completed successfully
												</span>
											</>
										) : (
											<>
												<AlertTriangle className="h-4 w-4 text-red-500" />
												<span className="text-sm">
													Tests failed (code {exitCode})
												</span>
											</>
										)}
									</div>
								)}

								{exitCode === 0 && (
									<Link href="/">
										<Button variant="outline" className="w-full">
											View Results Dashboard
										</Button>
									</Link>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Right Column - Logs */}
					<div className="lg:col-span-2">
						<Card className="border-border/40">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<Terminal className="h-5 w-5" />
									Test Logs
									{isRunning && (
										<Badge variant="secondary" className="ml-2">
											<Loader2 className="h-3 w-3 mr-1 animate-spin" />
											Running
										</Badge>
									)}
								</CardTitle>
								<CardDescription>
									Real-time output from test execution
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="bg-black/90 rounded-lg p-4 h-[600px] overflow-y-auto font-mono text-sm">
									{logs.length === 0 ? (
										<div className="text-gray-500">
											No logs yet. Click "Run Full Test Suite" to start testing.
										</div>
									) : (
										<div className="space-y-0.5">
											{logs.map((log, idx) => (
												<div
													key={idx}
													className={
														log.type === "error"
															? "text-red-400"
															: log.type === "complete"
																? "text-green-400 font-semibold"
																: "text-gray-300"
													}
												>
													<span className="text-gray-600 text-xs mr-2">
														{log.timestamp.toLocaleTimeString()}
													</span>
													{log.message}
												</div>
											))}
											<div ref={logsEndRef} />
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
