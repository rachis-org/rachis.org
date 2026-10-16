import assert from 'node:assert/strict';
import { test } from 'node:test';
import { thumbnailGroups, wrapIndex } from './visualization-gallery.ts';

test('catalog navigation wraps in either direction', () => {
  assert.equal(wrapIndex(-1, 9), 8);
  assert.equal(wrapIndex(9, 9), 0);
  assert.equal(wrapIndex(19, 9), 1);
});

test('each gallery selection shows every other entry once with adjacent neighbors beside the viewer', () => {
  for (const count of [1, 2, 3, 8, 9, 10, 13, 25]) {
    for (let active = 0; active < count; active++) {
      const { left, right } = thumbnailGroups(active, count);
      const neighbors = [...left, ...right];
      assert.equal(neighbors.length, count - 1);
      assert.equal(new Set(neighbors).size, count - 1);
      assert.ok(!neighbors.includes(active));
      assert.ok(Math.abs(left.length - right.length) <= 1);
      if (left.length) assert.equal(left[Math.ceil(left.length / 2) - 1], wrapIndex(active - 1, count));
      if (right.length) assert.equal(right[0], wrapIndex(active + 1, count));
    }
  }
});

test('larger catalogs extend two rows outward while preserving the clockwise order', () => {
  for (const count of [10, 11, 12, 13, 25]) {
    for (let active = 0; active < count; active++) {
      const { left, right } = thumbnailGroups(active, count);
      const leftColumns = Math.ceil(left.length / 2);
      const rightColumns = Math.ceil(right.length / 2);
      const clockwise = [
        active,
        ...right.slice(0, rightColumns),
        ...right.slice(rightColumns).reverse(),
        ...left.slice(leftColumns).reverse(),
        ...left.slice(0, leftColumns),
      ];
      assert.deepEqual(
        clockwise,
        Array.from({ length: count }, (_, offset) => wrapIndex(active + offset, count))
      );
    }
  }
});

test('two-by-two rails follow the requested clockwise ring through wraparound', () => {
  assert.deepEqual(thumbnailGroups(0, 9), { left: [7, 8, 6, 5], right: [1, 2, 4, 3] });
  assert.deepEqual(thumbnailGroups(1, 9), { left: [8, 0, 7, 6], right: [2, 3, 5, 4] });
  for (let active = 0; active < 9; active++) {
    const { left, right } = thumbnailGroups(active, 9);
    const clockwise = [active, right[0], right[1], right[3], right[2], left[3], left[2], left[0], left[1]];
    assert.deepEqual(
      clockwise,
      Array.from({ length: 9 }, (_, offset) => wrapIndex(active + offset, 9))
    );
  }
});
