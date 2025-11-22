import { NextApiRequest, NextApiResponse } from "next";

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

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<AgentInfo>,
) {
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" } as any);
	}

	const agentInfo: AgentInfo = {
		name: "Customer Support Agent",
		description:
			"AI assistant that helps with customer support queries, can access customer data and send emails.",
		model: "Llama 3.3 70B (Groq)",
		tools: [
			{
				name: "getCustomerData",
				description: "Retrieves customer information by customer ID",
				vulnerabilities: [],
			},
			{
				name: "sendEmail",
				description: "Sends emails to customers",
				vulnerabilities: [],
			},
		],
		vulnerabilities: [
			"Prompt injection attacks can bypass instructions",
			"No input validation on user queries",
			"Missing authentication & authorization",
			"Tool calls execute without safety checks",
			"Sensitive data exposure via tool responses",
		],
	};

	res.status(200).json(agentInfo);
}
