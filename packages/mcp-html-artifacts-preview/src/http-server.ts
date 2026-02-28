import { createServer } from 'node:http';
import type { Page, PageStore } from './page-store.js';
import type { Server, IncomingMessage, ServerResponse } from 'node:http';

export interface HttpServerOptions {
  pageStore: PageStore;
  hostname?: string;
}

export interface HttpServer {
  readonly server: Server;
  readonly url: string;
  close: () => Promise<void>;
}

export async function startHttpServer(options: HttpServerOptions): Promise<HttpServer> {
  const { pageStore, hostname = '127.0.0.1' } = options;

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const baseUrl = hostname.includes(':') ? `http://[${hostname}]` : `http://${hostname}`;
    const url = new URL(req.url ?? '/', baseUrl);

    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method Not Allowed');
      return;
    }

    const match = /^\/pages\/([^/]+)$/.exec(url.pathname);
    if (!match) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const pageId = match[1];
    if (pageId === undefined || pageId === '') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    const page = pageStore.get(pageId);
    if (!page) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Page Not Found');
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(buildHtml(page));
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, hostname, () => {
      server.removeListener('error', reject);
      resolve();
    });
  });

  const address = server.address();
  if (typeof address !== 'object' || address === null) {
    throw new Error('Unexpected server address type');
  }
  const host = hostname.includes(':') ? `[${hostname}]` : hostname;
  const baseUrl = `http://${host}:${String(address.port)}`;

  return {
    server,
    url: baseUrl,
    async close() {
      return new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err);
          }
          else {
            resolve();
          }
        });
      });
    },
  };
}

function escapeHtmlAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

export function buildHtml(page: Page): string {
  if (page.scripts.length === 0 && page.stylesheets.length === 0) {
    return page.html;
  }

  const tags: string[] = [];
  for (const url of page.stylesheets) {
    tags.push(`<link rel="stylesheet" href="${escapeHtmlAttr(url)}">`);
  }
  for (const url of page.scripts) {
    tags.push(`<script src="${escapeHtmlAttr(url)}"></script>`);
  }
  const injection = tags.join('\n');

  const headCloseIndex = page.html.indexOf('</head>');
  if (headCloseIndex !== -1) {
    return `${page.html.slice(0, headCloseIndex) + injection}\n${page.html.slice(headCloseIndex)}`;
  }

  return `${injection}\n${page.html}`;
}
