import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';

export interface Page {
  id: string;
  name: string | undefined;
  title: string;
  html: string;
  scripts: string[];
  stylesheets: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePageParams {
  title: string;
  html: string;
  name?: string;
}

export interface UpdatePageParams {
  title?: string;
  html?: string;
  name?: string;
}

export type PageChangeType = 'create' | 'update' | 'delete';

export interface PageChangeEvent {
  type: PageChangeType;
  pageId: string;
}

export class PageStore {
  readonly #pages = new Map<string, Page>();
  readonly #emitter = new EventEmitter();

  constructor() {
    this.#emitter.setMaxListeners(0);
  }

  onChange(listener: (event: PageChangeEvent) => void): void {
    this.#emitter.on('change', listener);
  }

  offChange(listener: (event: PageChangeEvent) => void): void {
    this.#emitter.off('change', listener);
  }

  create(params: CreatePageParams): Page {
    const now = new Date();
    const page: Page = {
      id: randomUUID(),
      name: params.name,
      title: params.title,
      html: params.html,
      scripts: [],
      stylesheets: [],
      createdAt: now,
      updatedAt: now,
    };
    this.#pages.set(page.id, page);
    this.#emitter.emit('change', { type: 'create', pageId: page.id } satisfies PageChangeEvent);
    return page;
  }

  get(id: string): Page | undefined {
    return this.#pages.get(id);
  }

  list(): Page[] {
    return [...this.#pages.values()];
  }

  update(id: string, params: UpdatePageParams): Page | undefined {
    const page = this.#pages.get(id);
    if (!page) {
      return undefined;
    }

    if (params.name !== undefined) {
      page.name = params.name;
    }
    if (params.title !== undefined) {
      page.title = params.title;
    }
    if (params.html !== undefined) {
      page.html = params.html;
    }
    page.updatedAt = new Date();
    this.#emitter.emit('change', { type: 'update', pageId: id } satisfies PageChangeEvent);
    return page;
  }

  delete(id: string): boolean {
    if (!this.#pages.has(id)) {
      return false;
    }
    this.#emitter.emit('change', { type: 'delete', pageId: id } satisfies PageChangeEvent);
    this.#pages.delete(id);
    return true;
  }

  addScripts(id: string, urls: string[]): Page | undefined {
    const page = this.#pages.get(id);
    if (!page) {
      return undefined;
    }

    for (const url of urls) {
      if (!page.scripts.includes(url)) {
        page.scripts.push(url);
      }
    }
    page.updatedAt = new Date();
    this.#emitter.emit('change', { type: 'update', pageId: id } satisfies PageChangeEvent);
    return page;
  }

  addStylesheets(id: string, urls: string[]): Page | undefined {
    const page = this.#pages.get(id);
    if (!page) {
      return undefined;
    }

    for (const url of urls) {
      if (!page.stylesheets.includes(url)) {
        page.stylesheets.push(url);
      }
    }
    page.updatedAt = new Date();
    this.#emitter.emit('change', { type: 'update', pageId: id } satisfies PageChangeEvent);
    return page;
  }
}
