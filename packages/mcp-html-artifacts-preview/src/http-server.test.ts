import { describe, expect, it } from 'vitest';
import { buildHtml } from './http-server.js';
import type { Page } from './page-store.js';

function makePage(overrides: Partial<Page> = {}): Page {
  return {
    id: 'test-id',
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
