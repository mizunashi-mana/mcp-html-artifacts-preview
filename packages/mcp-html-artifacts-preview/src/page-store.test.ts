import { describe, expect, it } from 'vitest';
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
});
