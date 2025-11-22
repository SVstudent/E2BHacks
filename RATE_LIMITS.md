# Rate Limit Configuration

## Groq API Limits

**Free Tier:**
- **30 requests per minute (RPM)**
- 14,400 requests per day
- Model: `llama-3.3-70b-versatile`

## How Tests Use API Calls

Each test case makes **2-3 Groq API calls**:
1. Tool analysis call (determines which tools to use)
2. Response generation call (creates the agent response)
3. Vulnerability evaluation call (LLM-based evaluation)

**Total:** ~3 API calls per test = **10 tests per minute maximum**

## Current Configuration

### Default Settings (chaos-executor.ts)
```typescript
delayBetweenTests: 3000  // 3 seconds between tests
concurrency: 1            // Run 1 test at a time
```

**Calculation:**
- 3 seconds per test × 3 API calls = 9 seconds of work
- 3 seconds delay = 12 seconds total per test
- 60 seconds / 12 seconds = **5 tests per minute**
- 5 tests × 3 API calls = **15 API calls per minute** (well under 30 RPM limit)

## Retry Logic (groq-client.ts)

When rate limits are hit, the system automatically retries with exponential backoff:
- **Attempt 1:** Wait 1 second
- **Attempt 2:** Wait 2 seconds
- **Attempt 3:** Wait 4 seconds
- **Server override:** If Groq sends `retry-after` header, use that instead

Example:
```
⚠️  Rate limit hit, retrying in 204s (attempt 1/3)
```

This means Groq told us to wait 204 seconds (3.4 minutes) before retrying.

## Adjusting Rate Limits

### For Faster Testing (Paid Tier)
If you upgrade to Groq's paid tier with higher limits:

```typescript
// src/test-full-suite.ts
const executor = new ChaosExecutor({
  delayBetweenTests: 1000,  // 1 second delay
  // ... other config
});

// Or remove delay entirely
const executor = new ChaosExecutor({
  delayBetweenTests: 0,  // No delay
  // ... other config
});
```

### For Slower Testing (Stay Safe on Free Tier)
If you're still hitting limits:

```typescript
const executor = new ChaosExecutor({
  delayBetweenTests: 5000,  // 5 second delay
  // ... other config
});
```

### For Parallel Testing (Paid Tier Only)
```typescript
const results = await executor.runChaosSuite(scenarios, 3); // 3 tests in parallel
```

**Warning:** Only use parallel testing with paid Groq tier!

## Monitoring Usage

Check your Groq usage at:
https://console.groq.com/settings/limits

## Estimated Test Suite Runtime

With 17 test scenarios:
- **Per test:** ~12 seconds (9s work + 3s delay)
- **Full suite:** ~3.4 minutes (17 × 12 seconds)

Add time for:
- E2B sandbox creation/cleanup: ~1-2 seconds per test
- Network latency: ~0.5-1 second per API call
- **Total estimated:** ~5-6 minutes for full suite
