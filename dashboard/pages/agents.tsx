import { useState, useEffect } from "react";
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
	Upload,
	AlertTriangle,
	Cpu,
	Wrench,
	ArrowLeft,
	Play,
	CheckCircle,
	FileCode,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

interface AgentInfo {
	id: string;
	name: string;
	description: string;
	model: string;
	status: "active" | "testing" | "idle";
	tools: {
		name: string;
		description: string;
		vulnerabilities: string[];
	}[];
	vulnerabilities: string[];
	lastTested?: string;
	securityScore?: number;
}

export default function Agents() {
	const router = useRouter();
	const [agents, setAgents] = useState<AgentInfo[]>([]);
	const [showUpload, setShowUpload] = useState(false);

	useEffect(() => {
		// Load agents - for now we have one demo agent
		fetch("/api/agent-info")
			.then((res) => res.json())
			.then((data) => {
				const agent: AgentInfo = {
					id: "customer-support-agent",
					...data,
					status: "idle",
				};
				setAgents([agent]);
			})
			.catch((err) => console.error("Failed to load agents:", err));
	}, []);

	const handleRunTests = (agentId: string) => {
		router.push(`/test-runner?agent=${agentId}`);
	};

	return (
		<div className="min-h-screen bg-background dark">
			<Head>
				<title>ChaosAgent</title>
			</Head>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<Link href="/">
						<Button
							variant="ghost"
							size="sm"
							className="mb-4 text-gray-300 hover:text-white"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Dashboard
						</Button>
					</Link>
					<div className="flex items-center justify-between mb-2">
						<div>
							<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
								AI Agents
							</h1>
							<p className="text-sm text-gray-400 mt-1">
								Manage and test your AI agents
							</p>
						</div>
						<Button onClick={() => setShowUpload(true)} className="gap-2">
							<Upload className="h-4 w-4" />
							Upload Agent
						</Button>
					</div>
				</div>

				{/* Upload Modal Placeholder */}
				{showUpload && (
					<Card className="mb-6 border-blue-500/50 bg-blue-500/5">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Upload className="h-5 w-5" />
								Upload Your AI Agent
							</CardTitle>
							<CardDescription>
								Upload your agent code or configuration to run security tests
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
								<FileCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
								<p className="text-sm text-muted-foreground mb-4">
									Drag and drop your agent files here, or click to browse
								</p>
								<Button variant="outline">Browse Files</Button>
							</div>
							<div className="flex justify-end gap-2">
								<Button variant="outline" onClick={() => setShowUpload(false)}>
									Cancel
								</Button>
								<Button disabled>Upload & Test</Button>
							</div>
							<div className="text-xs text-muted-foreground">
								<p className="font-semibold mb-1">Supported formats:</p>
								<ul className="list-disc list-inside space-y-1 ml-2">
									<li>Python files (.py) with agent implementations</li>
									<li>JavaScript/TypeScript files (.js, .ts)</li>
									<li>Configuration files (JSON, YAML)</li>
								</ul>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Agents Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{agents.map((agent) => (
						<Card
							key={agent.id}
							className="border-border/40 hover:shadow-lg transition-all"
						>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<CardTitle className="text-xl">{agent.name}</CardTitle>
											<Badge
												variant={
													agent.status === "active"
														? "default"
														: agent.status === "testing"
															? "secondary"
															: "outline"
												}
											>
												{agent.status}
											</Badge>
										</div>
										<CardDescription>{agent.description}</CardDescription>
									</div>
									<Cpu className="h-8 w-8 text-blue-500" />
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Model Info */}
								<div className="p-3 bg-muted/50 rounded-lg">
									<p className="text-sm font-medium">Model</p>
									<p className="text-xs text-muted-foreground">{agent.model}</p>
								</div>

								{/* Tools */}
								<div>
									<h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
										<Wrench className="h-4 w-4" />
										Available Tools ({agent.tools.length})
									</h4>
									<div className="space-y-2">
										{agent.tools.map((tool, idx) => (
											<div
												key={idx}
												className="p-2 bg-muted/50 rounded-lg text-sm"
											>
												<p className="font-medium mb-1">{tool.name}</p>
												<p className="text-xs text-muted-foreground">
													{tool.description}
												</p>
											</div>
										))}
									</div>
								</div>

								{/* Actions */}
								<div className="flex gap-2 pt-2">
									<Button
										className="flex-1"
										onClick={() => handleRunTests(agent.id)}
									>
										<Play className="h-4 w-4 mr-2" />
										Run Security Tests
									</Button>
									<Link href="/" className="flex-1">
										<Button variant="outline" className="w-full">
											View Results
										</Button>
									</Link>
								</div>
							</CardContent>
						</Card>
					))}

					{/* Empty State / Add More */}
					<Card className="border-dashed border-2 border-border/40 hover:border-border transition-all flex items-center justify-center min-h-[400px]">
						<CardContent className="text-center py-12">
							<Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
							<h3 className="text-lg font-semibold mb-2">Add Another Agent</h3>
							<p className="text-sm text-muted-foreground mb-4">
								Upload your AI agent to test its security
							</p>
							<Button onClick={() => setShowUpload(true)}>
								<Upload className="h-4 w-4 mr-2" />
								Upload Agent
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
