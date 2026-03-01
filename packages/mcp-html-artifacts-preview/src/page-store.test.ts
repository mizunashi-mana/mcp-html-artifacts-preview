import { afterEach, describe, expect, it, vi } from 'vitest';
import { PageStore } from './page-store.js';

describe('PageStore', () => {
  describe('create', () => {
    it('should create a page with the given title and html', () => {
      const store = new PageStore();
      const page = store.create({ title: 'Test Page', html: '<h1>Hello</h1>' });

      expect(page.title).toBe('Test Page');
      expect(page.html).toBe('<h1>Hello</h1>');
    });

    it('should assign a unique id to each page', () => {
      const store = new PageStore();
      const page1 = store.create({ title: 'Page 1', html: '<p>1</p>' });
      const page2 = store.create({ title: 'Page 2', html: '<p>2</p>' });

      expect(page1.id).toBeTruthy();
      expect(page2.id).toBeTruthy();
      expect(page1.id).not.toBe(page2.id);
    });

    it('should set createdAt and updatedAt to the same time', () => {
      const store = new PageStore();
      const page = store.create({ title: 'Test', html: '' });

      expect(page.createdAt).toBeInstanceOf(Date);
      expect(page.updatedAt).toBeInstanceOf(Date);
      expect(page.createdAt.getTime()).toBe(page.updatedAt.getTime());
    });
  });

  describe('get', () => {
    it('should return a page by id', () => {
      const store = new PageStore();
      const created = store.create({ title: 'Test', html: '<p>test</p>' });

      const retrieved = store.get(created.id);
      expect(retrieved).toBe(created);
    });

    it('should return undefined for a non-existent id', () => {
      const store = new PageStore();

      expect(store.get('non-existent')).toBeUndefined();
    });
  });

  describe('list', () => {
    it('should return an empty array when no pages exist', () => {
      const store = new PageStore();

      expect(store.list()).toEqual([]);
    });

    it('should return all created pages', () => {
      const store = new PageStore();
      const page1 = store.create({ title: 'Page 1', html: '<p>1</p>' });
      const page2 = store.create({ title: 'Page 2', html: '<p>2</p>' });

      const pages = store.list();
      expect(pages).toHaveLength(2);
      expect(pages).toContain(page1);
      expect(pages).toContain(page2);
    });
  });

  describe('update', () => {
    it('should update the title of an existing page', () => {
      const store = new PageStore();
      const page = store.create({ title: 'Old Title', html: '<p>content</p>' });

      const updated = store.update(page.id, { title: 'New Title' });

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('New Title');
      expect(updated?.html).toBe('<p>content</p>');
    });

    it('should update the html of an existing page', () => {
      const store = new PageStore();
      const page = store.create({ title: 'Title', html: '<p>old</p>' });

      const updated = store.update(page.id, { html: '<p>new</p>' });

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Title');
      expect(updated?.html).toBe('<p>new</p>');
    });

    it('should update the updatedAt timestamp', () => {
      const store = new PageStore();
      const page = store.create({ title: 'Title', html: '' });
      const originalUpdatedAt = page.updatedAt;

      const updated = store.update(page.id, { title: 'Updated' });

      expect(updated).toBeDefined();
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it('should not modify createdAt', () => {
      const store = new PageStore();
      const page = store.create({ title: 'Title', html: '' });
      const originalCreatedAt = page.createdAt;

      const updated = store.update(page.id, { title: 'Updated' });

      expect(updated?.createdAt).toBe(originalCreatedAt);
    });

    it('should return undefined for a non-existent id', () => {
      const store = new PageStore();

      expect(store.update('non-existent', { title: 'New' })).toBeUndefined();
    });

    it('should reflect updates in subsequent get calls', () => {
      const store = new PageStore();
      const page = store.create({ title: 'Original', html: '<p>original</p>' });

      store.update(page.id, { title: 'Updated', html: '<p>updated</p>' });

      const retrieved = store.get(page.id);
      expect(retrieved?.title).toBe('Updated');
      expect(retrieved?.html).toBe('<p>updated</p>');
    });
  });

  describe('delete', () => {
    it('should delete an existing page', () => {
      const store = new PageStore();
      const page = store.create({ title: 'Test', html: '<p>test</p>' });

      expect(store.delete(page.id)).toBe(true);
      expect(store.get(page.id)).toBeUndefined();
    });

    it('should return false for a non-existent id', () => {
      const store = new PageStore();

      expect(store.delete('non-existent')).toBe(false);
    });

    it('should remove the page from list', () => {
      const store = new PageStore();
      const page = store.create({ title: 'Test', html: '<p>test</p>' });

      store.delete(page.id);

      expect(store.list()).toHaveLength(0);
    });
  });

  describe('addScripts', () => {
    it('should add scripts to a page', () => {
      const store = new PageStore();
      const page = store.create({ title: 'Test', html: '<p>test</p>' });

      const updated = store.addScripts(page.id, ['https://cdn.example.com/lib.js']);

      expect(updated?.scripts).toEqual(['https://cdn.example.com/lib.js']);
    });

    it('should not add duplicate scripts', () => {
      const store = new PageStore();
      const page = store.create({ title: 'Test', html: '<p>test</p>' });

      store.addScripts(page.id, ['https://cdn.example.com/lib.js']);
      const updated = store.addScripts(page.id, ['https://cdn.example.com/lib.js', 'https://cdn.example.com/other.js']);

      expect(updated?.scripts).toEqual([
        'https://cdn.example.com/lib.js',
        'https://cdn.example.com/other.js',
      ]);
    });

    it('should return undefined for a non-existent id', () => {
      const store = new PageStore();

      expect(store.addScripts('non-existent', ['https://cdn.example.com/lib.js'])).toBeUndefined();
    });

    it('should update the updatedAt timestamp', () => {
      const store = new PageStore();
      const page = store.create({ title: 'Test', html: '' });
      const originalUpdatedAt = page.updatedAt;

      const updated = store.addScripts(page.id, ['https://cdn.example.com/lib.js']);

      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });
  });

  describe('addStylesheets', () => {
    it('should add stylesheets to a page', () => {
      const store = new PageStore();
      const page = store.create({ title: 'Test', html: '<p>test</p>' });

      const updated = store.addStylesheets(page.id, ['https://cdn.example.com/style.css']);

      expect(updated?.stylesheets).toEqual(['https://cdn.example.com/style.css']);
    });

    it('should not add duplicate stylesheets', () => {
      const store = new PageStore();
      const page = store.create({ title: 'Test', html: '<p>test</p>' });

      store.addStylesheets(page.id, ['https://cdn.example.com/style.css']);
      const updated = store.addStylesheets(page.id, ['https://cdn.example.com/style.css', 'https://cdn.example.com/other.css']);

      expect(updated?.stylesheets).toEqual([
        'https://cdn.example.com/style.css',
        'https://cdn.example.com/other.css',
      ]);
    });

    it('should return undefined for a non-existent id', () => {
      const store = new PageStore();

      expect(store.addStylesheets('non-existent', ['https://cdn.example.com/style.css'])).toBeUndefined();
    });
  });

  describe('create initializes scripts and stylesheets', () => {
    it('should initialize scripts and stylesheets as empty arrays', () => {
      const store = new PageStore();
      const page = store.create({ title: 'Test', html: '' });

      expect(page.scripts).toEqual([]);
      expect(page.stylesheets).toEqual([]);
    });
  });

  describe('maxPages eviction', () => {
    it('should evict the oldest page when maxPages is exceeded', () => {
      const store = new PageStore({ maxPages: 2 });
      const page1 = store.create({ title: 'Page 1', html: '<p>1</p>' });
      store.create({ title: 'Page 2', html: '<p>2</p>' });
      store.create({ title: 'Page 3', html: '<p>3</p>' });

      expect(store.list()).toHaveLength(2);
      expect(store.get(page1.id)).toBeUndefined();
    });

    it('should create a tombstone for evicted pages', () => {
      const store = new PageStore({ maxPages: 1 });
      const page1 = store.create({ title: 'Page 1', html: '<p>1</p>' });
      store.create({ title: 'Page 2', html: '<p>2</p>' });

      const tombstones = store.listTombstones();
      expect(tombstones).toHaveLength(1);
      expect(tombstones[0]?.id).toBe(page1.id);
      expect(tombstones[0]?.title).toBe('Page 1');
    });

    it('should emit delete events for evicted pages', () => {
      const store = new PageStore({ maxPages: 1 });
      store.create({ title: 'Page 1', html: '<p>1</p>' });

      const events: Array<{ type: string; pageId: string }> = [];
      store.onChange(e => events.push(e));
      store.create({ title: 'Page 2', html: '<p>2</p>' });

      const deleteEvents = events.filter(e => e.type === 'delete');
      expect(deleteEvents).toHaveLength(1);
    });

    it('should not evict when maxPages is not set', () => {
      const store = new PageStore();
      for (let i = 0; i < 10; i += 1) {
        store.create({ title: `Page ${i}`, html: `<p>${i}</p>` });
      }

      expect(store.list()).toHaveLength(10);
    });
  });

  describe('tombstones', () => {
    it('should create a tombstone when a page is deleted', () => {
      const store = new PageStore();
      const page = store.create({ title: 'To Delete', html: '<p>bye</p>' });

      store.delete(page.id);

      const tombstones = store.listTombstones();
      expect(tombstones).toHaveLength(1);
      expect(tombstones[0]?.id).toBe(page.id);
      expect(tombstones[0]?.title).toBe('To Delete');
      expect(tombstones[0]?.deletedAt).toBeInstanceOf(Date);
    });

    it('should not create a tombstone for non-existent delete', () => {
      const store = new PageStore();

      store.delete('non-existent');

      expect(store.listTombstones()).toHaveLength(0);
    });

    it('should evict oldest tombstones when maxPages is exceeded', () => {
      const store = new PageStore({ maxPages: 2 });
      const page1 = store.create({ title: 'P1', html: '' });
      const page2 = store.create({ title: 'P2', html: '' });

      store.delete(page1.id);
      store.delete(page2.id);

      // Both tombstones within limit
      expect(store.listTombstones()).toHaveLength(2);

      // Create and delete a third to trigger tombstone eviction
      const page3 = store.create({ title: 'P3', html: '' });
      store.delete(page3.id);

      // Only the 2 most recent tombstones should remain
      expect(store.listTombstones()).toHaveLength(2);
      const ids = store.listTombstones().map(t => t.id);
      expect(ids).not.toContain(page1.id);
    });

    it('should return empty array when no tombstones exist', () => {
      const store = new PageStore();

      expect(store.listTombstones()).toEqual([]);
    });
  });

  describe('TTL cleanup', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should remove expired pages', () => {
      vi.useFakeTimers();
      // TTL=30s → cleanup interval = 15s (ttl/2 > MIN_CLEANUP_INTERVAL)
      const store = new PageStore({ ttl: 30_000 });

      store.create({ title: 'Expiring', html: '<p>bye</p>' });
      expect(store.list()).toHaveLength(1);

      // Timer fires at 15s (not expired), 30s (exactly TTL, not expired with >), 45s (expired)
      vi.advanceTimersByTime(46_000);

      expect(store.list()).toHaveLength(0);
      expect(store.listTombstones()).toHaveLength(1);

      store.dispose();
    });

    it('should not remove pages that are not expired', () => {
      vi.useFakeTimers();
      const store = new PageStore({ ttl: 30_000 });

      store.create({ title: 'Not Expiring', html: '<p>stay</p>' });

      // Advance to first cleanup tick (15s), but page not expired yet (30s TTL)
      vi.advanceTimersByTime(15_500);

      expect(store.list()).toHaveLength(1);

      store.dispose();
    });

    it('should use updatedAt for TTL calculation', () => {
      vi.useFakeTimers();
      // TTL=30s → cleanup interval = 15s
      const store = new PageStore({ ttl: 30_000 });

      const page = store.create({ title: 'Updated', html: '<p>original</p>' });

      // Advance 20s and update → updatedAt resets, expires at T=50s
      vi.advanceTimersByTime(20_000);
      store.update(page.id, { html: '<p>updated</p>' });

      // At T=30s (cleanup tick at 30s), page not expired (expires at 50s)
      vi.advanceTimersByTime(10_000);
      expect(store.list()).toHaveLength(1);

      // At T=60s (cleanup tick at 45s or 60s), page expired (50s < 60s)
      vi.advanceTimersByTime(30_000);
      expect(store.list()).toHaveLength(0);

      store.dispose();
    });

    it('should stop cleanup timer on dispose', () => {
      vi.useFakeTimers();
      const store = new PageStore({ ttl: 30_000 });

      store.create({ title: 'Persist', html: '<p>stay</p>' });
      store.dispose();

      vi.advanceTimersByTime(60_000);
      expect(store.list()).toHaveLength(1);
    });
  });

  describe('dispose', () => {
    it('should be safe to call dispose multiple times', () => {
      const store = new PageStore({ ttl: 1000 });

      expect(() => {
        store.dispose();
        store.dispose();
      }).not.toThrow();
    });

    it('should be safe to call dispose without ttl', () => {
      const store = new PageStore();

      expect(() => store.dispose()).not.toThrow();
    });
  });

  describe('change events', () => {
    it('should emit update event on update', () => {
      const store = new PageStore();
      const page = store.create({ title: 'Test', html: '<p>test</p>' });
      const events: Array<{ type: string; pageId: string }> = [];
      store.onChange(e => events.push(e));

      store.update(page.id, { title: 'Updated' });

      expect(events).toEqual([{ type: 'update', pageId: page.id }]);
    });

    it('should emit delete event on delete', () => {
      const store = new PageStore();
      const page = store.create({ title: 'Test', html: '<p>test</p>' });
      const events: Array<{ type: string; pageId: string }> = [];
      store.onChange(e => events.push(e));

      store.delete(page.id);

      expect(events).toEqual([{ type: 'delete', pageId: page.id }]);
    });

    it('should not emit delete event for non-existent page', () => {
      const store = new PageStore();
      const events: Array<{ type: string; pageId: string }> = [];
      store.onChange(e => events.push(e));

      store.delete('non-existent');

      expect(events).toEqual([]);
    });

    it('should emit update event on addScripts', () => {
      const store = new PageStore();
      const page = store.create({ title: 'Test', html: '' });
      const events: Array<{ type: string; pageId: string }> = [];
      store.onChange(e => events.push(e));

      store.addScripts(page.id, ['https://cdn.example.com/lib.js']);

      expect(events).toEqual([{ type: 'update', pageId: page.id }]);
    });

    it('should emit update event on addStylesheets', () => {
      const store = new PageStore();
      const page = store.create({ title: 'Test', html: '' });
      const events: Array<{ type: string; pageId: string }> = [];
      store.onChange(e => events.push(e));

      store.addStylesheets(page.id, ['https://cdn.example.com/style.css']);

      expect(events).toEqual([{ type: 'update', pageId: page.id }]);
    });

    it('should stop receiving events after offChange', () => {
      const store = new PageStore();
      const page = store.create({ title: 'Test', html: '' });
      const events: Array<{ type: string; pageId: string }> = [];
      const listener = (e: { type: string; pageId: string }): void => {
        events.push(e);
      };
      store.onChange(listener);

      store.update(page.id, { title: 'Updated' });
      store.offChange(listener);
      store.update(page.id, { title: 'Updated Again' });

      expect(events).toHaveLength(1);
    });
  });
});
