import assert from 'node:assert/strict';
import { test } from 'node:test';
import { thumbnailGroups, wrapIndex } from './visualization-gallery.ts';

test('catalog navigation wraps in either direction', () => {
  assert.equal(wrapIndex(-1, 9), 8);
  assert.equal(wrapIndex(9, 9), 0);
  assert.equal(wrapIndex(19, 9), 1);
});

test('each gallery selection shows every other entry exactly once, in circular order', () => {
  for (const count of [1, 2, 9, 13]) {
    for (let active = 0; active < count; active++) {
      const { left, right } = thumbnailGroups(active, count);
      const neighbors = [...left, ...right];
      assert.equal(neighbors.length, count - 1);
      assert.equal(new Set(neighbors).size, count - 1);
      assert.ok(!neighbors.includes(active));
      assert.ok(Math.abs(left.length - right.length) <= 1);
      const ring = [...left, active, ...right];
      for (let index = 1; index < ring.length; index++) {
        assert.equal(ring[index], (ring[index - 1] + 1) % count);
      }
    }
  }
});

test('next moves the former active entry into the previous thumbnails', () => {
  assert.deepEqual(thumbnailGroups(0, 9), { left: [5, 6, 7, 8], right: [1, 2, 3, 4] });
  assert.deepEqual(thumbnailGroups(1, 9), { left: [6, 7, 8, 0], right: [2, 3, 4, 5] });
});
