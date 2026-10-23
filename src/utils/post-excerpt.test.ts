import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getPostExcerpt } from './post-excerpt.ts';

test('extracts the first readable paragraph and decodes HTML as plain text', () => {
  assert.equal(
    getPostExcerpt({
      content:
        '<h2>Release</h2><p><img src="example.png"></p><p>QIIME <strong>2</strong> &amp; Rachis&nbsp;are here.<br>Explore <a href="/">what’s new</a>.</p><p>Later content.</p>',
    }),
    'QIIME 2 & Rachis are here. Explore what’s new.'
  );
});

test('skips quoted posts and non-editorial content', () => {
  assert.equal(
    getPostExcerpt({
      content:
        '<aside class="quote"><p>Earlier announcement</p></aside><blockquote><p>Quoted text</p></blockquote><script>hidden()</script><style>p{}</style><p>Our announcement.</p>',
    }),
    'Our announcement.'
  );
});

test('handles missing content and posts without paragraphs, and preserves an explicit excerpt', () => {
  assert.equal(getPostExcerpt({}), '');
  assert.equal(
    getPostExcerpt({ content: '<div>First block</div><div>Second &lt;block&gt;</div>' }),
    'First block Second <block>'
  );
  assert.equal(getPostExcerpt({ excerpt: ' Editorial summary ', content: '<p>Full post</p>' }), 'Editorial summary');
});

test('limits long paragraphs to 300 characters with an ellipsis at a word boundary', () => {
  const paragraph = 'A scientific result. '.repeat(40);
  const excerpt = getPostExcerpt({ content: `<p>${paragraph}</p>` });
  assert.ok(excerpt.length <= 300);
  assert.ok(excerpt.endsWith('…'));
  assert.ok(paragraph.startsWith(excerpt.slice(0, -1)));
  assert.equal(paragraph[excerpt.length - 1], ' ');
  assert.equal(Array.from(getPostExcerpt({ content: `<p>${'🧬'.repeat(400)}</p>` })).length, 300);
});
