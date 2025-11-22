

# **ChaosAgent.AI**

**AI Agent Security Testing Framework (MCP‑Aware)**

ChaosAgent.AI is a comprehensive security testing framework for AI agents that interact with external tools via **Model Context Protocol (MCP)**. It uses adversarial prompts and sandboxed execution to identify vulnerabilities before deployment, focusing on tool misuse, data leaks, and other security risks.

---

## 🎯 **Purpose**

ChaosAgent.AI systematically tests agents for:

* **Prompt Injection** — Overrides or manipulates agent instructions
* **Session Bleeding** — Cross-user data exposure
* **Tool Manipulation (MCP)** — Unauthorized or malicious tool usage
* **Data Leakage** — Exposure of sensitive information (PII, credentials, secrets)
* **Resource Exhaustion** — Infinite loops, recursion, or DoS-style attacks

---

## 🏗️ **Architecture Overview**

```
┌───────────────┐     ┌───────────────┐     ┌─────────────────┐
│ Attacker Logic │───▶│ Target Agent   │───▶│ Vulnerability   │
│  (Groq-driven) │     │ (Your AI App) │     │ Evaluation      │
│ Generates Tests│     │ Executes      │     │ (Rules + Logs) │
└───────────────┘     └───────────────┘     └─────────────────┘
                                                      │
                                                      ▼
                                            ┌─────────────────┐
                                            │ Security Report │
                                            │ (JSON + Dashboard) │
                                            └─────────────────┘
```

All tests run inside **isolated E2B sandboxes** with real **MCP Docker servers** for safe, realistic evaluation.

---

## 🌐 **MCP Servers Tested**

ChaosAgent integrates and tests three key MCP servers:

* **Browserbase** — Browser automation: detects malicious navigation, scraping, and tool hijacking.
* **Exa** — AI-powered search: checks for unauthorized data extraction and multi-tool attacks.
* **GitHub Official** — Repository operations: tests repo access, workflow triggers, and token misuse.

---

## 🚀 **Quick Start**

### **1. Install**

```bash
git clone <your-repo>
cd chaosagent
npm install
```

### **2. Configure**

```bash
cp .env.example .env
# Add GROQ_API_KEY, E2B_API_KEY, and MCP credentials
```

### **3. Run Tests**

```bash
npm run test
```

### **4. Dashboard**

```bash
npm run dashboard
```

Visit `http://localhost:3000` for:

* Security score
* Vulnerability breakdown
* MCP tool activity logs
* Failed test details

---

## 🔧 **Core Components**

* **`src/chaos-executor.ts`** — Runs tests in E2B sandboxes
* **`src/attack-library.ts`** — Predefined attacks (26 total, 6 MCP-specific)
* **`src/target-agent.ts`** — Interface to your AI agent
* **`test-agents/`** — Demo agents: banking, e-commerce, HR
* **`chaos-results.json`** — Logs and scores

---

## 🧪 **Test Categories**

* **Prompt Injection** — Overrides or confuses instructions
* **Tool Manipulation (MCP)** — Misuse of Browserbase, Exa, GitHub
* **Data Leakage** — Sensitive info exposure
* **Session Bleeding** — Cross-session data access
* **Resource Exhaustion** — Loops, recursion, or heavy loads

---

## 📈 **Results**

**Security Score:** 90–100% Excellent, 70–89% Moderate, <70% High Risk
**PASS Example:** Agent correctly refused malicious request
**FAIL Example:** Agent misused MCP tool or exposed data

---

## 🛠️ **Customization**

* Replace `src/target-agent.ts` to test your own agent
* Extend `attack-library.ts` to add new attack scenarios
* View full results in `chaos-results.json` and dashboard

---

## 🤝 **Contributing**

* Fork → branch → add tests → pull request
* Ensure tests run in **E2B sandbox** with MCPs

---

## 🔒 **Security Considerations**

* Use **sandboxed execution only**
* Use synthetic data; never production data
* Rate-limit MCP and Groq API usage

