import { Template, defaultBuildLogger } from 'e2b'
import { template } from './template'
import * as dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config()

async function main() {
  if (!process.env.E2B_API_KEY) {
    throw new Error('E2B_API_KEY not found in environment variables')
  }

  await Template.build(template, {
    alias: 'chaosagent-mcp-dev',
    onBuildLogs: defaultBuildLogger(),
    apiKey: process.env.E2B_API_KEY,
  });
}

main().catch(console.error);