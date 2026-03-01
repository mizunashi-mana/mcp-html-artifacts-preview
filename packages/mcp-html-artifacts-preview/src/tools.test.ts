import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PageStore } from './page-store.js';
import { registerTools } from './tools.js';

function parseText(result: { content: unknown[] }): unknown {
  const item = result.content[0];
  if (typeof item === 'object' && item !== null && 'text' in item && typeof item.text === 'string') {
    return JSON.parse(item.text) as unknown;
  }
  throw new Error('Unexpected content format');
}

function getText(result: { content: unknown[] }): string {
  const item = result.content[0];
  if (typeof item === 'object' && item !== null && 'text' in item && typeof item.text === 'string') {
    return item.text;
  }
  throw new Error('Unexpected content format');
}

describe('MCP tools integration', () => {
  let client: Client;
  let mcpServer: McpServer;
  let pageStore: PageStore;

  beforeAll(async () => {
    pageStore = new PageStore();
    mcpServer = new McpServer({ name: 'test-server', version: '0.0.0' });
    registerTools({
      server: mcpServer,
      pageStore,
      getBaseUrl: () => 'http://localhost:3000',
    });

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await mcpServer.connect(serverTransport);
    client = new Client({ name: 'test-client', version: '0.0.0' });
    await client.connect(clientTransport);
  });

  afterAll(async () => {
    await client.close();
    await mcpServer.close();
  });

  describe('create_page', () => {
    it('should create a page and return its info', async () => {
      const result = await client.callTool({
        name: 'create_page',
        arguments: { title: 'Test Page', html: '<h1>Hello</h1>' },
      });

      const data = parseText(result as { content: unknown[] }) as {
        id: string;
        name: string | undefined;
        title: string;
        url: string;
        createdAt: string;
      };
      expect(data.title).toBe('Test Page');
      expect(data.name).toBeUndefined();
      expect(data.url).toMatch(/^http:\/\/localhost:3000\/pages\//);
      expect(data.id).toBeTruthy();
      expect(data.createdAt).toBeTruthy();
    });

    it('should create a page with a name', async () => {
      const result = await client.callTool({
        name: 'create_page',
        arguments: { name: 'my-artifact', title: 'Named Page', html: '<p>named</p>' },
      });

      const data = parseText(result as { content: unknown[] }) as {
        id: string;
        name: string;
        title: string;
      };
      expect(data.name).toBe('my-artifact');
      expect(data.title).toBe('Named Page');
    });
  });

  describe('get_page', () => {
    it('should return an existing page', async () => {
      const createResult = await client.callTool({
        name: 'create_page',
        arguments: { title: 'Get Test', html: '<p>content</p>' },
      });
      const created = parseText(createResult as { content: unknown[] }) as { id: string };

      const result = await client.callTool({
        name: 'get_page',
        arguments: { id: created.id },
      });

      const data = parseText(result as { content: unknown[] }) as {
        id: string;
        title: string;
        html: string;
      };
      expect(data.id).toBe(created.id);
      expect(data.title).toBe('Get Test');
      expect(data.html).toBe('<p>content</p>');
    });

    it('should return an error for non-existent page', async () => {
      const result = await client.callTool({
        name: 'get_page',
        arguments: { id: 'non-existent' },
      });

      expect(result.isError).toBe(true);
      expect(getText(result as { content: unknown[] })).toContain('Page not found');
    });
  });

  describe('get_pages', () => {
    it('should return all pages', async () => {
      const store = new PageStore();
      const mcpServer = new McpServer({ name: 'test-list', version: '0.0.0' });
      registerTools({
        server: mcpServer,
        pageStore: store,
        getBaseUrl: () => 'http://localhost:3000',
      });

      const [ct, st] = InMemoryTransport.createLinkedPair();
      await mcpServer.connect(st);
      const c = new Client({ name: 'test-list-client', version: '0.0.0' });
      await c.connect(ct);

      await c.callTool({ name: 'create_page', arguments: { title: 'A', html: '<p>a</p>' } });
      await c.callTool({ name: 'create_page', arguments: { title: 'B', html: '<p>b</p>' } });

      const result = await c.callTool({ name: 'get_pages', arguments: {} });
      const data = parseText(result as { content: unknown[] }) as Array<{ title: string }>;

      expect(data).toHaveLength(2);
      expect(data.map(p => p.title).sort()).toEqual(['A', 'B']);

      await c.close();
      await mcpServer.close();
    });
  });

  describe('update_page', () => {
    it('should update title and html', async () => {
      const createResult = await client.callTool({
        name: 'create_page',
        arguments: { title: 'Before', html: '<p>old</p>' },
      });
      const created = parseText(createResult as { content: unknown[] }) as { id: string };

      const result = await client.callTool({
        name: 'update_page',
        arguments: { id: created.id, title: 'After', html: '<p>new</p>' },
      });

      const data = parseText(result as { content: unknown[] }) as {
        id: string;
        title: string;
        updatedAt: string;
      };
      expect(data.title).toBe('After');
      expect(data.updatedAt).toBeTruthy();

      // Verify via get_page
      const getResult = await client.callTool({
        name: 'get_page',
        arguments: { id: created.id },
      });
      const page = parseText(getResult as { content: unknown[] }) as { html: string };
      expect(page.html).toBe('<p>new</p>');
    });

    it('should update name only', async () => {
      const createResult = await client.callTool({
        name: 'create_page',
        arguments: { title: 'Title', html: '<p>content</p>' },
      });
      const created = parseText(createResult as { content: unknown[] }) as { id: string };

      const result = await client.callTool({
        name: 'update_page',
        arguments: { id: created.id, name: 'new-name' },
      });

      const data = parseText(result as { content: unknown[] }) as { name: string; title: string };
      expect(data.name).toBe('new-name');
      expect(data.title).toBe('Title');
    });

    it('should return error when neither name, title, nor html provided', async () => {
      const createResult = await client.callTool({
        name: 'create_page',
        arguments: { title: 'Test', html: '' },
      });
      const created = parseText(createResult as { content: unknown[] }) as { id: string };

      const result = await client.callTool({
        name: 'update_page',
        arguments: { id: created.id },
      });

      expect(result.isError).toBe(true);
      expect(getText(result as { content: unknown[] })).toContain('At least one of name, title, or html must be provided');
    });

    it('should return error for non-existent page', async () => {
      const result = await client.callTool({
        name: 'update_page',
        arguments: { id: 'non-existent', title: 'New' },
      });

      expect(result.isError).toBe(true);
      expect(getText(result as { content: unknown[] })).toContain('Page not found');
    });
  });

  describe('destroy_page', () => {
    it('should delete a page', async () => {
      const createResult = await client.callTool({
        name: 'create_page',
        arguments: { title: 'To Delete', html: '<p>bye</p>' },
      });
      const created = parseText(createResult as { content: unknown[] }) as { id: string };

      const result = await client.callTool({
        name: 'destroy_page',
        arguments: { id: created.id },
      });

      const data = parseText(result as { content: unknown[] }) as { id: string; deleted: boolean };
      expect(data.deleted).toBe(true);

      // Verify page is gone
      const getResult = await client.callTool({
        name: 'get_page',
        arguments: { id: created.id },
      });
      expect(getResult.isError).toBe(true);
    });

    it('should return error for non-existent page', async () => {
      const result = await client.callTool({
        name: 'destroy_page',
        arguments: { id: 'non-existent' },
      });

      expect(result.isError).toBe(true);
      expect(getText(result as { content: unknown[] })).toContain('Page not found');
    });
  });

  describe('add_scripts', () => {
    it('should add scripts to a page', async () => {
      const createResult = await client.callTool({
        name: 'create_page',
        arguments: { title: 'Script Test', html: '<p>test</p>' },
      });
      const created = parseText(createResult as { content: unknown[] }) as { id: string };

      const result = await client.callTool({
        name: 'add_scripts',
        arguments: { id: created.id, urls: ['https://cdn.example.com/lib.js'] },
      });

      const data = parseText(result as { content: unknown[] }) as { scripts: string[] };
      expect(data.scripts).toEqual(['https://cdn.example.com/lib.js']);
    });

    it('should return error for non-existent page', async () => {
      const result = await client.callTool({
        name: 'add_scripts',
        arguments: { id: 'non-existent', urls: ['https://cdn.example.com/lib.js'] },
      });

      expect(result.isError).toBe(true);
    });

    it('should reject invalid URLs', async () => {
      const createResult = await client.callTool({
        name: 'create_page',
        arguments: { title: 'Invalid URL Test', html: '<p>test</p>' },
      });
      const created = parseText(createResult as { content: unknown[] }) as { id: string };

      const result = await client.callTool({
        name: 'add_scripts',
        arguments: { id: created.id, urls: ['not-a-url'] },
      });

      expect(result.isError).toBe(true);
    });
  });

  describe('add_stylesheets', () => {
    it('should add stylesheets to a page', async () => {
      const createResult = await client.callTool({
        name: 'create_page',
        arguments: { title: 'Style Test', html: '<p>test</p>' },
      });
      const created = parseText(createResult as { content: unknown[] }) as { id: string };

      const result = await client.callTool({
        name: 'add_stylesheets',
        arguments: { id: created.id, urls: ['https://cdn.example.com/style.css'] },
      });

      const data = parseText(result as { content: unknown[] }) as { stylesheets: string[] };
      expect(data.stylesheets).toEqual(['https://cdn.example.com/style.css']);
    });

    it('should return error for non-existent page', async () => {
      const result = await client.callTool({
        name: 'add_stylesheets',
        arguments: { id: 'non-existent', urls: ['https://cdn.example.com/style.css'] },
      });

      expect(result.isError).toBe(true);
    });

    it('should reject invalid URLs', async () => {
      const createResult = await client.callTool({
        name: 'create_page',
        arguments: { title: 'Invalid CSS Test', html: '<p>test</p>' },
      });
      const created = parseText(createResult as { content: unknown[] }) as { id: string };

      const result = await client.callTool({
        name: 'add_stylesheets',
        arguments: { id: created.id, urls: ['not-a-valid-url'] },
      });

      expect(result.isError).toBe(true);
    });
  });

  describe('listTools', () => {
    it('should list all 7 registered tools', async () => {
      const result = await client.listTools();

      const toolNames = result.tools.map(t => t.name).sort();
      expect(toolNames).toEqual([
        'add_scripts',
        'add_stylesheets',
        'create_page',
        'destroy_page',
        'get_page',
        'get_pages',
        'update_page',
      ]);
    });
  });
});
