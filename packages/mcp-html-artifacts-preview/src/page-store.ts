import { randomUUID } from 'node:crypto';

export interface Page {
  id: string;
  title: string;
  html: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePageParams {
  title: string;
  html: string;
}

export interface UpdatePageParams {
  title?: string;
  html?: string;
}

export class PageStore {
  readonly #pages = new Map<string, Page>();

  create(params: CreatePageParams): Page {
    const now = new Date();
    const page: Page = {
      id: randomUUID(),
      title: params.title,
      html: params.html,
      createdAt: now,
      updatedAt: now,
    };
    this.#pages.set(page.id, page);
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

    if (params.title !== undefined) {
      page.title = params.title;
    }
    if (params.html !== undefined) {
      page.html = params.html;
    }
    page.updatedAt = new Date();
    return page;
  }
}
