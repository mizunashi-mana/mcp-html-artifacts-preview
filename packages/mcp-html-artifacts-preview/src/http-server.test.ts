import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildDashboardHtml, buildHtml, startHttpServer } from './http-server.js';
import { PageStore } from './page-store.js';
import type { HttpServer } from './http-server.js';
import type { Page } from './page-store.js';

function makePage(overrides: Partial<Page> = {}): Page {
  return {
    id: 'test-id',
    name: undefined,
    title: 'Test',
    html: '<html><head><title>Test</title></head><body><p>Hello</p></body></html>',
    scripts: [],
    stylesheets: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('buildHtml', () => {
  it('should always inject hot reload script even with no scripts or stylesheets', () => {
    const page = makePage();
    const result = buildHtml(page);
    expect(result).toContain('EventSource');
    expect(result).toContain('</head>');
  });

  it('should inject script tags before </head>', () => {
    const page = makePage({
      scripts: ['https://cdn.example.com/lib.js'],
    });

    const result = buildHtml(page);
    expect(result).toContain('<script src="https://cdn.example.com/lib.js"></script>');
    expect(result.indexOf('<script src=')).toBeLessThan(result.indexOf('</head>'));
  });

  it('should inject stylesheet tags before </head>', () => {
    const page = makePage({
      stylesheets: ['https://cdn.example.com/style.css'],
    });

    const result = buildHtml(page);
    expect(result).toContain('<link rel="stylesheet" href="https://cdn.example.com/style.css">');
    expect(result.indexOf('<link')).toBeLessThan(result.indexOf('</head>'));
  });

  it('should inject both scripts and stylesheets', () => {
    const page = makePage({
      scripts: ['https://cdn.example.com/lib.js'],
      stylesheets: ['https://cdn.example.com/style.css'],
    });

    const result = buildHtml(page);
    expect(result).toContain('<script src="https://cdn.example.com/lib.js"></script>');
    expect(result).toContain('<link rel="stylesheet" href="https://cdn.example.com/style.css">');
  });

  it('should place stylesheets before user scripts', () => {
    const page = makePage({
      scripts: ['https://cdn.example.com/lib.js'],
      stylesheets: ['https://cdn.example.com/style.css'],
    });

    const result = buildHtml(page);
    expect(result.indexOf('<link')).toBeLessThan(result.indexOf('<script src='));
  });

  it('should prepend tags when html has no </head>', () => {
    const page = makePage({
      html: '<p>Hello</p>',
      scripts: ['https://cdn.example.com/lib.js'],
    });

    const result = buildHtml(page);
    expect(result).toContain('<script src="https://cdn.example.com/lib.js"></script>');
    expect(result).toContain('EventSource');
    expect(result).toMatch(/<p>Hello<\/p>$/);
  });

  it('should escape special characters in URLs to prevent XSS', () => {
    const page = makePage({
      scripts: ['" onload="alert(1)'],
    });

    const result = buildHtml(page);
    expect(result).toContain('src="&quot; onload=&quot;alert(1)"');
    expect(result).not.toContain('onload="alert(1)"');
  });

  it('should escape ampersands in URLs', () => {
    const page = makePage({
      stylesheets: ['https://example.com/style.css?a=1&b=2'],
    });

    const result = buildHtml(page);
    expect(result).toContain('href="https://example.com/style.css?a=1&amp;b=2"');
  });

  it('should inject hot reload script that subscribes to SSE events', () => {
    const page = makePage();
    const result = buildHtml(page);
    expect(result).toContain('new EventSource(location.pathname+"/events")');
    expect(result).toContain('addEventListener("update"');
    expect(result).toContain('addEventListener("delete"');
  });
});

describe('buildDashboardHtml', () => {
  it('should show empty message when no pages exist', () => {
    const store = new PageStore();
    const html = buildDashboardHtml(store);

    expect(html).toContain('No artifacts yet');
    expect(html).toMatch(/page-frame"[^>]*style="display:none"/);
  });

  it('should show latest artifact in iframe and pages in selector', () => {
    const store = new PageStore();
    const page = store.create({ title: 'My Page', html: '<p>test</p>', name: 'my-page' });

    const html = buildDashboardHtml(store);

    expect(html).toContain('my-page: My Page');
    expect(html).toContain(`<iframe`);
    expect(html).toContain(`/pages/${page.id}`);
    expect(html).toContain('<select');
    expect(html).toMatch(/empty-message"[^>]*style="display:none"/);
  });

  it('should show only title for pages without a name', () => {
    const store = new PageStore();
    store.create({ title: 'Unnamed', html: '<p>test</p>' });

    const html = buildDashboardHtml(store);

    expect(html).toContain('>Unnamed</option>');
  });

  it('should select the most recently updated page', () => {
    const store = new PageStore();
    const older = store.create({ title: 'Older', html: '<p>old</p>', name: 'old' });
    const newer = store.create({ title: 'Newer', html: '<p>new</p>', name: 'new' });

    // Update the older page to make it the most recent
    store.update(older.id, { html: '<p>updated</p>' });

    const html = buildDashboardHtml(store);

    // The iframe should show the most recently updated page (older, now updated)
    expect(html).toContain(`src="/pages/${older.id}"`);
    // The first option (selected) should be the most recently updated
    expect(html).toMatch(new RegExp(`<option value="${older.id}" selected>`));
    expect(html).toMatch(new RegExp(`<option value="${newer.id}">`));
    expect(html).not.toMatch(new RegExp(`<option value="${newer.id}" selected>`));
  });

  it('should escape HTML in name and title', () => {
    const store = new PageStore();
    store.create({ title: '<script>alert(1)</script>', html: '<p>test</p>', name: '<b>xss</b>' });

    const html = buildDashboardHtml(store);

    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<b>xss</b>');
    expect(html).toContain('&lt;b&gt;xss&lt;/b&gt;');
  });

  it('should include SSE script for live updates', () => {
    const store = new PageStore();
    const html = buildDashboardHtml(store);

    expect(html).toContain('EventSource("/events")');
    expect(html).toContain('addEventListener("create"');
    expect(html).toContain('addEventListener("update"');
    expect(html).toContain('addEventListener("delete"');
  });

  it('should hide nav and iframe when no pages exist', () => {
    const store = new PageStore();
    const html = buildDashboardHtml(store);

    expect(html).toMatch(/page-nav"[^>]*style="display:none"/);
    expect(html).toMatch(/page-frame"[^>]*style="display:none"/);
  });

  it('should show nav and iframe when pages exist', () => {
    const store = new PageStore();
    store.create({ title: 'Active', html: '<p>hi</p>' });

    const html = buildDashboardHtml(store);

    expect(html).not.toMatch(/page-nav"[^>]*style="display:none"/);
    expect(html).not.toMatch(/page-frame"[^>]*style="display:none"/);
  });

  it('should show empty message when only tombstones exist', () => {
    const store = new PageStore();
    const page = store.create({ title: 'Gone', html: '' });
    store.delete(page.id);

    const html = buildDashboardHtml(store);

    expect(html).toContain('No artifacts yet');
  });

  it('should include open link for direct page access', () => {
    const store = new PageStore();
    const page = store.create({ title: 'Test', html: '<p>test</p>' });

    const html = buildDashboardHtml(store);

    expect(html).toContain(`href="/pages/${page.id}"`);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('Open');
  });
});

describe('HTTP server integration', () => {
  let httpServer: HttpServer;
  let pageStore: PageStore;

  beforeAll(async () => {
    pageStore = new PageStore();
    httpServer = await startHttpServer({ pageStore });
  });

  afterAll(async () => {
    await httpServer.close();
  });

  it('should serve a created page', async () => {
    const page = pageStore.create({ title: 'HTTP Test', html: '<html><head><title>HTTP Test</title></head><body><p>Hello</p></body></html>' });

    const res = await fetch(`${httpServer.url}/pages/${page.id}`);

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8');
    const body = await res.text();
    expect(body).toContain('<p>Hello</p>');
    expect(body).toContain('EventSource');
  });

  it('should return 404 for non-existent page', async () => {
    const res = await fetch(`${httpServer.url}/pages/non-existent`);

    expect(res.status).toBe(404);
    const body = await res.text();
    expect(body).toBe('Page Not Found');
  });

  it('should return 404 for unknown routes', async () => {
    const res = await fetch(`${httpServer.url}/unknown`);

    expect(res.status).toBe(404);
    const body = await res.text();
    expect(body).toBe('Not Found');
  });

  it('should return 405 for non-GET methods', async () => {
    const page = pageStore.create({ title: 'Method Test', html: '<p>test</p>' });

    const res = await fetch(`${httpServer.url}/pages/${page.id}`, { method: 'POST' });

    expect(res.status).toBe(405);
    const body = await res.text();
    expect(body).toBe('Method Not Allowed');
  });

  it('should inject scripts and stylesheets into served HTML', async () => {
    const page = pageStore.create({ title: 'Inject Test', html: '<html><head><title>Inject</title></head><body><p>test</p></body></html>' });
    pageStore.addScripts(page.id, ['https://cdn.example.com/lib.js']);
    pageStore.addStylesheets(page.id, ['https://cdn.example.com/style.css']);

    const res = await fetch(`${httpServer.url}/pages/${page.id}`);
    const body = await res.text();

    expect(body).toContain('<script src="https://cdn.example.com/lib.js"></script>');
    expect(body).toContain('<link rel="stylesheet" href="https://cdn.example.com/style.css">');
  });

  it('should return SSE stream for events endpoint', async () => {
    const page = pageStore.create({ title: 'SSE Test', html: '<p>sse</p>' });

    const controller = new AbortController();
    const res = await fetch(`${httpServer.url}/pages/${page.id}/events`, {
      signal: controller.signal,
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/event-stream');

    controller.abort();
  });

  it('should return 404 for SSE endpoint of non-existent page', async () => {
    const res = await fetch(`${httpServer.url}/pages/non-existent/events`);

    expect(res.status).toBe(404);
  });

  it('should send SSE update event when page is updated', async () => {
    const page = pageStore.create({ title: 'SSE Update', html: '<p>original</p>' });

    const controller = new AbortController();
    const res = await fetch(`${httpServer.url}/pages/${page.id}/events`, {
      signal: controller.signal,
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    // Trigger an update
    pageStore.update(page.id, { html: '<p>updated</p>' });

    // Read chunks until we find the expected event
    const chunks: string[] = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      chunks.push(decoder.decode(value, { stream: true }));
      if (chunks.join('').includes('event: update')) break;
    }
    expect(chunks.join('')).toContain('event: update');

    controller.abort();
  });

  it('should send SSE delete event when page is deleted', async () => {
    const page = pageStore.create({ title: 'SSE Delete', html: '<p>to delete</p>' });

    const controller = new AbortController();
    const res = await fetch(`${httpServer.url}/pages/${page.id}/events`, {
      signal: controller.signal,
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    // Trigger a delete
    pageStore.delete(page.id);

    // Read chunks until we find the expected event
    const chunks: string[] = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      chunks.push(decoder.decode(value, { stream: true }));
      if (chunks.join('').includes('event: delete')) break;
    }
    expect(chunks.join('')).toContain('event: delete');

    controller.abort();
  });

  it('should assign a dynamic port', () => {
    expect(httpServer.url).toMatch(/^http:\/\/localhost:\d+$/);
  });

  describe('dashboard', () => {
    it('should serve dashboard at root URL', async () => {
      const res = await fetch(httpServer.url);

      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8');
      const body = await res.text();
      expect(body).toContain('MCP HTML Artifacts');
    });

    it('should list existing pages in the dashboard', async () => {
      const page = pageStore.create({ title: 'Dashboard Test', html: '<p>test</p>', name: 'test-artifact' });

      const res = await fetch(httpServer.url);
      const body = await res.text();

      expect(body).toContain('test-artifact');
      expect(body).toContain('Dashboard Test');
      expect(body).toContain(`/pages/${page.id}`);
    });
  });

  describe('global SSE', () => {
    it('should return SSE stream at /events', async () => {
      const controller = new AbortController();
      const res = await fetch(`${httpServer.url}/events`, {
        signal: controller.signal,
      });

      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('text/event-stream');

      controller.abort();
    });

    it('should send create event when a page is created', async () => {
      const controller = new AbortController();
      const res = await fetch(`${httpServer.url}/events`, {
        signal: controller.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      pageStore.create({ title: 'SSE Create', html: '<p>new</p>', name: 'new-artifact' });

      const chunks: string[] = [];
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        chunks.push(decoder.decode(value, { stream: true }));
        if (chunks.join('').includes('event: create')) break;
      }
      const output = chunks.join('');
      expect(output).toContain('event: create');
      expect(output).toContain('"name":"new-artifact"');

      controller.abort();
    });
  });
});
