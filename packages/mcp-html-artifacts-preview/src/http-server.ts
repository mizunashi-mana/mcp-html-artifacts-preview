import { createServer } from 'node:http';
import type { PageStore } from './page-store.js';
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
    res.end(page.html);
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
