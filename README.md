# **ChaosAgent.AI**

**AI Agent Security Testing Framework (MCP‑Aware)**

ChaosAgent.AI is a production-ready framework for testing AI agents that integrate with external tools via **Model Context Protocol (MCP)**. Using adversarial prompts and sandboxed execution, it identifies vulnerabilities such as tool misuse, data leakage, and session bleeding **before deployment**. ChaosAgent.AI is the first framework designed specifically for **MCP tool abuse testing**, running real API calls safely in **E2B sandboxes** with **Docker-based MCP servers**.

---

## 🎯 **Purpose**

ChaosAgent.AI tests AI agents for critical security issues:

* **Prompt Injection** — Overrides or confuses agent instructions
* **Session Bleeding** — Detects cross-user data exposure
* **Tool Manipulation (MCP)** — Monitors and prevents malicious use of external tools
* **Data Leakage** — Identifies exposure of PII, credentials, or internal data
* **Resource Exhaustion** — Checks for infinite loops, recursion, and DoS attacks

By simulating real-world attack scenarios, it ensures that agents deployed with MCPs like Browserbase, Exa, and GitHub behave safely.

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

* **Groq** drives the attacker agent for fast, scalable inference (supports 30 RPM free-tier usage).
* **E2B Sandboxes** provide isolated execution for all test agents, preventing accidental system damage.
* **Docker MCP Servers** enable safe, real-world testing with external tools.

---

## 🌐 **Integrated MCP Servers**

ChaosAgent.AI supports:

* **Browserbase** — Simulates browser automation; detects malicious navigation, tool hijacking, and scraping.
* **Exa** — AI search engine; monitors unauthorized data retrieval, multi-tool attacks, and sensitive document access.
* **GitHub Official** — Repository management; tests repo access, workflow triggers, and token misuse.

All MCP servers run in **Docker containers** within the E2B sandbox, ensuring **real API interactions** without compromising security.

---

## 🧪 **Testing Pipeline**

1. **Attack Generation** — 26 predefined adversarial scenarios including 6 MCP-specific attacks.
2. **Sandbox Execution** — Each scenario runs inside an isolated E2B environment with Docker MCP servers.
3. **Vulnerability Detection** — Rule-based evaluation captures known attack patterns; Groq evaluates nuanced responses.
4. **Context-Aware Logging** — Captures detailed MCP tool activity: calls, URLs accessed, search results, and any suspicious operations.

---

## 🚀 **Quick Start**

```bash
git clone <repo>
cd chaosagent
npm install
cp .env.example .env
# Configure GROQ_API_KEY, E2B_API_KEY, and MCP credentials
npm run test         # Run full test suite
npm run dashboard    # Launch visual dashboard at http://localhost:3000
```

---

## 📊 **Dashboard Metrics**

* **Security Score** — Overall agent robustness
* **Vulnerability Breakdown** — By category: prompt injection, MCP tool misuse, data leakage, etc.
* **MCP Activity Logs** — Browserbase, Exa, and GitHub tool usage tracked per test
* **Failed Test Details** — Includes intentional failures to prove detection accuracy

---

## 🔧 **Core Components**

* `src/chaos-executor.ts` — Main test engine
* `src/attack-library.ts` — 26 attack scenarios (including MCP-specific attacks)
* `src/target-agent.ts` — Interface for your AI agent
* `test-agents/` — Demo agents: banking, e-commerce, HR
* `chaos-results.json` — Test logs and security scores

---

## 🔒 **Security & Customization**

* All tests run **sandboxed** in E2B for safety.
* Synthetic data only — no real PII.
* Rate-limits prevent Groq and MCP API overuse.
* Extend by adding new scenarios to `attack-library.ts` or testing your own agent in `target-agent.ts`.

---

## 🤝 **Contribution & Usage**

* Fork → Branch → Add tests → Pull request
* Use in CI/CD for **continuous security audits** of AI agents
* Ideal for MCP-heavy agents in enterprise, compliance, and research environments


