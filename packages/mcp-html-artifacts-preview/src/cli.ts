#!/usr/bin/env node

import { exec } from 'node:child_process';
import { createRequire } from 'node:module';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { startHttpServer } from './http-server.js';
import { PageStore } from './page-store.js';
// eslint-disable-next-line import-x/order -- false positive: no empty line exists between import groups
import { registerTools } from './tools.js';

const require = createRequire(import.meta.url);
const pkg: unknown = require('../package.json');
const version
  = typeof pkg === 'object' && pkg !== null && 'version' in pkg && typeof pkg.version === 'string'
    ? pkg.version
    : '0.0.0';

const noOpen = process.argv.includes('--no-open');

function parseIntArg(flag: string): number | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1 || index + 1 >= process.argv.length) {
    return undefined;
  }
  const value = Number(process.argv[index + 1]);
  if (!Number.isFinite(value) || value <= 0 || !Number.isInteger(value)) {
    console.error(`Invalid value for ${flag}: ${process.argv[index + 1]}`);
    process.exit(1);
  }
  return value;
}

const maxPages = parseIntArg('--max-pages');
const ttlSeconds = parseIntArg('--ttl');

const pageStore = new PageStore({
  maxPages,
  ttl: ttlSeconds !== undefined ? ttlSeconds * 1000 : undefined,
});

const httpServer = await startHttpServer({ pageStore });
console.error(`HTTP server listening at ${httpServer.url}`);

if (!noOpen) {
  let opened = false;
  pageStore.onChange((event) => {
    if (event.type === 'create' && !opened) {
      opened = true;
      const url = httpServer.url;
      const command = process.platform === 'win32'
        ? `start "" "${url}"`
        : process.platform === 'darwin'
          ? `open "${url}"`
          : `xdg-open "${url}"`;
      exec(command, (err) => {
        if (err) {
          console.error(`Failed to open browser: ${err.message}`);
        }
      });
    }
  });
}

const server = new McpServer({
  name: 'mcp-html-artifacts-preview',
  version,
});

registerTools({
  server,
  pageStore,
  getBaseUrl: () => httpServer.url,
});

async function cleanup(): Promise<void> {
  pageStore.dispose();
  await httpServer.close();
}

process.on('SIGINT', () => {
  void cleanup().then(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  void cleanup().then(() => {
    process.exit(0);
  });
});

try {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // server.connect() resolves immediately after starting the transport.
  // Wait for the MCP connection to actually close before cleaning up.
  await new Promise<void>((resolve) => {
    server.server.onclose = () => resolve();

    // StdioServerTransport does not detect stdin closing on its own,
    // so trigger server close when the MCP client disconnects.
    process.stdin.on('close', () => {
      void server.close();
    });
  });
}
catch (error) {
  console.error('Failed to start MCP server:', error);
  await cleanup();
  process.exit(1);
}

await cleanup();
