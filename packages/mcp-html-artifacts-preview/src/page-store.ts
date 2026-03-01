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

export interface Tombstone {
  id: string;
  name: string | undefined;
  title: string;
  createdAt: Date;
  deletedAt: Date;
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

export interface PageStoreOptions {
  maxPages?: number;
  ttl?: number;
}

const MIN_CLEANUP_INTERVAL_MS = 10_000;

export class PageStore {
  readonly #pages = new Map<string, Page>();
  readonly #tombstones = new Map<string, Tombstone>();
  readonly #emitter = new EventEmitter();
  readonly #maxPages: number | undefined;
  readonly #ttl: number | undefined;
  #cleanupTimer: ReturnType<typeof setInterval> | undefined;

  constructor(options?: PageStoreOptions) {
    this.#emitter.setMaxListeners(0);
    this.#maxPages = options?.maxPages;
    this.#ttl = options?.ttl;

    if (this.#ttl !== undefined) {
      const interval = Math.max(Math.floor(this.#ttl / 2), MIN_CLEANUP_INTERVAL_MS);
      this.#cleanupTimer = setInterval(() => this.#cleanupExpired(), interval);
      this.#cleanupTimer.unref();
    }
  }

  dispose(): void {
    if (this.#cleanupTimer !== undefined) {
      clearInterval(this.#cleanupTimer);
      this.#cleanupTimer = undefined;
    }
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
    this.#evictIfNeeded();
    this.#emitter.emit('change', { type: 'create', pageId: page.id } satisfies PageChangeEvent);
    return page;
  }

  get(id: string): Page | undefined {
    return this.#pages.get(id);
  }

  list(): Page[] {
    return [...this.#pages.values()];
  }

  listTombstones(): Tombstone[] {
    return [...this.#tombstones.values()];
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
    const page = this.#pages.get(id);
    if (!page) {
      return false;
    }
    this.#saveTombstone(page);
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

  #saveTombstone(page: Page): void {
    const tombstone: Tombstone = {
      id: page.id,
      name: page.name,
      title: page.title,
      createdAt: page.createdAt,
      deletedAt: new Date(),
    };
    this.#tombstones.set(page.id, tombstone);
    this.#evictTombstonesIfNeeded();
  }

  #evictIfNeeded(): void {
    if (this.#maxPages === undefined) {
      return;
    }
    while (this.#pages.size > this.#maxPages) {
      let oldest: Page | undefined;
      for (const page of this.#pages.values()) {
        if (oldest === undefined || page.createdAt < oldest.createdAt) {
          oldest = page;
        }
      }
      if (oldest) {
        this.#saveTombstone(oldest);
        this.#emitter.emit('change', { type: 'delete', pageId: oldest.id } satisfies PageChangeEvent);
        this.#pages.delete(oldest.id);
      }
    }
  }

  #evictTombstonesIfNeeded(): void {
    if (this.#maxPages === undefined) {
      return;
    }
    while (this.#tombstones.size > this.#maxPages) {
      let oldest: Tombstone | undefined;
      for (const t of this.#tombstones.values()) {
        if (oldest === undefined || t.deletedAt < oldest.deletedAt) {
          oldest = t;
        }
      }
      if (oldest) {
        this.#tombstones.delete(oldest.id);
      }
    }
  }

  #cleanupExpired(): void {
    if (this.#ttl === undefined) {
      return;
    }
    const now = Date.now();
    for (const page of this.#pages.values()) {
      if (now - page.updatedAt.getTime() > this.#ttl) {
        this.delete(page.id);
      }
    }
  }
}
