import { createServer } from 'node:http';
import type { Page, Tombstone, PageStore, PageChangeEvent } from './page-store.js';
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

function handleGlobalSseConnection(pageStore: PageStore, req: IncomingMessage, res: ServerResponse): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.write('\n');

  const listener = (event: PageChangeEvent): void => {
    const page = pageStore.get(event.pageId);
    const data = JSON.stringify({
      pageId: event.pageId,
      name: page?.name,
      title: page?.title,
    });
    res.write(`event: ${event.type}\ndata: ${data}\n\n`);
  };

  pageStore.onChange(listener);

  req.on('close', () => {
    pageStore.offChange(listener);
  });
}

function handleSseConnection(pageStore: PageStore, pageId: string, req: IncomingMessage, res: ServerResponse): void {
  if (!pageStore.get(pageId)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page Not Found');
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.write('\n');

  const listener = (event: PageChangeEvent): void => {
    if (event.pageId !== pageId) {
      return;
    }
    res.write(`event: ${event.type}\ndata: {}\n\n`);
    if (event.type === 'delete') {
      pageStore.offChange(listener);
      res.end();
    }
  };

  pageStore.onChange(listener);

  req.on('close', () => {
    pageStore.offChange(listener);
  });
}

export async function startHttpServer(options: HttpServerOptions): Promise<HttpServer> {
  const { pageStore, hostname = 'localhost' } = options;

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.url === undefined) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request');
      return;
    }
    const pathname = req.url.split('?')[0] ?? '/';

    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method Not Allowed');
      return;
    }

    if (pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(buildDashboardHtml(pageStore));
      return;
    }

    if (pathname === '/events') {
      handleGlobalSseConnection(pageStore, req, res);
      return;
    }

    const eventsMatch = /^\/pages\/([^/]+)\/events$/.exec(pathname);
    if (eventsMatch) {
      const pageId = eventsMatch[1];
      if (pageId === undefined || pageId === '') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }
      handleSseConnection(pageStore, pageId, req, res);
      return;
    }

    const match = /^\/pages\/([^/]+)$/.exec(pathname);
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
  const serverUrl = new URL('http://localhost');
  serverUrl.hostname = hostname;
  serverUrl.port = String(address.port);
  const baseUrl = serverUrl.origin;

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

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeHtmlAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

const HOT_RELOAD_SCRIPT = `<script>(function(){var es=new EventSource(location.pathname+"/events");es.addEventListener("update",function(){location.reload()});es.addEventListener("delete",function(){es.close();document.title="[Deleted] "+document.title})})()</script>`;

export function buildHtml(page: Page): string {
  const tags: string[] = [];
  for (const url of page.stylesheets) {
    tags.push(`<link rel="stylesheet" href="${escapeHtmlAttr(url)}">`);
  }
  for (const url of page.scripts) {
    tags.push(`<script src="${escapeHtmlAttr(url)}"></script>`);
  }
  tags.push(HOT_RELOAD_SCRIPT);
  const injection = tags.join('\n');

  const headCloseIndex = page.html.indexOf('</head>');
  if (headCloseIndex !== -1) {
    return `${page.html.slice(0, headCloseIndex) + injection}\n${page.html.slice(headCloseIndex)}`;
  }

  return `${injection}\n${page.html}`;
}

const DASHBOARD_SCRIPT = `<script>(function(){var es=new EventSource("/events");es.addEventListener("create",function(e){var d=JSON.parse(e.data);location.href="/pages/"+d.pageId});es.addEventListener("update",function(){location.reload()});es.addEventListener("delete",function(){location.reload()})})()</script>`;

function buildPageRow(page: Page): string {
  const name = page.name !== undefined ? escapeHtml(page.name) : '<span style="color:#8b949e">—</span>';
  const title = escapeHtml(page.title);
  const url = `/pages/${escapeHtmlAttr(page.id)}`;
  const created = page.createdAt.toISOString().replace('T', ' ').slice(0, 19);
  const updated = page.updatedAt.toISOString().replace('T', ' ').slice(0, 19);
  return `<tr><td>${name}</td><td><a href="${url}">${title}</a></td><td>${created}</td><td>${updated}</td></tr>`;
}

function buildTombstoneRow(tombstone: Tombstone): string {
  const name = tombstone.name !== undefined ? escapeHtml(tombstone.name) : '<span style="color:#484f58">—</span>';
  const title = escapeHtml(tombstone.title);
  const created = tombstone.createdAt.toISOString().replace('T', ' ').slice(0, 19);
  const deleted = tombstone.deletedAt.toISOString().replace('T', ' ').slice(0, 19);
  return `<tr class="deleted"><td>${name}</td><td>${title}</td><td>${created}</td><td>${deleted}</td></tr>`;
}

export function buildDashboardHtml(pageStore: PageStore): string {
  const pages = pageStore.list();
  const tombstones = pageStore.listTombstones();
  const pageRows = pages.map(buildPageRow).join('');
  const tombstoneRows = tombstones.map(buildTombstoneRow).join('');
  const hasAny = pages.length > 0 || tombstones.length > 0;

  const emptyMessage = !hasAny
    ? '<p style="color:#8b949e;text-align:center;margin:40px 0">No artifacts yet. Use <code>create_page</code> to create one.</p>'
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>MCP HTML Artifacts</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0d1117;color:#c9d1d9;padding:24px}
h1{font-size:1.4em;margin-bottom:16px;color:#f0f6fc}
h2{font-size:1.1em;margin:24px 0 8px;color:#8b949e;font-weight:600}
table{width:100%;border-collapse:collapse;margin-top:8px}
th{text-align:left;padding:8px 12px;border-bottom:2px solid #30363d;color:#8b949e;font-size:0.85em;font-weight:600}
td{padding:8px 12px;border-bottom:1px solid #21262d;font-size:0.9em}
a{color:#58a6ff;text-decoration:none}
a:hover{text-decoration:underline}
code{background:#161b22;padding:2px 6px;border-radius:4px;font-size:0.85em}
tr.deleted{opacity:0.45}
</style>
</head>
<body>
<h1>MCP HTML Artifacts</h1>
${emptyMessage}
${pages.length > 0 ? `<table><thead><tr><th>Name</th><th>Title</th><th>Created</th><th>Updated</th></tr></thead><tbody>${pageRows}</tbody></table>` : ''}
${tombstones.length > 0 ? `<h2>Deleted</h2><table><thead><tr><th>Name</th><th>Title</th><th>Created</th><th>Deleted</th></tr></thead><tbody>${tombstoneRows}</tbody></table>` : ''}
${DASHBOARD_SCRIPT}
</body>
</html>`;
}
