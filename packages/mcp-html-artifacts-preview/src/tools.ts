import { z } from 'zod';
import type { PageStore } from './page-store.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export interface RegisterToolsOptions {
  server: McpServer;
  pageStore: PageStore;
  getBaseUrl: () => string;
}

export function registerTools({ server, pageStore, getBaseUrl }: RegisterToolsOptions): void {
  server.registerTool(
    'create_page',
    {
      description: 'Create an HTML page and return its preview URL',
      inputSchema: {
        title: z.string().describe('Page title'),
        html: z.string().describe('HTML content of the page'),
      },
    },
    ({ title, html }) => {
      const page = pageStore.create({ title, html });
      const url = `${getBaseUrl()}/pages/${page.id}`;
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              id: page.id,
              title: page.title,
              url,
              createdAt: page.createdAt.toISOString(),
            }),
          },
        ],
      };
    },
  );

  server.registerTool(
    'update_page',
    {
      description: 'Update the HTML content of an existing page. At least one of title or html must be provided.',
      inputSchema: {
        id: z.string().describe('Page ID to update'),
        title: z.string().optional().describe('New page title'),
        html: z.string().optional().describe('New HTML content'),
      },
    },
    ({ id, title, html }) => {
      if (title === undefined && html === undefined) {
        return {
          content: [{ type: 'text' as const, text: 'At least one of title or html must be provided' }],
          isError: true,
        };
      }
      const page = pageStore.update(id, { title, html });
      if (!page) {
        return {
          content: [{ type: 'text' as const, text: `Page not found: ${id}` }],
          isError: true,
        };
      }
      const url = `${getBaseUrl()}/pages/${page.id}`;
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              id: page.id,
              title: page.title,
              url,
              updatedAt: page.updatedAt.toISOString(),
            }),
          },
        ],
      };
    },
  );

  server.registerTool(
    'get_pages',
    {
      description: 'List all created pages',
    },
    () => {
      const pages = pageStore.list();
      const result = pages.map(page => ({
        id: page.id,
        title: page.title,
        url: `${getBaseUrl()}/pages/${page.id}`,
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
      }));
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result) }],
      };
    },
  );

  server.registerTool(
    'get_page',
    {
      description: 'Get the HTML content of a specific page',
      inputSchema: {
        id: z.string().describe('Page ID to retrieve'),
      },
    },
    ({ id }) => {
      const page = pageStore.get(id);
      if (!page) {
        return {
          content: [{ type: 'text' as const, text: `Page not found: ${id}` }],
          isError: true,
        };
      }
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              id: page.id,
              title: page.title,
              html: page.html,
              url: `${getBaseUrl()}/pages/${page.id}`,
              createdAt: page.createdAt.toISOString(),
              updatedAt: page.updatedAt.toISOString(),
            }),
          },
        ],
      };
    },
  );

  server.registerTool(
    'destroy_page',
    {
      description: 'Delete a page',
      inputSchema: {
        id: z.string().describe('Page ID to delete'),
      },
    },
    ({ id }) => {
      const deleted = pageStore.delete(id);
      if (!deleted) {
        return {
          content: [{ type: 'text' as const, text: `Page not found: ${id}` }],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ id, deleted: true }) }],
      };
    },
  );

  server.registerTool(
    'add_scripts',
    {
      description: 'Add CDN scripts (e.g. Mermaid.js, Chart.js) to an existing page',
      inputSchema: {
        id: z.string().describe('Page ID'),
        urls: z.array(z.string()).describe('Script URLs to add'),
      },
    },
    ({ id, urls }) => {
      const page = pageStore.addScripts(id, urls);
      if (!page) {
        return {
          content: [{ type: 'text' as const, text: `Page not found: ${id}` }],
          isError: true,
        };
      }
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              id: page.id,
              scripts: page.scripts,
              updatedAt: page.updatedAt.toISOString(),
            }),
          },
        ],
      };
    },
  );

  server.registerTool(
    'add_stylesheets',
    {
      description: 'Add external stylesheets to an existing page',
      inputSchema: {
        id: z.string().describe('Page ID'),
        urls: z.array(z.string()).describe('Stylesheet URLs to add'),
      },
    },
    ({ id, urls }) => {
      const page = pageStore.addStylesheets(id, urls);
      if (!page) {
        return {
          content: [{ type: 'text' as const, text: `Page not found: ${id}` }],
          isError: true,
        };
      }
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              id: page.id,
              stylesheets: page.stylesheets,
              updatedAt: page.updatedAt.toISOString(),
            }),
          },
        ],
      };
    },
  );
}
