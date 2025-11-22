# ChaosAgent to ChaosAgent Migration Summary

This directory contains the cleaned up, essential files from the original chaosagent project.

## Files Moved

### Core Configuration
- package.json (updated with new project name 'chaosagent')
- tsconfig.json
- .gitignore
- README.md
- test-scenarios.json

### Core Source Files (src/)
- attacker-agent.ts - Main attacker agent functionality
- target-agent.ts - Target agent (vulnerable agent for testing)
- test-agent.ts - Basic agent testing utilities
- chaos-executor.ts - Core chaos testing execution engine
- config.ts - Configuration management
- instrumentation.ts - Agent tracing and monitoring
- index.ts - Main entry point
- test-full-suite.ts - Full demo/testing suite
- test-scenarios.ts - Test scenario management
- test-attacker.ts - Attacker testing functionality

### Dashboard UI
- dashboard/ - Complete Next.js dashboard application

## What Was Left Behind
Test and utility files that aren't essential for the core functionality:
- Various individual test files (test-daytona.ts, test-executor.ts, etc.)
- Debug utilities  
- Sandbox-specific tests
- Build artifacts (dist/, node_modules/)

## Next Steps
1. Run npm install to install dependencies
2. Set up environment variables as needed
3. Run npm run dev to start the main application
4. Run npm run dashboard to start the dashboard UI
