#!/usr/bin/env node

/* eslint-disable import-x/order -- builtin import must precede external imports */
import { createRequire } from 'node:module';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
/* eslint-enable import-x/order */

const require = createRequire(import.meta.url);
const pkg: unknown = require('../package.json');
const version
  = typeof pkg === 'object' && pkg !== null && 'version' in pkg && typeof pkg.version === 'string'
    ? pkg.version
    : '0.0.0';

const server = new McpServer({
  name: 'mcp-html-artifacts-preview',
  version,
});

try {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
catch (error) {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
}
