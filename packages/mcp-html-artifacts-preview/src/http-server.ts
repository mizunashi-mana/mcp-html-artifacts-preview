import { createServer } from 'node:http';
import type { Page, PageStore, PageChangeEvent } from './page-store.js';
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

const DASHBOARD_SCRIPT = `<script>(function(){var es=new EventSource("/events");var sel=document.getElementById("page-select");var frame=document.getElementById("page-frame");var empty=document.getElementById("empty-message");var nav=document.querySelector(".page-nav");var link=document.getElementById("open-link");function upd(){var h=sel.options.length>0;frame.style.display=h?"":"none";nav.style.display=h?"":"none";empty.style.display=h?"none":""}function show(id){frame.src="/pages/"+id;sel.value=id;link.href="/pages/"+id}sel.addEventListener("change",function(){show(sel.value)});es.addEventListener("create",function(e){var d=JSON.parse(e.data);var o=document.createElement("option");o.value=d.pageId;o.textContent=d.title;sel.insertBefore(o,sel.firstChild);show(d.pageId);upd()});es.addEventListener("update",function(e){var d=JSON.parse(e.data);for(var i=0;i<sel.options.length;i++){if(sel.options[i].value===d.pageId){sel.options[i].textContent=d.title;break}}});es.addEventListener("delete",function(e){var d=JSON.parse(e.data);for(var i=0;i<sel.options.length;i++){if(sel.options[i].value===d.pageId){sel.remove(i);break}}if(sel.options.length>0){show(sel.options[0].value)}upd()})})()</script>`;

function buildPageOption(page: Page, isSelected: boolean): string {
  const selected = isSelected ? ' selected' : '';
  return `<option value="${escapeHtmlAttr(page.id)}"${selected}>${escapeHtml(page.title)}</option>`;
}

export function buildDashboardHtml(pageStore: PageStore): string {
  const pages = pageStore.list();
  const sorted = [...pages].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  const latest = sorted[0];
  const hasPages = sorted.length > 0;

  const options = sorted.map((p, i) => buildPageOption(p, i === 0)).join('');
  const iframeSrc = latest ? `/pages/${escapeHtmlAttr(latest.id)}` : '';
  const openHref = latest ? `/pages/${escapeHtmlAttr(latest.id)}` : '#';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>MCP HTML Artifacts</title>
<style>
html,body{margin:0;padding:0;height:100%;overflow:hidden}
body{display:flex;flex-direction:column;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0d1117;color:#c9d1d9}
header{display:flex;align-items:center;gap:12px;padding:8px 16px;background:#161b22;border-bottom:1px solid #30363d;flex-shrink:0}
header h1{font-size:1em;color:#f0f6fc;white-space:nowrap}
.page-nav{display:flex;align-items:center;gap:8px}
select{background:#21262d;color:#c9d1d9;border:1px solid #30363d;border-radius:6px;padding:4px 8px;font-size:0.85em;max-width:300px}
.open-link{color:#58a6ff;font-size:0.8em;text-decoration:none;white-space:nowrap}
.open-link:hover{text-decoration:underline}
main{flex:1;position:relative}
iframe{width:100%;height:100%;border:none}
.empty{display:flex;align-items:center;justify-content:center;height:100%;color:#8b949e;text-align:center}
.empty code{background:#161b22;padding:2px 6px;border-radius:4px;font-size:0.85em}
</style>
</head>
<body>
<header>
<h1>MCP HTML Artifacts</h1>
<div class="page-nav"${hasPages ? '' : ' style="display:none"'}>
<select id="page-select">${options}</select>
<a class="open-link" id="open-link" href="${openHref}" target="_blank">Open</a>
</div>
</header>
<main>
<iframe id="page-frame" src="${iframeSrc}"${hasPages ? '' : ' style="display:none"'}></iframe>
<div class="empty" id="empty-message"${hasPages ? ' style="display:none"' : ''}>
<p>No artifacts yet. Use <code>create_page</code> to create one.</p>
</div>
</main>
${DASHBOARD_SCRIPT}
</body>
</html>`;
}
