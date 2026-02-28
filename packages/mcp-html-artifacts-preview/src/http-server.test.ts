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
  it('should return html as-is when no scripts or stylesheets', () => {
    const page = makePage();
    expect(buildHtml(page)).toBe(page.html);
  });

  it('should inject script tags before </head>', () => {
    const page = makePage({
      scripts: ['https://cdn.example.com/lib.js'],
    });

    const result = buildHtml(page);
    expect(result).toContain('<script src="https://cdn.example.com/lib.js"></script>');
    expect(result.indexOf('<script')).toBeLessThan(result.indexOf('</head>'));
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

  it('should place stylesheets before scripts', () => {
    const page = makePage({
      scripts: ['https://cdn.example.com/lib.js'],
      stylesheets: ['https://cdn.example.com/style.css'],
    });

    const result = buildHtml(page);
    expect(result.indexOf('<link')).toBeLessThan(result.indexOf('<script'));
  });

  it('should prepend tags when html has no </head>', () => {
    const page = makePage({
      html: '<p>Hello</p>',
      scripts: ['https://cdn.example.com/lib.js'],
    });

    const result = buildHtml(page);
    expect(result).toMatch(/^<script.*<\/script>\n<p>Hello<\/p>$/);
  });
});
